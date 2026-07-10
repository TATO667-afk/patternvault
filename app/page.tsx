"use client";
import Link from "next/link";
import { ArrowRight, Gem, TrendingUp, Shield, Zap, Search } from "lucide-react";
import { PatternCard } from "@/components/PatternCard";
import { MOCK_PATTERNS, TRENDING_PATTERNS, BLUE_GEMS, FADE_PATTERNS, DOPPLER_PATTERNS, STATS } from "@/lib/mock";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FEATURED = MOCK_PATTERNS[0]; // AK-47 661

export default function HomePage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/patterns?q=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", alignItems: "center" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(88,101,242,0.08) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />
        </div>

        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(88,101,242,0.1)", border: "1px solid rgba(88,101,242,0.25)", fontSize: 13, color: "#818cf8", fontWeight: 500, marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", animation: "pulse 2s infinite", display: "inline-block" }} />
              {STATS.totalPatterns.toLocaleString()} patterns documented
            </div>

            <h1 style={{ fontSize: 62, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "var(--t1)", margin: "0 0 24px" }}>
              The Definitive<br />
              <span style={{ background: "linear-gradient(135deg,#818cf8,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                CS2 Pattern
              </span>
              <br />Database
            </h1>

            <p style={{ fontSize: 19, color: "var(--t2)", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 480 }}>
              Track Blue Gems, Fade percentages, Doppler phases, and every rare pattern ever documented. Built for serious collectors.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 40, maxWidth: 520 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "var(--t3)" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="AK-47 Case Hardened, Pattern 661, Karambit Fade..."
                  style={{ width: "100%", paddingLeft: 46, paddingRight: 16, paddingTop: 14, paddingBottom: 14, fontSize: 15, borderRadius: 12, background: "var(--s2)", border: "1px solid var(--border2)", color: "var(--t1)", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
                />
              </div>
              <button type="submit" style={{ padding: "14px 24px", borderRadius: 12, background: "#5865f2", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 0 24px rgba(88,101,242,0.4)", whiteSpace: "nowrap" }}>
                Search
              </button>
            </form>

            {/* Quick links */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Blue Gems", "Fades", "Dopplers", "Sapphires", "Pattern 661"].map(tag => (
                <Link key={tag} href={`/patterns?q=${encodeURIComponent(tag)}`}
                  style={{ padding: "6px 14px", borderRadius: 20, background: "var(--s2)", border: "1px solid var(--border)", fontSize: 13, color: "var(--t2)", textDecoration: "none", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--t1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Featured pattern card (large) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 380, animation: "float 5s ease-in-out infinite" }}>
              <div style={{ background: "var(--s1)", border: "1px solid rgba(59,130,246,0.4)", borderRadius: 24, padding: 4, boxShadow: "0 0 60px rgba(59,130,246,0.2), 0 32px 80px rgba(0,0,0,0.5)" }}>
                <PatternCard pattern={FEATURED} size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid var(--border)", background: "rgba(7,8,10,0.6)", backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64 }}>
            {[
              { label: "Patterns", value: STATS.totalPatterns.toLocaleString() },
              { label: "Skins", value: STATS.totalSkins.toLocaleString() },
              { label: "Blue Gems", value: STATS.blueGems.toString() },
              { label: "Documented Sales", value: STATS.totalSales.toLocaleString() },
              { label: "Avg Premium", value: STATS.avgPremium },
              { label: "Updated", value: STATS.lastUpdated },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", borderRight: i < 5 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: "var(--t1)" }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pattern of the Day ── */}
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "80px 24px" }}>
        <SectionHeader label="Featured" title="Pattern of the Day" action={{ label: "View All Patterns", href: "/patterns" }} />
        <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {/* Image */}
            <div style={{ background: "linear-gradient(135deg,#0c0d11,#16181f)", display: "flex", alignItems: "center", justifyContent: "center", padding: 60, position: "relative", minHeight: 360 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 60%)" }} />
              <img src={FEATURED.imageUrl} alt="" style={{ width: "100%", maxWidth: 340, objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 20px 40px rgba(59,130,246,0.3))" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            {/* Details */}
            <div style={{ padding: 48 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)", letterSpacing: "0.06em" }}>BLUE GEM · TIER 5</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", letterSpacing: "0.06em" }}>PATTERN OF THE DAY</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--t3)", margin: "0 0 6px" }}>{FEATURED.weaponName}</p>
              <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--t1)", margin: "0 0 6px" }}>{FEATURED.skinName}</h2>
              <p style={{ fontSize: 20, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "#818cf8", margin: "0 0 24px" }}>Pattern #{FEATURED.patternId}</p>
              <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7, margin: "0 0 32px" }}>{FEATURED.description}</p>

              {/* Pattern DNA mini */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                {[
                  { label: "Blue Coverage", value: `${FEATURED.bluePercent}%`, color: "#60a5fa" },
                  { label: "Rarity Score", value: `${FEATURED.rarityScore}/100`, color: "#a855f7" },
                  { label: "Last Sale", value: `$${(FEATURED.lastSalePrice! / 1000).toFixed(0)}k`, color: "#f59e0b" },
                  { label: "Premium", value: `${FEATURED.premiumMulti}x base`, color: "#22c55e" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--s2)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: s.color, margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <Link href={`/patterns/${FEATURED.slug}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "#5865f2", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 0 24px rgba(88,101,242,0.4)" }}>
                View Full Pattern <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Patterns ── */}
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "0 24px 80px" }}>
        <SectionHeader label="Trending" title="Hot Right Now" action={{ label: "Browse All", href: "/patterns" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {TRENDING_PATTERNS.map(p => <PatternCard key={p.id} pattern={p} />)}
        </div>
      </section>

      {/* ── Blue Gems showcase ── */}
      <section style={{ background: "var(--s1)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#60a5fa", fontWeight: 600, marginBottom: 10 }}>
                <Gem style={{ width: 14, height: 14 }} />
                Rarest of the Rare
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>
                <span style={{ background: "linear-gradient(135deg,#60a5fa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Blue Gems</span>
              </h2>
            </div>
            <Link href="/patterns?filter=blue-gem" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              All Blue Gems <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {BLUE_GEMS.map(p => <PatternCard key={p.id} pattern={p} size="sm" />)}
          </div>
        </div>
      </section>

      {/* ── Fade + Doppler ── */}
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Fades */}
          <div>
            <SectionHeader label="Fade Knives" title="Highest Fades" action={{ label: "All Fades", href: "/patterns?filter=fade" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FADE_PATTERNS.map((p, i) => (
                <FadeRow key={p.id} pattern={p} rank={i + 1} />
              ))}
            </div>
          </div>
          {/* Dopplers */}
          <div>
            <SectionHeader label="Doppler Phases" title="Special Phases" action={{ label: "All Dopplers", href: "/patterns?filter=doppler" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DOPPLER_PATTERNS.map((p, i) => (
                <FadeRow key={p.id} pattern={p} rank={i + 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features / Why PatternVault ── */}
      <section style={{ background: "var(--s1)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Built for Collectors</h2>
            <p style={{ fontSize: 18, color: "var(--t2)", maxWidth: 560, margin: "0 auto" }}>Every tool you need to find, track, and understand rare CS2 patterns.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { icon: Gem, title: "Pattern DNA", desc: "Every pattern gets a unique fingerprint: Blue %, Gold %, Collector Score, Rarity Score, and Demand Index — visualized beautifully.", color: "#818cf8" },
              { icon: Shield, title: "Verified Sales", desc: "Every documented sale is verified and timestamped. Track price history and premium trends for any pattern over time.", color: "#22c55e" },
              { icon: Zap, title: "AI Pattern Scanner", desc: "Upload a screenshot and instantly identify the weapon, skin, pattern ID, float value, and blue percentage with high confidence.", color: "#f59e0b" },
              { icon: Search, title: "Instant Search", desc: "Search by pattern ID, float range, blue percentage, phase, or any combination. Results appear in milliseconds.", color: "#06b6d4" },
              { icon: TrendingUp, title: "Price Intelligence", desc: "Real-time price data from all major marketplaces. Know the fair value of any pattern before you buy or sell.", color: "#f472b6" },
              { icon: ArrowRight, title: "3D Viewer", desc: "Inspect any pattern in full 3D. Rotate, zoom, and analyze every angle with our interactive WebGL viewer.", color: "#a855f7" },
            ].map(f => (
              <div key={f.title} style={{ background: "var(--s2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border2)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <f.icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 28, padding: "72px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, rgba(88,101,242,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Ready to explore?</h2>
            <p style={{ fontSize: 18, color: "var(--t2)", margin: "0 0 36px" }}>Browse 12,847 documented patterns. No account required.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/patterns" style={{ padding: "14px 32px", borderRadius: 12, background: "#5865f2", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 0 32px rgba(88,101,242,0.4)" }}>
                Browse Patterns
              </Link>
              <Link href="/skins" style={{ padding: "14px 32px", borderRadius: 12, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t1)", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
                Skin Database
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
      `}</style>
    </div>
  );
}

function SectionHeader({ label, title, action }: { label: string; title: string; action: { label: string; href: string } }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "var(--t3)", textTransform: "uppercase", margin: "0 0 6px" }}>{label}</p>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{title}</h2>
      </div>
      <Link href={action.href} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
        {action.label} <ArrowRight style={{ width: 14, height: 14 }} />
      </Link>
    </div>
  );
}

function FadeRow({ pattern, rank }: { pattern: (typeof MOCK_PATTERNS)[0]; rank: number }) {
  const PHASE_COLORS: Record<string, string> = {
    "Sapphire": "#60a5fa", "Ruby": "#f87171", "Black Pearl": "#a78bfa",
  };
  const accentColor = pattern.phase ? (PHASE_COLORS[pattern.phase] ?? "#818cf8") : "#f472b6";

  return (
    <Link href={`/patterns/${pattern.slug}`} style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "var(--s2)", border: "1px solid var(--border)", borderRadius: 14, transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "var(--s3)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--s2)"; }}>
        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: "var(--t3)", width: 28, flexShrink: 0 }}>#{rank}</span>
        <img src={pattern.imageUrl} alt="" style={{ width: 48, height: 36, objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {pattern.weaponName} | {pattern.skinName}
          </p>
          <p style={{ fontSize: 11, color: "var(--t3)", margin: 0 }}>#{pattern.patternId}</p>
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: accentColor, flexShrink: 0 }}>
          {pattern.fadePercent != null ? `${pattern.fadePercent}%` : pattern.phase}
        </span>
      </div>
    </Link>
  );
}
