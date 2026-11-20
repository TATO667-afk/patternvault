"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/auth/callback?next=/settings` });
    } catch {
      /* ignore — we always show a neutral confirmation to avoid account enumeration */
    }
    setSent(true);
    setBusy(false);
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="card p-6 w-full max-w-sm">
        <h1 className="font-head font-bold text-2xl mb-1">איפוס סיסמה</h1>
        {sent ? (
          <p className="text-inksoft text-sm mt-3">אם קיים חשבון עם האימייל הזה, נשלח אליו קישור לאיפוס.</p>
        ) : (
          <>
            <p className="text-inksoft text-sm mb-5">נשלח קישור לאיפוס לאימייל שלכם.</p>
            <label className="label" htmlFor="email">אימייל</label>
            <input id="email" type="email" required className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
            <button className="btn-primary w-full justify-center" disabled={busy}>{busy ? "שולח…" : "שליחת קישור"}</button>
          </>
        )}
        <p className="mt-4 text-sm text-center"><Link href="/login" className="text-brand">חזרה להתחברות</Link></p>
      </form>
    </main>
  );
}
