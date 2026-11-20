"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password.length < 8) {
      setErr("הסיסמה צריכה להכיל לפחות 8 תווים.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name }, emailRedirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) {
        setErr("ההרשמה נכשלה. ייתכן שהאימייל כבר רשום.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setErr("השירות אינו זמין כעת. ודאו שהגדרות Supabase קיימות.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen grid place-items-center px-4">
        <div className="card p-6 w-full max-w-sm text-center">
          <h1 className="font-head font-bold text-xl mb-2">כמעט סיימנו!</h1>
          <p className="text-inksoft text-sm">שלחנו אימייל אימות ל-{email}. אשרו אותו ואז התחברו.</p>
          <Link href="/login" className="btn-primary w-full justify-center mt-4">למסך ההתחברות</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="card p-6 w-full max-w-sm">
        <h1 className="font-head font-bold text-2xl mb-1">הרשמה</h1>
        <p className="text-inksoft text-sm mb-5">כמה פרטים וסיימנו. אנחנו שומרים מינימום מידע אישי.</p>
        <label className="label" htmlFor="name">שם לתצוגה</label>
        <input id="name" required className="input mb-3" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="label" htmlFor="email">אימייל</label>
        <input id="email" type="email" required className="input mb-3" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        <label className="label" htmlFor="password">סיסמה (8+ תווים)</label>
        <input id="password" type="password" required className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
        {err && <p className="text-bad text-sm mb-3">{err}</p>}
        <button className="btn-primary w-full justify-center" disabled={busy}>{busy ? "נרשם…" : "יצירת חשבון"}</button>
        <p className="mt-4 text-sm text-center">כבר יש לכם חשבון? <Link href="/login" className="text-brand">התחברות</Link></p>
      </form>
    </main>
  );
}
