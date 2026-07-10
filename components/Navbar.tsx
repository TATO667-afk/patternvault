"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Gem, ChevronDown, X, Layers, BookOpen, GitCompare, Users, Newspaper } from "lucide-react";

const NAV = [
  { href: "/patterns", label: "Patterns" },
  { href: "/skins", label: "Skins" },
  { href: "/compare", label: "Compare" },
  { href: "/community", label: "Community" },
  { href: "/news", label: "News" },
];

interface NavbarProps {
  user?: { displayName: string; avatarUrl?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(7,8,10,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 0 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginRight: 40, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#5865f2,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(88,101,242,0.4)" }}>
              <Gem style={{ width: 16, height: 16, color: "#fff" }} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "var(--t1)" }}>Pattern</span>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "#818cf8" }}>Vault</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            {NAV.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  textDecoration: "none", transition: "all 0.15s",
                  color: active ? "var(--t1)" : "var(--t2)",
                  background: active ? "var(--s3)" : "transparent",
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: search + auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSearchOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 10, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t3)", fontSize: 13, cursor: "pointer", width: 220 }}>
              <Search style={{ width: 14, height: 14 }} />
              <span>Search patterns...</span>
              <span style={{ marginLeft: "auto", fontSize: 11, padding: "1px 6px", borderRadius: 4, background: "var(--s3)", border: "1px solid var(--border)" }}>⌘K</span>
            </button>

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "var(--s2)", border: "1px solid var(--border)", cursor: "pointer" }}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} style={{ width: 24, height: 24, borderRadius: 6 }} alt="" />
                  : <div style={{ width: 24, height: 24, borderRadius: 6, background: "#5865f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{user.displayName[0]}</div>
                }
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)" }}>{user.displayName}</span>
                <ChevronDown style={{ width: 13, height: 13, color: "var(--t3)" }} />
              </div>
            ) : (
              <a href="/login" style={{ padding: "7px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#5865f2", color: "#fff", textDecoration: "none", boxShadow: "0 0 16px rgba(88,101,242,0.3)" }}>
                Sign In
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setSearchOpen(false)}>
          <div style={{ width: "100%", maxWidth: 640, margin: "0 24px" }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "var(--s1)", border: "1px solid var(--border2)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <Search style={{ width: 20, height: 20, color: "var(--t2)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search patterns, skins, pattern IDs..."
                  autoFocus
                  style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 16, color: "var(--t1)", fontFamily: "Inter, sans-serif" }}
                />
                <button onClick={() => setSearchOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t2)", padding: 4 }}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>
              <div style={{ padding: "8px 0" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--t3)", padding: "6px 20px 8px", textTransform: "uppercase", margin: 0 }}>Quick Access</p>
                {[
                  { label: "AK-47 | Case Hardened #661", sub: "Blue Gem · Tier 5 · ~$185,000", href: "/patterns/ak47-case-hardened-661" },
                  { label: "Karambit | Fade 100%", sub: "Pattern 701 · $4,800", href: "/patterns/karambit-fade-701" },
                  { label: "Karambit | Doppler Sapphire", sub: "Phase Sapphire · $12,500", href: "/patterns/karambit-doppler-sapphire-415" },
                  { label: "Five-SeveN | Case Hardened #278", sub: "Blue Gem · #1 Ranked · ~$48,000", href: "/patterns/fiveseven-case-hardened-278" },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setSearchOpen(false)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--s2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: 14, color: "var(--t1)", fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: 12, color: "var(--t3)" }}>{item.sub}</span>
                  </Link>
                ))}
              </div>
              <div style={{ padding: "10px 20px 14px", borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, color: "var(--t3)", margin: 0 }}>
                  <kbd style={{ padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border2)", fontSize: 11, background: "var(--s3)" }}>↵</kbd> to search &nbsp;
                  <kbd style={{ padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border2)", fontSize: 11, background: "var(--s3)" }}>ESC</kbd> to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
