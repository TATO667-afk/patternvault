import Link from "next/link";
import { requireLevel } from "@/lib/session";
import { topicsForLevel, findTopic, diffWord } from "@/lib/curriculum";
import { aggregateTopics, overallAccuracy, strongestTopics, weakestTopics, suggestNext, topicStatus, type AttemptRow } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { supabase, level } = await requireLevel();

  const { data: attemptsData } = await supabase
    .from("practice_attempts")
    .select("topic_id, verdict, verified, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  const attempts = (attemptsData ?? []) as AttemptRow[];
  const { data: exams } = await supabase.from("mock_exams").select("level, total, correct, submitted_at").eq("status", "submitted").order("submitted_at", { ascending: false }).limit(5);

  const aggs = aggregateTopics(attempts);
  const topics = topicsForLevel(level);
  const attemptedCount = topics.filter((t) => topicStatus(aggs[t.id]).key !== "new").length;
  const masteredCount = topics.filter((t) => aggs[t.id]?.mastered).length;
  const accuracy = overallAccuracy(attempts);
  const strong = strongestTopics(aggs);
  const weak = weakestTopics(aggs);
  const next = suggestNext(level, aggs);
  const nextTopic = next ? findTopic(level, next.topicId) : null;

  const stat = (v: string | number, l: string) => (
    <div className="card p-4">
      <div className="font-head font-bold text-2xl">{v}</div>
      <div className="text-inksoft text-sm mt-0.5">{l}</div>
    </div>
  );
  const bar = (name: string, rate: number) => {
    const pct = Math.round(rate * 100);
    const color = pct >= 75 ? "var(--good)" : pct >= 45 ? "var(--brand)" : "var(--warn)";
    return (
      <div key={name} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
        <div className="flex-1 text-sm">{name}</div>
        <div className="flex-[1.4] h-2 rounded-full bg-surface2 overflow-hidden"><div className="h-full rounded-full" style={{ width: pct + "%", background: color }} /></div>
        <div className="w-14 text-left font-head font-semibold text-sm tabular-nums">{pct}%</div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="font-head font-bold text-2xl mb-1">לוח בקרה</h1>
      <p className="text-inksoft mb-5">מסלול ההכנה שלכם לבגרות {level} יח״ל</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stat(`${attemptedCount}/${topics.length}`, "נושאים שנוסו")}
        {stat(masteredCount, "נושאים בשליטה")}
        {stat(attempts.length, "שאלות שתורגלו")}
        {stat(accuracy + "%", "אחוז הצלחה")}
      </div>

      {nextTopic && next && (
        <>
          <h2 className="font-head font-bold text-lg mt-6 mb-2">מומלץ לתרגל עכשיו</h2>
          <div className="card p-4">
            <div className="font-head font-semibold text-lg">{nextTopic.name}</div>
            <div className="text-inksoft text-sm mt-1">רמת קושי מומלצת: {diffWord(next.diff)} · {next.reason}</div>
            <Link href={`/practice?topic=${nextTopic.id}&diff=${next.diff}`} className="btn-primary mt-3">התחילו תרגול</Link>
          </div>
        </>
      )}

      {strong.length > 0 && (
        <>
          <h2 className="font-head font-bold text-lg mt-6 mb-2">הנושאים החזקים שלכם</h2>
          <div className="card p-4">{strong.map((a) => bar(findTopic(level, a.topicId)?.name || a.topicId, a.rate))}</div>
        </>
      )}
      {weak.length > 0 && (
        <>
          <h2 className="font-head font-bold text-lg mt-6 mb-2">כדאי לחזק</h2>
          <div className="card p-4">{weak.map((a) => bar(findTopic(level, a.topicId)?.name || a.topicId, a.rate))}</div>
        </>
      )}

      {exams && exams.length > 0 && (
        <>
          <h2 className="font-head font-bold text-lg mt-6 mb-2">סימולציות אחרונות</h2>
          <div className="card p-4">
            {exams.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-line last:border-0 text-sm">
                <span className="chip bg-surface2 text-inksoft">{e.level} יח״ל</span>
                <span className="font-head font-semibold mr-auto">{e.correct}/{e.total}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-2 flex-wrap mt-6">
        <Link href="/library" className="btn-ghost">כל הנושאים</Link>
        <Link href="/exam" className="btn-ghost">סימולציית בגרות</Link>
        <Link href="/progress" className="btn-ghost">ההתקדמות שלי</Link>
      </div>
    </div>
  );
}
