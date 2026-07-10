import Link from "next/link";
import { Gem } from "lucide-react";

const LINKS = {
  "Explore": [
    { label: "Pattern Explorer", href: "/patterns" },
    { label: "Skin Database", href: "/skins" },
    { label: "Blue Gems", href: "/patterns?filter=blue-gem" },
    { label: "Fades", href: "/patterns?filter=fade" },
    { label: "Dopplers", href: "/patterns?filter=doppler" },
  ],
  "Tools": [
    { label: "Pattern Compare", href: "/compare" },
    { label: "Price History", href: "/prices" },
    { label: "AI Scanner", href: "/scanner" },
    { label: "Collections", href: "/collections" },
  ],
  "Community": [
    { label: "News", href: "/news" },
    { label: "Submissions", href: "/submit" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Discord", href: "https://discord.gg/patternvault" },
  ],
};

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--s1)", marginTop: 80 }}>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "60px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#5865f2,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Gem style={{ width: 16, height: 16, color: "#fff" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>
                <span style={{ color: "var(--t1)" }}>Pattern</span>
                <span style={{ color: "#818cf8" }}>Vault</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.7, maxWidth: 280, margin: 0 }}>
              The internet's definitive resource for CS2 skin patterns. Track, compare, and discover rare patterns used by collectors worldwide.
            </p>
            <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 16 }}>
              PatternVault is not affiliated with Valve Corporation.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "var(--t3)", textTransform: "uppercase", marginBottom: 16 }}>{group}</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: 14, color: "var(--t2)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--t1)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--t2)")}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, color: "var(--t3)", margin: 0 }}>© {new Date().getFullYear()} PatternVault. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "API"].map(l => (
              <Link key={l} href="#" style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
