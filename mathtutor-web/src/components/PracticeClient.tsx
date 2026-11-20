"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MathText from "@/components/MathText";
import { SpeakButton } from "@/components/Speak";
import { postJson } from "@/lib/api";
import { topicsForLevel, findTopic, diffWord } from "@/lib/curriculum";
import type { Level, GeneratedQuestion, AnswerEvaluation, SolveResult } from "@/lib/types";
import type { ResolvedVerdict } from "@/lib/progress";
import type { VerifyResult } from "@/lib/math/verify";

// Inlined (pure) so the client bundle never pulls in the server-side CAS.
function nextDifficulty(current: number, verdict: string): number {
  if (verdict === "correct" && current < 3) return current + 1;
  if (verdict === "incorrect" && current > 1) return current - 1;
  return current;
}

const CHIP: Record<string, string> = { ok: "bg-goodsoft text-good", bad: "bg-badsoft text-bad", partial: "bg-warnsoft text-warn", uncertain: "bg-surface2 text-inksoft" };

export default function PracticeClient({ level, initialTopicId, initialDiff }: { level: Level; initialTopicId: string; initialDiff: number }) {
  const topics = topicsForLevel(level);
  const [topicId, setTopicId] = useState(initialTopicId || topics[0]?.id || "");
  const [diff, setDiff] = useState(initialDiff || findTopic(level, initialTopicId)?.diff || topics[0]?.diff || 1);
  const topic = findTopic(level, topicId);

  const [q, setQ] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{ ev: AnswerEvaluation; verdict: ResolvedVerdict } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hints, setHints] = useState<{ level: number; text: string; say: string }[]>([]);
  const [hintBusy, setHintBusy] = useState(false);
  const [adaptNote, setAdaptNote] = useState("");
  const [solve, setSolve] = useState<(SolveResult & { verify: VerifyResult }) | null>(null);
  const [solveBusy, setSolveBusy] = useState(false);

  const generate = useCallback(async () => {
    if (!topicId) return;
    setLoading(true); setErr(""); setQ(null); setResult(null); setHints([]); setAnswer(""); setAdaptNote(""); setSolve(null);
    const r = await postJson<GeneratedQuestion>("/api/ai/generate", { level, topicId, diff });
    setLoading(false);
    if (!r.ok || !r.data) { setErr(r.message || "יצירת השאלה נכשלה."); return; }
    setQ(r.data);
  }, [level, topicId, diff]);

  useEffect(() => { if (initialTopicId) generate(); /* eslint-disable-next-line */ }, []);

  async function submit() {
    if (!q || !answer.trim()) return;
    setSubmitting(true); setErr("");
    const r = await postJson<{ evaluation: AnswerEvaluation; verdict: ResolvedVerdict }>("/api/ai/evaluate", { question: q.question, answer, topicId });
    setSubmitting(false);
    if (!r.ok || !r.data) { setErr(r.message || "הבדיקה נכשלה."); return; }
    setResult({ ev: r.data.evaluation, verdict: r.data.verdict });
    const nd = nextDifficulty(diff, r.data.verdict.verdict);
    if (nd !== diff) { setDiff(nd); setAdaptNote(nd > diff ? "העלינו את רמת הקושי לשאלה הבאה 👏" : "הורדנו מעט את רמת הקושי לשאלה הבאה."); }
  }

  async function getHint() {
    if (!q) return;
    const lvl = Math.min(3, hints.length + 1) as 1 | 2 | 3;
    setHintBusy(true);
    const r = await postJson<{ hint: string; say: string }>("/api/ai/hint", { question: q.question, level: lvl });
    setHintBusy(false);
    if (r.ok && r.data) setHints((h) => [...h, { level: lvl, text: r.data!.hint, say: r.data!.say }]);
  }

  async function fullSolution() {
    if (!q) return;
    setSolveBusy(true);
    const r = await postJson<SolveResult & { verify: VerifyResult }>("/api/ai/solve", { problem: q.question });
    setSolveBusy(false);
    if (r.ok && r.data) setSolve(r.data);
  }

  return (
    <div>
      <h1 className="font-head font-bold text-2xl mb-3">תרגול</h1>

      <div className="card p-4 flex flex-wrap gap-3 items-end mb-4">
        <div className="flex-1 min-w-[180px]">
          <label className="label">נושא</label>
          <select className="input" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">קושי</label>
          <select className="input" value={diff} onChange={(e) => setDiff(Number(e.target.value))}>
            <option value={1}>קל</option><option value={2}>בינוני</option><option value={3}>מתקדם</option>
          </select>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? "יוצר…" : "שאלה חדשה"}</button>
      </div>

      {err && <div className="bg-badsoft text-bad rounded-xl p-3 mb-4 text-sm">{err}</div>}

      {q && (
        <div className="card p-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="font-head font-semibold">{topic?.name}</div>
            <span className="chip bg-brandsoft text-brand">קושי: {diffWord(diff)}</span>
          </div>
          <MathText block className="bg-surface2 rounded-xl p-3">{q.question}</MathText>
          <textarea className="input mt-3 min-h-[70px]" placeholder="כתבו כאן את התשובה שלכם…" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <div className="flex gap-2 flex-wrap mt-3">
            <button className="btn-primary" onClick={submit} disabled={submitting || !answer.trim()}>{submitting ? "בודק…" : "בדקו את התשובה"}</button>
            <button className="btn-ghost" onClick={getHint} disabled={hintBusy || hints.length >= 3}>{hintBusy ? "…" : hints.length >= 3 ? "אין עוד רמזים" : "רמז"}</button>
            <button className="btn-ghost" onClick={fullSolution} disabled={solveBusy}>{solveBusy ? "…" : "פתרון מלא"}</button>
            <Link className="btn-ghost" href={`/tutor?q=${encodeURIComponent(q.question)}`}>מורה מודרך</Link>
          </div>

          {hints.map((h, i) => (
            <div key={i} className="bg-brandsoft rounded-xl p-3 mt-3 text-sm">
              <div className="font-head font-semibold text-brand mb-1 flex items-center gap-2">רמז {h.level}<SpeakButton text={h.say || h.text} /></div>
              <MathText>{h.text}</MathText>
            </div>
          ))}

          {result && (
            <div className="mt-4">
              <span className={"chip " + CHIP[result.verdict.cls]}>{result.verdict.label}</span>
              <div className="bg-surface2 rounded-xl p-3 mt-2">
                <div className="flex items-center gap-2"><SpeakButton text={result.ev.say || result.ev.feedback} /><div className="flex-1"><MathText>{result.ev.feedback}</MathText></div></div>
                {result.verdict.message && <p className="text-inksoft text-xs mt-1">{result.verdict.message}</p>}
              </div>
              {adaptNote && <p className="text-inksoft text-sm mt-2">{adaptNote}</p>}
            </div>
          )}

          {solve && (
            <div className="mt-5 border-t border-line pt-4">
              <h3 className="font-head font-bold mb-2">פתרון מלא</h3>
              {solve.steps.map((s, i) => (
                <div key={i} className="card p-3 mb-2">
                  <div className="font-head font-semibold text-sm">{i + 1}. {s.title}</div>
                  {s.latex && <MathText block className="bg-surface2 rounded-lg p-2 mt-2">{`\\(${s.latex}\\)`}</MathText>}
                  <div className="text-inksoft text-sm mt-1 flex items-start gap-2"><SpeakButton text={s.say || s.text} /><div className="flex-1"><MathText>{s.text}</MathText></div></div>
                </div>
              ))}
              <div className="card p-3 flex items-center gap-2">
                <span className="chip bg-brand text-white">התשובה</span>
                <MathText>{solve.answer}</MathText>
              </div>
              <div className={"chip mt-2 inline-block " + (solve.verify.status === "verified" ? "bg-goodsoft text-good" : solve.verify.status === "failed" ? "bg-badsoft text-bad" : "bg-surface2 text-inksoft")}>
                {solve.verify.status === "verified" ? "✓ אומת מתמטית" : solve.verify.status === "failed" ? "⚠ האימות מצביע על אי-התאמה" : "הסבר AI — לא אומת אוטומטית"}
              </div>
            </div>
          )}
        </div>
      )}

      {!q && !loading && <p className="text-inksoft">בחרו נושא ולחצו &quot;שאלה חדשה&quot; כדי להתחיל.</p>}
    </div>
  );
}
