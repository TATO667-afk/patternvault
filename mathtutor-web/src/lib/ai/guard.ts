import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ai/ratelimit";
import { checkAndTrackUsage } from "@/lib/ai/usage";
import { hebrewError } from "@/lib/ai/anthropic";

export interface Guarded {
  user: User;
  supabase: SupabaseClient;
}

/** Every AI route runs through this: require auth, smooth bursts, enforce the
 *  daily quota, and only then allow the (paid) model call. */
export async function guardAi(kind: string): Promise<{ error: NextResponse } | Guarded> {
  let supabase: SupabaseClient;
  try {
    supabase = createClient();
  } catch {
    return { error: NextResponse.json({ error: "server_misconfigured", message: "השרת אינו מוגדר כראוי." }, { status: 500 }) };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "unauthorized", message: "נדרשת התחברות." }, { status: 401 }) };

  const rl = rateLimit(user.id + ":" + kind);
  if (!rl.ok) return { error: NextResponse.json({ error: "rate_limited", message: hebrewError("rate_limited") }, { status: 429 }) };

  const quota = await checkAndTrackUsage(supabase, user.id, kind);
  if (!quota.ok) return { error: NextResponse.json({ error: "quota", message: hebrewError("quota") }, { status: 429 }) };

  return { user, supabase };
}

export function aiErrorResponse(e: unknown): NextResponse {
  const code = (e as { code?: string })?.code || "upstream_error";
  const status = code === "auth" || code === "missing_key" ? 503 : code === "rate_limited" ? 429 : 400;
  return NextResponse.json({ error: code, message: hebrewError(code) }, { status });
}
