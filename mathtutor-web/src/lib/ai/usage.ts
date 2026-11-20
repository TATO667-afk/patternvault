import type { SupabaseClient } from "@supabase/supabase-js";

/** Durable per-user daily quota, enforced in the database (RLS-scoped).
 *  Records one row per AI call for monitoring and cost control. */
export async function checkAndTrackUsage(
  supabase: SupabaseClient,
  userId: string,
  kind: string
): Promise<{ ok: boolean; remaining: number }> {
  const limit = Number(process.env.AI_DAILY_CALL_LIMIT || 120);
  const dayStart = new Date().toISOString().slice(0, 10) + "T00:00:00Z";

  const { count } = await supabase
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", dayStart);

  const used = count ?? 0;
  if (used >= limit) return { ok: false, remaining: 0 };

  await supabase.from("ai_usage").insert({ user_id: userId, kind });
  return { ok: true, remaining: Math.max(0, limit - used - 1) };
}
