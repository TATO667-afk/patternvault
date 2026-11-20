"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import MathText from "@/components/MathText";
import { postJson } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Level, GeneratedQuestion } from "@/lib/types";

type EvalResult = { index: number; verdict: string; verified: boolean; cls: string; label: string };
const LS_KEY = "exam:active";
const CHIP: Record<string, string> = { ok: "bg-goodsoft text-good", bad: "bg-badsoft text-bad", partial: "bg-warnsoft text-warn", uncertain: "bg-surface2 text-inksoft" };

interface Active {
  examId: string;
  level: Level;
  questions: GeneratedQuestion[];
  answers: string[];
  endTs: number;
}

export default function ExamClient({ level, history }: { level: Level; history: { level: string; total: number; correct: number; submitted_at: string }[] }) {
  const [phase, setPhase] = useState<"home" | "run" | "results">("home");
  const [count, setCount] = useState(5);
  const [minutes, setMinutes] = useState(30);
  const [examLevel, setExamLevel] = useState<Level>(level);
  const [active, setActive] = useState<Active | null>(null);
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [results, setResults] = useState<EvalResult[] | null>(null);
  const [correct, setCorrect] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const saveLocal = useCallback((a: Active) => { try { localStorage.setItem(LS_KEY, JSON.stringify(a)); } catch { /* */ } }, []);
  const clearLocal = useCallback(() => { try { localStorage.removeItem(LS_KEY); } catch { /* */ } }, []);

  // Resume an in-progress exam after a refresh.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const a = JSON.parse(raw) as Active;
        if (a && a.endTs > Date.now() && Array.isArray(a.questions)) { setActive(a); setPhase("run"); }
        else localStorage.removeItem(LS_KEY);
      }
    } catch { /* */ }
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "run" || !active) return;
    const tick = () => {
      const l = Math.max(0, Math.floor((active.endTs - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) { void submit(); }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, [phase, active]);

  async function start() {
    setLoading(true); setErr("");
    const r = await postJson<{ questions: GeneratedQuestion[] }>("/api/ai/exam", { level: examLevel, count });
    if (!r.ok || !r.data || !r.data.questions?.length) { setLoading(false); setErr(r.message || "יצירת הסימולציה נכשלה."); return; }
    let examId = "";
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data } = await supabase.from("mock_exams").insert({ user_id: u.user.id, level: examLevel, total: r.data.questions.length, questions: r.data.questions, status: "active" }).select("id").single();
        examId = data?.id || "";
      }
    } catch { /* still runnable without persistence */ }
    const a: Active = { examId, level: examLevel, questions: r.data.questions, answers: r.data.questions.map(() => ""), endTs: Date.now() + minutes * 60000 };
    setActive(a); saveLocal(a); setIdx(0); setResults(null); setPhase("run"); setLoading(false);
  }

  function setAnswer(v: string) {
    if (!active) return;
    const answers = active.answers.slice(); answers[idx] = v;
    const a = { ...active, answers }; setActive(a); saveLocal(a);
  }

  async function submit() {
    if (!active) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true); setPhase("results");
    const items = active.questions.map((q, i) => ({ question: q.question, answer: active.answers[i] || "" }));
    const r = await postJson<{ results: EvalResult[]; correct: number; total: number }>("/api/ai/exam-eval", { items });
    setLoading(false);
    const res = r.ok && r.data ? r.data.results : active.questions.map((_, i) => ({ index: i, verdict: "unverified", verified: false, cls: "uncertain", label: "לא נבדק" }));
    const corr = r.ok && r.data ? r.data.correct : 0;
    setResults(res); setCorrect(corr);
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (u.user && active.examId) {
        await supabase.from("mock_exams").update({ status: "submitted", correct: corr, submitted_at: new Date().toISOString() }).eq("id", active.examId);
        await supabase.from("exam_answers").insert(active.questions.map((_, i) => ({ exam_id: active.examId, user_id: u.user!.id, idx: i, answer: active.answers[i] || "", verdict: res[i]?.verdict ?? null, verified: res[i]?.verified ?? false })));
      }
    } catch { /* */ }
    clearLocal();
  }

  function abandon() { clearLocal(); setActive(null); setPhase("home"); setResults(null); }

  // ---- HOME ----
  if (phase === "home") {
    return (
      <div>
        <h1 className="font-head font-bold text-2xl mb-1">סימולציית בגרות</h1>
        <p className="text-inksoft mb-4">תרגול בתנאי מבחן.</p>
        <div className="bg-accentsoft rounded-xl p-3 text-sm mb-4">אלו <b>שאלות תרגול שנוצרות על ידי AI</b> — לא שאלות בגרות רשמיות. מספר השאלות והזמן לבחירתכם ואינם מבנה בחינה רשמי. הציון בסוף הוא ציון תרגול, לא ציון בגרות.</div>
        <div className="card p-4 flex flex-wrap gap-4 items-end">
          <div><label className="label">רמה</label><select className="input" value={examLevel} onChange={(e) => setExamLevel(e.target.value as Level)}><option value="3">3 יח״ל</option><option value="4">4 יח״ל</option><option value="5">5 יח״ל</option></select></div>
          <div><label className="label">מספר שאלות</label><select className="input" value={count} onChange={(e) => setCount(Number(e.target.value))}><option>3</option><option>5</option><option>8</option></select></div>
          <div><label className="label">זמן (דקות)</label><select className="input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}><option>15</option><option>30</option><option>45</option></select></div>
          <button className="btn-primary" onClick={start} disabled={loading}>{loading ? "מכין…" : "התחילו סימולציה"}</button>
        </div>
        {err && <p className="text-bad text-sm mt-3">{err}</p>}
        {history.length > 0 && (
          <>
            <h2 className="font-head font-bold text-lg mt-6 mb-2">סימולציות קודמות</h2>
            <div className="card p-4">{history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-line last:border-0 text-sm">
                <span className="chip bg-surface2 text-inksoft">{h.level} יח״ל</span>
                <span className="font-head font-semibold mr-auto">{h.correct}/{h.total}</span>
                <span className="text-inksoft">{h.submitted_at ? new Date(h.submitted_at).toLocaleDateString("he-IL") : ""}</span>
              </div>
            ))}</div>
          </>
        )}
      </div>
    );
  }

  // ---- RUN ----
  if (phase === "run" && active) {
    const mm = Math.floor(left / 60), ss = left % 60;
    return (
      <div>
        <div className="card p-3 flex items-center gap-3 flex-wrap sticky top-0 z-10">
          <span className={"font-head font-bold text-lg tabular-nums " + (left <= 60 ? "text-bad" : "")}>{(mm < 10 ? "0" : "") + mm}:{(ss < 10 ? "0" : "") + ss}</span>
          <div className="flex gap-1.5 flex-wrap">
            {active.questions.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={"w-8 h-8 rounded-lg border text-sm font-head font-semibold " + (i === idx ? "border-brand text-brand" : (active.answers[i] || "").trim() ? "bg-brandsoft text-brand border-transparent" : "bg-surface2 text-inksoft border-line")}>{i + 1}</button>
            ))}
          </div>
          <button className="btn-primary mr-auto px-4" onClick={submit} disabled={loading}>הגשה</button>
        </div>

        <div className="card p-4 mt-4">
          <div className="font-head font-bold mb-2">שאלה {idx + 1} מתוך {active.questions.length}</div>
          <MathText block className="bg-surface2 rounded-xl p-3">{active.questions[idx].question}</MathText>
          <textarea className="input mt-3 min-h-[90px]" value={active.answers[idx]} onChange={(e) => setAnswer(e.target.value)} placeholder="התשובה שלכם…" />
        </div>
        <div className="flex justify-between mt-3">
          <button className="btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← הקודמת</button>
          <button className="btn-ghost" onClick={() => setIdx(Math.min(active.questions.length - 1, idx + 1))} disabled={idx === active.questions.length - 1}>הבאה →</button>
        </div>
        <button className="text-inksoft text-sm mt-4 underline" onClick={abandon}>ביטול הסימולציה</button>
      </div>
    );
  }

  // ---- RESULTS ----
  if (phase === "results" && active) {
    const total = active.questions.length;
    return (
      <div>
        <h1 className="font-head font-bold text-2xl mb-3">תוצאות הסימולציה</h1>
        {loading ? (
          <div className="card p-6 text-center text-inksoft">בודק את התשובות…</div>
        ) : (
          <>
            <div className="card p-6 text-center">
              <div className="font-head font-bold text-4xl text-brand">{correct}/{total}</div>
              <div className="text-inksoft mt-1">ציון תרגול (לא רשמי) · {Math.round((correct / total) * 100)}% תשובות נכונות</div>
            </div>
            {active.questions.map((q, i) => (
              <div key={i} className="card p-4 mt-3">
                <div className="font-head font-bold mb-1">שאלה {i + 1} {results && <span className={"chip mr-2 " + CHIP[results[i]?.cls || "uncertain"]}>{results[i]?.label}</span>}</div>
                <MathText block className="bg-surface2 rounded-xl p-3">{q.question}</MathText>
                <p className="text-inksoft text-sm mt-2">התשובה שלך: {(active.answers[i] || "").trim() || "(לא נענתה)"}</p>
                <p className="text-inksoft text-sm">תשובה נכונה (לפי ה-AI): {q.answerText || "—"}</p>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button className="btn-primary" onClick={abandon}>סימולציה חדשה</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}
