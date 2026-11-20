"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Manual import of the artifact's localStorage progress. Browser storage is
 * per-origin, so the new domain cannot read the artifact's storage directly —
 * the student exports it from the artifact and pastes it here. We never
 * overwrite newer cloud data automatically: if cloud attempts already exist we
 * require explicit confirmation before importing.
 */
interface ArtifactStore {
  level?: string;
  progress?: { recent?: { ts: number; topicId: string; verdict: string }[] };
}

export default function ImportPage() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<ArtifactStore | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasCloud, setHasCloud] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  function parse() {
    setMsg("");
    try {
      const obj = JSON.parse(raw) as ArtifactStore;
      if (!obj || typeof obj !== "object" || !obj.progress) throw new Error();
      setPreview(obj);
    } catch {
      setPreview(null);
      setMsg("הטקסט אינו תקין. ודאו שהעתקתם את כל ה-JSON מהדמו.");
    }
  }

  async function doImport() {
    if (!preview) return;
    setBusy(true);
    setMsg("");
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setMsg("צריך להתחבר.");
        setBusy(false);
        return;
      }
      const { count } = await supabase.from("practice_attempts").select("*", { count: "exact", head: true });
      if ((count ?? 0) > 0 && !confirmed) {
        setHasCloud(true);
        setBusy(false);
        return;
      }
      const recent = preview.progress?.recent || [];
      const valid = recent.filter((r) => r && typeof r.topicId === "string" && ["correct", "incorrect", "partial", "unverified"].includes(r.verdict));
      if (preview.level && ["3", "4", "5"].includes(preview.level)) {
        await supabase.from("profiles").update({ level: preview.level }).eq("id", u.user.id).is("level", null);
      }
      if (valid.length) {
        const rows = valid.map((r) => ({
          user_id: u.user!.id,
          topic_id: r.topicId,
          verdict: r.verdict,
          verified: false,
          evaluation: null,
          created_at: new Date(r.ts || Date.now()).toISOString(),
        }));
        const { error } = await supabase.from("practice_attempts").insert(rows);
        if (error) throw error;
      }
      setMsg(`יובאו ${valid.length} רשומות התקדמות.`);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      setMsg("הייבוא נכשל. נסו שוב.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-head font-bold text-2xl mb-2">ייבוא התקדמות מהדמו</h1>
      <div className="card p-4 mb-4 text-sm">
        <p className="font-head font-semibold mb-1">איך מייצאים מהדמו הישן?</p>
        <ol className="list-decimal pr-5 space-y-1 text-inksoft">
          <li>פתחו את הדמו הישן (הארטיפקט) בדפדפן.</li>
          <li>פתחו קונסול (F12) והריצו: <code className="bg-surface2 px-1 rounded" dir="ltr">copy(localStorage.getItem(&apos;mathTutor.v4&apos;))</code></li>
          <li>הדביקו כאן את מה שהועתק.</li>
        </ol>
      </div>
      <textarea className="input h-32 font-mono text-xs" dir="ltr" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder='{"level":"4","progress":{...}}' />
      <div className="flex gap-2 mt-3">
        <button className="btn-ghost" onClick={parse} disabled={!raw.trim()}>בדיקה</button>
        {preview && <button className="btn-primary" onClick={doImport} disabled={busy}>{busy ? "מייבא…" : "ייבוא"}</button>}
      </div>
      {preview && (
        <div className="card p-4 mt-3 text-sm">
          <div>רמה בדמו: <b>{preview.level || "לא צוינה"}</b></div>
          <div>רשומות פעילות אחרונות: <b>{preview.progress?.recent?.length || 0}</b></div>
        </div>
      )}
      {hasCloud && !confirmed && (
        <div className="bg-warnsoft rounded-xl p-3 mt-3 text-sm">
          כבר יש התקדמות בחשבון הענן שלכם. הייבוא יוסיף רשומות (ללא דריסה). להמשיך?
          <button className="btn-primary mt-2" onClick={() => { setConfirmed(true); doImport(); }}>כן, ייבאו</button>
        </div>
      )}
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
