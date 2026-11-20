import Link from "next/link";
import { requireLevel } from "@/lib/session";
import { topicsForLevel, diffWord } from "@/lib/curriculum";
import { aggregateTopics, topicStatus, type AttemptRow } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function Library() {
  const { supabase, level } = await requireLevel();
  const { data } = await supabase.from("practice_attempts").select("topic_id, verdict, verified").limit(1000);
  const aggs = aggregateTopics((data ?? []) as AttemptRow[]);
  const topics = topicsForLevel(level);

  const statusColor: Record<string, string> = { mastered: "text-good", attempted: "text-accent", new: "text-inksoft" };

  return (
    <div>
      <h1 className="font-head font-bold text-2xl mb-1">ספריית נושאים</h1>
      <p className="text-inksoft mb-4">רמה {level} יח״ל · {topics.length} נושאים</p>
      <div className="bg-accentsoft rounded-xl p-3 text-sm mb-5">
        מיפוי התוכנית כאן הוא <b>ראשוני</b> ומבוסס על מבנה השאלונים המוכר (3 יח״ל: 35182/35381/35382 · 4 יח״ל: 35481/35482 · 5 יח״ל: 35581/35582).
        אינו תחליף לסילבוס הרשמי של המפמ״ר — יש לאמת מול אתר משרד החינוך.
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {topics.map((t) => {
          const st = topicStatus(aggs[t.id]);
          const diffCls = t.diff >= 3 ? "bg-badsoft text-bad" : t.diff === 2 ? "bg-accentsoft text-accent" : "bg-goodsoft text-good";
          return (
            <div key={t.id} className="card p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-head font-semibold">{t.name}</h3>
                <span className={"chip " + diffCls}>{diffWord(t.diff)}</span>
              </div>
              <p className="text-inksoft text-sm flex-1">{t.desc}</p>
              <p className="text-inksoft text-xs">כולל: {t.subs.join(" · ")}</p>
              <p className={"font-head font-semibold text-xs " + statusColor[st.key]}>{st.label}</p>
              <div className="flex gap-2 mt-1">
                <Link href={`/practice?topic=${t.id}&diff=${t.diff}`} className="chip bg-brand text-white px-3 py-2">תרגול</Link>
                <Link href={`/tutor?topic=${t.id}`} className="chip bg-surface2 text-ink px-3 py-2">מורה מודרך</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
