"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Settings() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<string>("3");
  const [explain, setExplain] = useState("regular");
  const [created, setCreated] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        const { data } = await supabase.from("profiles").select("display_name, level, preferences, created_at").eq("id", u.user.id).single();
        if (data) {
          setName(data.display_name || "");
          setLevel(data.level || "3");
          setExplain((data.preferences as { explain?: string } | null)?.explain || "regular");
          setCreated(data.created_at ? new Date(data.created_at).toLocaleDateString("he-IL") : "");
        }
      } catch {
        /* ignore */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase
          .from("profiles")
          .update({ display_name: name, level, preferences: { explain }, updated_at: new Date().toISOString() })
          .eq("id", u.user.id);
        setSaved(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <p className="text-inksoft">טוען…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="font-head font-bold text-2xl mb-5">הגדרות</h1>
      <div className="card p-5 flex flex-col gap-4">
        <div>
          <label className="label">שם לתצוגה</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">רמת בגרות</label>
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="3">3 יחידות</option>
            <option value="4">4 יחידות</option>
            <option value="5">5 יחידות</option>
          </select>
        </div>
        <div>
          <label className="label">רמת הסבר מועדפת</label>
          <select className="input" value={explain} onChange={(e) => setExplain(e.target.value)}>
            <option value="simple">פשוט</option>
            <option value="regular">רגיל</option>
            <option value="advanced">מתקדם</option>
          </select>
        </div>
        {created && <p className="text-inksoft text-sm">חשבון נוצר: {created}</p>}
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? "שומר…" : "שמירה"}</button>
          {saved && <span className="text-good text-sm">נשמר ✓</span>}
        </div>
      </div>

      <div className="card p-5 mt-4">
        <h2 className="font-head font-semibold mb-1">ייבוא התקדמות מהדמו הישן</h2>
        <p className="text-inksoft text-sm mb-3">תרגלתם בגרסת הארטיפקט? אפשר לייבא את ההתקדמות המקומית.</p>
        <Link href="/import" className="btn-ghost">למסך הייבוא</Link>
      </div>

      <div className="card p-5 mt-4">
        <h2 className="font-head font-semibold mb-1">פרטיות</h2>
        <p className="text-inksoft text-sm">אנחנו שומרים מינימום מידע אישי. תמונות שהעליתם אינן נשמרות בשרת — רק הטקסט שזוהה. שיחות נשמרות כדי לאפשר המשך למידה, וניתן למחוק אותן.</p>
      </div>

      <form action="/auth/signout" method="post" className="mt-4">
        <button className="btn-ghost" type="submit">יציאה מהחשבון</button>
      </form>
    </div>
  );
}
