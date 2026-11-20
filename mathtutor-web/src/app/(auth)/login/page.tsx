"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr("אימייל או סיסמה שגויים.");
        setBusy(false);
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setErr("השירות אינו זמין כעת. ודאו שהגדרות Supabase קיימות.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="card p-6 w-full max-w-sm">
        <h1 className="font-head font-bold text-2xl mb-1">התחברות</h1>
        <p className="text-inksoft text-sm mb-5">מורה מתמטיקה AI — הכנה לבגרות</p>
        <label className="label" htmlFor="email">אימייל</label>
        <input id="email" type="email" required className="input mb-3" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        <label className="label" htmlFor="password">סיסמה</label>
        <input id="password" type="password" required className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
        {err && <p className="text-bad text-sm mb-3">{err}</p>}
        <button className="btn-primary w-full justify-center" disabled={busy}>{busy ? "מתחבר…" : "התחברות"}</button>
        <div className="flex justify-between mt-4 text-sm">
          <Link href="/register" className="text-brand">הרשמה</Link>
          <Link href="/reset-password" className="text-inksoft">שכחתי סיסמה</Link>
        </div>
      </form>
    </main>
  );
}
