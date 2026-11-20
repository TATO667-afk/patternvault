"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LEVELS = [
  { v: "3", d: "בסיס איתן: אלגברה, פונקציות, בעיות מילוליות ונגזרת ראשונית" },
  { v: "4", d: "הרחבה: חדו״א, טריגונומטריה, גאומטריה אנליטית והסתברות" },
  { v: "5", d: "מתקדם: חדו״א מלא, מרוכבים, וקטורים וחקירת פונקציות" },
];

export default function Onboarding() {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function choose(level: string) {
    setBusy(level);
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (u.user) await supabase.from("profiles").update({ level, updated_at: new Date().toISOString() }).eq("id", u.user.id);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setBusy("");
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-2xl text-center py-10">
        <h1 className="font-head font-bold text-3xl">באיזו רמה אתם לומדים?</h1>
        <p className="text-inksoft mt-2 mb-8">בחרו את רמת הבגרות. אפשר לשנות בכל רגע בהגדרות.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {LEVELS.map((l) => (
            <button key={l.v} onClick={() => choose(l.v)} disabled={!!busy} className="card p-6 text-center hover:-translate-y-1 transition disabled:opacity-60">
              <div className="font-head font-bold text-5xl text-brand">{l.v}</div>
              <div className="font-head font-semibold mt-1">יחידות</div>
              <div className="text-inksoft text-sm mt-2">{l.d}</div>
            </button>
          ))}
        </div>
        <p className="text-inksoft text-xs mt-6">מיפוי התוכנית ראשוני ואינו מסמך רשמי של משרד החינוך.</p>
      </div>
    </main>
  );
}
