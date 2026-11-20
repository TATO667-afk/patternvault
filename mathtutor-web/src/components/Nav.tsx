"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "לוח בקרה" },
  { href: "/library", label: "נושאים" },
  { href: "/practice", label: "תרגול" },
  { href: "/tutor", label: "מורה מודרך" },
  { href: "/exam", label: "סימולציה" },
  { href: "/progress", label: "התקדמות" },
];

export default function Nav({ level, displayName }: { level: string | null; displayName: string }) {
  const path = usePathname();
  return (
    <header className="max-w-4xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[13px] grid place-items-center text-white font-head font-bold text-xl shadow-card" style={{ background: "linear-gradient(145deg,var(--brand),#6a74ea)" }}>∑</div>
          <div>
            <div className="font-head font-bold text-lg leading-tight">מורה מתמטיקה AI</div>
            <div className="text-inksoft text-xs">שלום, {displayName || "תלמיד/ה"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="chip bg-brandsoft text-brand">רמה: {level || "?"} יח״ל</Link>
          <form action="/auth/signout" method="post">
            <button className="chip bg-surface2 text-inksoft" type="submit">יציאה</button>
          </form>
        </div>
      </div>
      <nav className="mt-4 flex gap-1 flex-wrap bg-surface2 border border-line rounded-xl p-1.5">
        {LINKS.map((l) => {
          const active = path === l.href || path.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={"font-head font-semibold text-sm rounded-lg px-3 py-2 " + (active ? "bg-surface text-brand shadow-card" : "text-inksoft")}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
