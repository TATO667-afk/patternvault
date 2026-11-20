-- ============================================================================
-- MathTutor — initial schema
-- Every table carries user_id and is protected by Row Level Security so a
-- student can only ever read or write their OWN learning data. Authorization
-- never relies on the frontend.
-- ============================================================================

-- ---- Profiles -------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  level         text check (level in ('3','4','5')),
  preferences   jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Questions (saved / generated) ---------------------------------------
create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  level       text,
  topic_id    text,
  question    text not null,
  answer_text text,
  check_json  jsonb,
  source      text not null default 'generated',  -- generated | typed | image
  created_at  timestamptz not null default now()
);

-- ---- Tutoring sessions + messages ----------------------------------------
create table if not exists public.tutoring_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  problem       text not null,
  topic_id      text,
  level         text,
  explain_level text not null default 'regular',
  mode          text not null default 'guided',   -- guided | full
  status        text not null default 'active',    -- active | done
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.tutoring_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.tutoring_sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user','assistant','hint')),
  content     text not null,
  evaluation  text,
  verdict     text,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---- Practice attempts ----------------------------------------------------
create table if not exists public.practice_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  topic_id    text not null,
  session_id  uuid references public.tutoring_sessions(id) on delete set null,
  question    text,
  answer      text,
  verdict     text not null check (verdict in ('correct','partial','incorrect','unverified')),
  verified    boolean not null default false,
  evaluation  text,
  created_at  timestamptz not null default now()
);

-- ---- Topic progress (aggregate, maintained by trigger) -------------------
create table if not exists public.topic_progress (
  user_id          uuid not null references auth.users(id) on delete cascade,
  topic_id         text not null,
  attempts         int  not null default 0,
  correct          int  not null default 0,
  verified_correct int  not null default 0,
  mastered         boolean not null default false,
  updated_at       timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create or replace function public.apply_attempt_to_progress()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  a int; c int;
begin
  insert into public.topic_progress (user_id, topic_id, attempts, correct, verified_correct)
  values (new.user_id, new.topic_id, 1,
          case when new.verdict = 'correct' then 1 else 0 end,
          case when new.verdict = 'correct' and new.verified then 1 else 0 end)
  on conflict (user_id, topic_id) do update
    set attempts = public.topic_progress.attempts + 1,
        correct  = public.topic_progress.correct + case when new.verdict = 'correct' then 1 else 0 end,
        verified_correct = public.topic_progress.verified_correct + case when new.verdict = 'correct' and new.verified then 1 else 0 end,
        updated_at = now();

  select attempts, correct into a, c from public.topic_progress
    where user_id = new.user_id and topic_id = new.topic_id;
  update public.topic_progress
    set mastered = (a >= 4 and c::numeric / a >= 0.8)
    where user_id = new.user_id and topic_id = new.topic_id;
  return new;
end;
$$;

drop trigger if exists trg_apply_attempt on public.practice_attempts;
create trigger trg_apply_attempt
  after insert on public.practice_attempts
  for each row execute function public.apply_attempt_to_progress();

-- ---- Mock exams + answers -------------------------------------------------
create table if not exists public.mock_exams (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  level         text not null,
  total         int  not null,
  correct       int,
  questions     jsonb not null default '[]'::jsonb,
  status        text not null default 'active',  -- active | submitted
  started_at    timestamptz not null default now(),
  submitted_at  timestamptz
);

create table if not exists public.exam_answers (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid not null references public.mock_exams(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  idx         int  not null,
  answer      text,
  verdict     text,
  verified    boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (exam_id, idx)
);

-- ---- AI usage (cost control / monitoring) --------------------------------
create table if not exists public.ai_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,
  created_at  timestamptz not null default now()
);

-- ---- Indexes --------------------------------------------------------------
create index if not exists idx_questions_user on public.questions(user_id, created_at desc);
create index if not exists idx_sessions_user on public.tutoring_sessions(user_id, updated_at desc);
create index if not exists idx_messages_session on public.tutoring_messages(session_id, created_at);
create index if not exists idx_attempts_user on public.practice_attempts(user_id, created_at desc);
create index if not exists idx_attempts_user_topic on public.practice_attempts(user_id, topic_id);
create index if not exists idx_exams_user on public.mock_exams(user_id, started_at desc);
create index if not exists idx_examans_exam on public.exam_answers(exam_id, idx);
create index if not exists idx_usage_user_time on public.ai_usage(user_id, created_at);

-- ============================================================================
-- Row Level Security — owner-only access on every table
-- ============================================================================
alter table public.profiles           enable row level security;
alter table public.questions          enable row level security;
alter table public.tutoring_sessions  enable row level security;
alter table public.tutoring_messages  enable row level security;
alter table public.practice_attempts  enable row level security;
alter table public.topic_progress     enable row level security;
alter table public.mock_exams         enable row level security;
alter table public.exam_answers       enable row level security;
alter table public.ai_usage           enable row level security;

-- profiles: owner can see/update own row (insert handled by trigger).
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Generic owner policies for user_id-scoped tables.
do $$
declare t text;
begin
  foreach t in array array[
    'questions','tutoring_sessions','tutoring_messages','practice_attempts',
    'topic_progress','mock_exams','exam_answers','ai_usage'
  ]
  loop
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id);', t||'_sel', t);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id);', t||'_ins', t);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t||'_upd', t);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id);', t||'_del', t);
  end loop;
end $$;
