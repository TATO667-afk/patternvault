import { requireLevel } from "@/lib/session";
import { topicsForLevel, findTopic } from "@/lib/curriculum";
import { aggregateTopics, overallAccuracy, topicStatus, type AttemptRow } from "@/lib/progress";

export const dynamic = "force-dynamic";

const VERDICT_LABEL: Record<string, string> = { correct: "נכון", incorrect: "שגוי", partial: "חלקי", unverified: "לא נבדק" };
const VERDICT_COLOR: Record<string, string> = { correct: "var(--good)", incorrect: "var(--bad)", partial: "var(--warn)", unverified: "var(--ink-soft)" };

export default async function Progress() {
  const { supabase, level } = await requireLevel();
  const { data: attemptsData } = await supabase
    .from("practice_attempts")
    .select("topic_id, verdict, verified, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  const attempts = (attemptsData ?? []) as (AttemptRow & { created_at: string })[];
  const { data: usage } = await supabase.from("ai_usage").select("kind").eq("kind", "hint");
  const { data: exams } = await supabase.from("mock_exams").select("level, total, correct, submitted_at").eq("status", "submitted").order("submitted_at", { ascending: false }).limit(10);

  const aggs = aggregateTopics(attempts);
  const topics = topicsForLevel(level);

  const stat = (v: string | number, l: string) => (
    <div className="card p-4"><div className="font-head font-bold text-2xl">{v}</div><div className="text-inksoft text-sm mt-0.5">{l}</div></div>
  );

  return (
    <div>
      <h1 className="font-head font-bold text-2xl mb-1">ההתקדמות שלי</h1>
      <p className="text-inksoft mb-5">מבוסס על הפעילות השמורה בחשבון שלכם</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stat(attempts.length, "שאלות תורגלו")}
        {stat(overallAccuracy(attempts) + "%", "אחוז הצלחה")}
        {stat(usage?.length ?? 0, "רמזים")}
        {stat(exams?.length ?? 0, "סימולציות")}
      </div>

      <h2 className="font-head font-bold text-lg mt-6 mb-2">ביצועים לפי נושא</h2>
      <div className="card p-4">
        {topics.filter((t) => aggs[t.id]?.attempts).length === 0 ? (
          <p className="text-inksoft text-sm">עדיין לא תרגלתם נושאים. התחילו מספריית הנושאים!</p>
        ) : (
          topics.filter((t) => aggs[t.id]?.attempts).map((t) => {
            const a = aggs[t.id];
            const pct = Math.round(a.rate * 100);
            const st = topicStatus(a);
            const color = pct >= 75 ? "var(--good)" : pct >= 45 ? "var(--brand)" : "var(--warn)";
            return (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
                <div className="flex-1 text-sm">{t.name} <span className="text-inksoft">· {st.label}</span></div>
                <div className="flex-[1.4] h-2 rounded-full bg-surface2 overflow-hidden"><div className="h-full rounded-full" style={{ width: pct + "%", background: color }} /></div>
                <div className="w-14 text-left font-head font-semibold text-sm tabular-nums">{a.correct}/{a.attempts}</div>
              </div>
            );
          })
        )}
      </div>

      <h2 className="font-head font-bold text-lg mt-6 mb-2">פעילות אחרונה</h2>
      <div className="card p-4">
        {attempts.length === 0 ? (
          <p className="text-inksoft text-sm">אין פעילות עדיין.</p>
        ) : (
          attempts.slice(0, 15).map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-line last:border-0 text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: VERDICT_COLOR[r.verdict] }} />
              <span>{r.topic_id === "exam" ? "סימולציה" : findTopic(level, r.topic_id)?.name || r.topic_id}</span>
              <span className="text-inksoft mr-auto">{VERDICT_LABEL[r.verdict]} · {new Date(r.created_at).toLocaleDateString("he-IL")}</span>
            </div>
          ))
        )}
      </div>

      {exams && exams.length > 0 && (
        <>
          <h2 className="font-head font-bold text-lg mt-6 mb-2">סימולציות</h2>
          <div className="card p-4">
            {exams.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-line last:border-0 text-sm">
                <span className="chip bg-surface2 text-inksoft">{e.level} יח״ל</span>
                <span>{e.correct}/{e.total} נכונות</span>
                <span className="text-inksoft mr-auto">{e.submitted_at ? new Date(e.submitted_at).toLocaleDateString("he-IL") : ""}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
