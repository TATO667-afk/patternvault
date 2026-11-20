import { runCheck, type MathCheck } from "@/lib/math/verify";
import type { Evaluation, Level, Verdict } from "@/lib/types";
import { topicsForLevel, diffWord } from "@/lib/curriculum";

/** Deterministic-first resolution of a student answer. The CAS verdict, when
 *  available, overrides the LLM's self-assessment — the LLM is NEVER treated
 *  as a source of mathematical verification. */
export interface ResolvedVerdict {
  verdict: Verdict;
  verified: boolean; // true only when the deterministic engine confirmed/denied
  cls: "ok" | "bad" | "partial" | "uncertain";
  label: string;
  message?: string;
}

export function resolveVerdict(evaluation: Evaluation | undefined, check: MathCheck | null | undefined): ResolvedVerdict {
  const det = check ? runCheck(check) : null;
  if (det && det.status === "verified") return { verdict: "correct", verified: true, cls: "ok", label: "✓ נכון · אומת מתמטית", message: det.message };
  if (det && det.status === "failed") return { verdict: "incorrect", verified: true, cls: "bad", label: "✗ טעות · אומת מתמטית", message: det.message };
  switch (evaluation) {
    case "correct":
      return { verdict: "correct", verified: false, cls: "ok", label: "✓ נכון (הערכת AI)" };
    case "alt_method":
      return { verdict: "correct", verified: false, cls: "ok", label: "✓ שיטה חלופית תקינה" };
    case "partial":
      return { verdict: "partial", verified: false, cls: "partial", label: "◐ חלקית נכון" };
    case "incorrect":
      return { verdict: "incorrect", verified: false, cls: "bad", label: "✗ לא נכון (הערכת AI)" };
    default:
      return { verdict: "unverified", verified: false, cls: "uncertain", label: "❔ לא נבדק אוטומטית" };
  }
}

export interface AttemptRow {
  topic_id: string;
  verdict: Verdict;
  verified: boolean;
  created_at?: string;
}

export interface TopicAgg {
  topicId: string;
  attempts: number;
  correct: number;
  verifiedCorrect: number;
  rate: number;
  mastered: boolean;
}

/** Mastery requires sustained success, not a single lucky answer. */
export function isMastered(attempts: number, correct: number): boolean {
  return attempts >= 4 && correct / attempts >= 0.8;
}

export function aggregateTopics(rows: AttemptRow[]): Record<string, TopicAgg> {
  const out: Record<string, TopicAgg> = {};
  for (const r of rows) {
    const a = out[r.topic_id] || (out[r.topic_id] = { topicId: r.topic_id, attempts: 0, correct: 0, verifiedCorrect: 0, rate: 0, mastered: false });
    a.attempts++;
    if (r.verdict === "correct") {
      a.correct++;
      if (r.verified) a.verifiedCorrect++;
    }
  }
  for (const id in out) {
    const a = out[id];
    a.rate = a.attempts ? a.correct / a.attempts : 0;
    a.mastered = isMastered(a.attempts, a.correct);
  }
  return out;
}

export function overallAccuracy(rows: AttemptRow[]): number {
  if (!rows.length) return 0;
  const correct = rows.filter((r) => r.verdict === "correct").length;
  return Math.round((correct / rows.length) * 100);
}

export type TopicStatusKey = "new" | "attempted" | "mastered";
export function topicStatus(agg: TopicAgg | undefined): { key: TopicStatusKey; label: string } {
  if (!agg || !agg.attempts) return { key: "new", label: "טרם נוסה" };
  if (agg.mastered) return { key: "mastered", label: "נשלט" };
  return { key: "attempted", label: "בתהליך" };
}

export function strongestTopics(aggs: Record<string, TopicAgg>, min = 2, n = 3): TopicAgg[] {
  return Object.values(aggs).filter((a) => a.attempts >= min).sort((a, b) => b.rate - a.rate).slice(0, n);
}
export function weakestTopics(aggs: Record<string, TopicAgg>, min = 2, n = 3): TopicAgg[] {
  return Object.values(aggs).filter((a) => a.attempts >= min).sort((a, b) => a.rate - b.rate).slice(0, n);
}

/** Adaptive difficulty: up after success, down after a miss, clamped 1..3. */
export function nextDifficulty(current: number, verdict: Verdict): number {
  if (verdict === "correct" && current < 3) return current + 1;
  if (verdict === "incorrect" && current > 1) return current - 1;
  return current;
}

export function suggestNext(level: Level, aggs: Record<string, TopicAgg>): { topicId: string; diff: number; reason: string } | null {
  const topics = topicsForLevel(level);
  if (!topics.length) return null;
  const withData = topics.filter((t) => aggs[t.id] && aggs[t.id].attempts >= 1);
  const weakest = withData.slice().sort((a, b) => (aggs[a.id].rate - aggs[b.id].rate))[0];
  if (weakest && aggs[weakest.id].rate < 0.75) return { topicId: weakest.id, diff: weakest.diff, reason: "כאן יש הכי הרבה מקום לשיפור" };
  const fresh = topics.find((t) => !(aggs[t.id] && aggs[t.id].attempts));
  if (fresh) return { topicId: fresh.id, diff: fresh.diff, reason: "נושא חדש שעוד לא תרגלתם" };
  return { topicId: topics[0].id, diff: topics[0].diff, reason: "המשיכו לתרגל כדי לשמר את הרמה" };
}

export { diffWord };
