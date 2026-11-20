"use client";
import { useEffect, useRef, useState } from "react";
import MathText from "@/components/MathText";
import { SpeakButton } from "@/components/Speak";
import { postJson } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Level, TutorTurn } from "@/lib/types";
import type { ResolvedVerdict } from "@/lib/progress";

type Turn = { role: "user" | "assistant"; content: string };
type ViewMsg = { role: "user" | "assistant"; content: string; voice?: string; verdict?: ResolvedVerdict | null };

const CHIP: Record<string, string> = { ok: "bg-goodsoft text-good", bad: "bg-badsoft text-bad", partial: "bg-warnsoft text-warn", uncertain: "bg-surface2 text-inksoft" };
const OPENING = "התלמיד הביא את הבעיה. פתח את השיעור: משפט קצר ומעודד על מה נעשה יחד, ואז שאל את השאלה הראשונה בלבד. אל תפתור.";

export default function TutorClient({
  level,
  initialProblem,
  resumeSessionId,
  sessions,
}: {
  level: Level;
  initialProblem: string;
  resumeSessionId: string;
  sessions: { id: string; problem: string; status: string; updated_at: string }[];
}) {
  const [problem, setProblem] = useState(initialProblem);
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [explain, setExplain] = useState<"simple" | "regular" | "advanced">("regular");
  const [convo, setConvo] = useState<Turn[]>([]);
  const [view, setView] = useState<ViewMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [ended, setEnded] = useState(false);
  const [err, setErr] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resumeSessionId) void resume(resumeSessionId);
    // eslint-disable-next-line
  }, []);
  useEffect(() => { scroller.current?.scrollTo(0, scroller.current.scrollHeight); }, [view, busy]);

  async function persistMessage(sid: string, role: "user" | "assistant", content: string, verdict?: ResolvedVerdict | null) {
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.from("tutoring_messages").insert({
        session_id: sid, user_id: u.user.id, role, content,
        evaluation: null, verdict: verdict?.verdict ?? null, verified: verdict?.verified ?? false,
      });
      await supabase.from("tutoring_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sid);
    } catch { /* ignore */ }
  }

  async function resume(sid: string) {
    try {
      const supabase = createClient();
      const { data: s } = await supabase.from("tutoring_sessions").select("problem, status").eq("id", sid).single();
      const { data: msgs } = await supabase.from("tutoring_messages").select("role, content, verdict, verified").eq("session_id", sid).order("created_at", { ascending: true });
      if (!s || !msgs) return;
      setProblem(s.problem);
      setSessionId(sid);
      setStarted(true);
      setEnded(s.status === "done");
      const v: ViewMsg[] = msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      setView(v);
      setConvo(msgs.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })));
    } catch { /* ignore */ }
  }

  async function callTutor(nextConvo: Turn[], sid: string) {
    setBusy(true); setErr("");
    const r = await postJson<{ turn: TutorTurn; verdict: ResolvedVerdict | null }>("/api/ai/tutor", { problem, explainLevel: explain, turns: nextConvo });
    setBusy(false);
    if (!r.ok || !r.data) { setErr(r.message || "המורה לא זמין כרגע."); return; }
    const t = r.data.turn;
    setConvo((c) => [...c, { role: "assistant", content: t.text }]);
    setView((v) => [...v, { role: "assistant", content: t.text, voice: t.voice, verdict: r.data!.verdict }]);
    await persistMessage(sid, "assistant", t.text, r.data.verdict);
    if (t.phase === "done") {
      setEnded(true);
      try { const supabase = createClient(); await supabase.from("tutoring_sessions").update({ status: "done" }).eq("id", sid); } catch { /* ignore */ }
    }
  }

  async function start() {
    const p = problem.trim();
    if (!p) return;
    let sid = "";
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data } = await supabase.from("tutoring_sessions").insert({ user_id: u.user.id, problem: p, level, explain_level: explain, mode: "guided" }).select("id").single();
        sid = data?.id || "";
      }
    } catch { /* ignore — still works in-memory without persistence */ }
    setSessionId(sid); setStarted(true); setEnded(false); setView([]);
    const base: Turn[] = [{ role: "user", content: OPENING }];
    setConvo(base);
    await callTutor(base, sid);
  }

  async function send() {
    const text = input.trim();
    if (!text || ended) return;
    setInput("");
    const next: Turn[] = [...convo, { role: "user", content: text }];
    setConvo(next);
    setView((v) => [...v, { role: "user", content: text }]);
    if (sessionId) await persistMessage(sessionId, "user", text);
    await callTutor(next, sessionId);
  }

  async function hint(lvl: 1 | 2 | 3) {
    if (ended) return;
    const map: Record<number, string> = {
      1: "אני צריך רמז עדין — כיוון מחשבה כללי בלבד, בלי לפתור.",
      2: "אני צריך רמז ממוקד — על הצעד הבא, בלי לבצע אותו עד הסוף.",
      3: "אני צריך הכוונה מפורטת לצעד הנוכחי, בלי לחשוף את התשובה הסופית.",
    };
    const text = map[lvl];
    const next: Turn[] = [...convo, { role: "user", content: text }];
    setConvo(next);
    setView((v) => [...v, { role: "user", content: "💡 " + text }]);
    if (sessionId) await persistMessage(sessionId, "user", "💡 " + text);
    await callTutor(next, sessionId);
  }

  if (!started) {
    return (
      <div>
        <h1 className="font-head font-bold text-2xl mb-3">מורה מודרך</h1>
        <div className="card p-4">
          <label className="label">איזו בעיה נפתור יחד?</label>
          <textarea className="input min-h-[80px]" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="לדוגמה: פתרו את המשוואה 2x² − 8x + 6 = 0" />
          <div className="flex gap-3 items-end mt-3 flex-wrap">
            <div>
              <label className="label">רמת הסבר</label>
              <select className="input" value={explain} onChange={(e) => setExplain(e.target.value as "simple" | "regular" | "advanced")}>
                <option value="simple">פשוט</option><option value="regular">רגיל</option><option value="advanced">מתקדם</option>
              </select>
            </div>
            <button className="btn-primary" onClick={start} disabled={!problem.trim()}>התחילו שיעור</button>
          </div>
        </div>

        {sessions.length > 0 && (
          <>
            <h2 className="font-head font-bold text-lg mt-6 mb-2">שיעורים קודמים</h2>
            <div className="card p-2">
              {sessions.map((s) => (
                <button key={s.id} onClick={() => resume(s.id)} className="w-full text-right p-3 rounded-lg hover:bg-surface2 flex items-center gap-2">
                  <span className="flex-1 truncate text-sm">{s.problem}</span>
                  <span className="chip bg-surface2 text-inksoft">{s.status === "done" ? "הושלם" : "פעיל"}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-head font-bold text-2xl">מורה מודרך</h1>
        <button className="chip bg-surface2 text-inksoft" onClick={() => { setStarted(false); setConvo([]); setView([]); setSessionId(""); }}>שיעור חדש</button>
      </div>
      <div className="card overflow-hidden">
        <div className="bg-surface2 px-4 py-3 border-b border-line text-sm"><b>הבעיה:</b> {problem}</div>
        <div ref={scroller} className="p-4 flex flex-col gap-3 max-h-[460px] overflow-y-auto">
          {view.map((m, i) => (
            <div key={i} className={"flex gap-2 max-w-[92%] " + (m.role === "assistant" ? "self-start" : "self-end flex-row-reverse")}>
              <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: m.role === "assistant" ? "var(--brand-soft)" : "var(--surface-2)" }}>{m.role === "assistant" ? "🧑‍🏫" : "🙂"}</div>
              <div className="flex flex-col gap-1 min-w-0">
                {m.role === "assistant" && (m.verdict || m.voice) && (
                  <div className="flex items-center gap-2">
                    {m.verdict && <span className={"chip " + CHIP[m.verdict.cls]}>{m.verdict.label}</span>}
                    {m.voice && <SpeakButton text={m.voice} />}
                  </div>
                )}
                <div className={"rounded-xl2 px-3 py-2 text-sm " + (m.role === "assistant" ? "bg-surface2" : "bg-brand text-white")}>
                  <MathText>{m.content}</MathText>
                </div>
              </div>
            </div>
          ))}
          {busy && <div className="self-start text-inksoft text-sm">המורה חושב…</div>}
        </div>
        <div className="border-t border-line p-3 flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-inksoft text-xs">צריך עזרה?</span>
            <button className="chip bg-surface2 text-ink px-3 py-1.5" onClick={() => hint(1)} disabled={busy || ended}>רמז עדין</button>
            <button className="chip bg-surface2 text-ink px-3 py-1.5" onClick={() => hint(2)} disabled={busy || ended}>רמז ממוקד</button>
            <button className="chip bg-surface2 text-ink px-3 py-1.5" onClick={() => hint(3)} disabled={busy || ended}>הסבר מודרך</button>
          </div>
          {err && <p className="text-bad text-sm">{err}</p>}
          {ended && <p className="text-good text-sm">השיעור הושלם — כל הכבוד! 🎉</p>}
          <div className="flex gap-2 items-end">
            <textarea className="input min-h-[46px]" rows={1} value={input} disabled={busy || ended}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              placeholder="כתבו את התשובה או השאלה שלכם…" />
            <button className="btn-primary px-4" onClick={send} disabled={busy || ended || !input.trim()}>שלח</button>
          </div>
        </div>
      </div>
    </div>
  );
}
