"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, ExternalLink, TrendingUp, Star, Gem, ChevronRight, Sparkles, Loader2, X } from "lucide-react";
import { MOCK_PATTERNS } from "@/lib/mock";
import { PatternCard } from "@/components/PatternCard";

const PHASE_COLORS: Record<string, string> = {
  "Sapphire":    "#60a5fa",
  "Ruby":        "#f87171",
  "Black Pearl": "#a78bfa",
  "Phase 1":     "#818cf8",
  "Phase 2":     "#c084fc",
  "Phase 3":     "#f472b6",
  "Phase 4":     "#34d399",
};

export default function PatternDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pattern = MOCK_PATTERNS.find(p => p.slug === id) ?? MOCK_PATTERNS[0];

  const accentColor = pattern.phase ? (PHASE_COLORS[pattern.phase] ?? "#818cf8")
    : pattern.isBlueGem ? "#60a5fa"
    : "#818cf8";

  // Mock price history
  const priceHistory = [
    { date: "Jan 2024", price: pattern.lastSalePrice ? pattern.lastSalePrice * 0.6 : 1000 },
    { date: "Mar 2024", price: pattern.lastSalePrice ? pattern.lastSalePrice * 0.72 : 1200 },
    { date: "Jun 2024", price: pattern.lastSalePrice ? pattern.lastSalePrice * 0.85 : 1500 },
    { date: "Sep 2024", price: pattern.lastSalePrice ? pattern.lastSalePrice * 0.91 : 1700 },
    { date: "Dec 2024", price: pattern.lastSalePrice ? pattern.lastSalePrice * 0.97 : 1900 },
    { date: "Mar 2025", price: pattern.lastSalePrice ?? 2000 },
  ];

  const maxPrice = Math.max(...priceHistory.map(h => h.price));

  // DNA bars
  const dna = [
    { label: "Blue",      value: pattern.bluePercent ?? 0,          color: "#60a5fa", max: 100 },
    { label: "Gold",      value: pattern.goldPercent ?? (100 - (pattern.bluePercent ?? 50) - 10),   color: "#f59e0b", max: 100 },
    { label: "Rarity",    value: pattern.rarityScore,                color: "#a855f7", max: 100 },
    { label: "Collector", value: Math.round(pattern.rarityScore * 0.9), color: "#22c55e", max: 100 },
    { label: "Premium",   value: Math.min(pattern.premiumMulti * 10, 100), color: "#f472b6", max: 100 },
  ];

  // Similar patterns (same skin, different pattern)
  const similar = MOCK_PATTERNS
    .filter(p => p.id !== pattern.id && (p.skinName === pattern.skinName || p.isBlueGem === pattern.isBlueGem))
    .slice(0, 3);

  const fmt = (n?: number) => {
    if (!n) return "—";
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n.toLocaleString()}`;
  };

  const [showcaseUrl, setShowcaseUrl] = useState<string | null>(null);
  const [showcaseLoading, setShowcaseLoading] = useState(false);
  const [showcaseError, setShowcaseError] = useState<string | null>(null);

  async function generateShowcase() {
    setShowcaseLoading(true);
    setShowcaseError(null);
    try {
      const res = await fetch(`/api/patterns/${pattern.id}/showcase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weaponName: pattern.weaponName,
          skinName: pattern.skinName,
          patternId: pattern.patternId,
          isBlueGem: pattern.isBlueGem,
          phase: pattern.phase,
          bluePercent: pattern.bluePercent,
          goldPercent: pattern.goldPercent,
          fadePercent: pattern.fadePercent,
          rarityScore: pattern.rarityScore,
          tier: pattern.tier,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to generate showcase image");
      setShowcaseUrl(data.imageUrl);
    } catch (err) {
      setShowcaseError(err instanceof Error ? err.message : "Failed to generate showcase image");
    } finally {
      setShowcaseLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1380, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--t3)", marginBottom: 32 }}>
        <Link href="/" style={{ color: "var(--t3)", textDecoration: "none" }}>Home</Link>
        <ChevronRight style={{ width: 12, height: 12 }} />
        <Link href="/patterns" style={{ color: "var(--t3)", textDecoration: "none" }}>Patterns</Link>
        <ChevronRight style={{ width: 12, height: 12 }} />
        <span style={{ color: "var(--t2)" }}>{pattern.weaponName} | {pattern.skinName} #{pattern.patternId}</span>
      </nav>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 36, alignItems: "start" }}>
        {/* Left: image + DNA */}
        <div>
          {/* Image card */}
          <div style={{ background: "var(--s1)", border: `1px solid ${accentColor}40`, borderRadius: 24, overflow: "hidden", marginBottom: 24, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${accentColor}10 0%, transparent 60%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 80px", minHeight: 380 }}>
              <img src={pattern.imageUrl} alt="" style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain", filter: `drop-shadow(0 20px 60px ${accentColor}40)` }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            {/* Floating badges */}
            <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 8 }}>
              {pattern.isBlueGem && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.35)", letterSpacing: "0.04em" }}>
                  BLUE GEM
                </span>
              )}
              {pattern.phase && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40`, letterSpacing: "0.04em" }}>
                  {pattern.phase.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Pattern DNA */}
          <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <Gem style={{ width: 18, height: 18, color: accentColor }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pattern DNA</h2>
              <span style={{ fontSize: 12, color: "var(--t3)", marginLeft: "auto" }}>Unique fingerprint for pattern #{pattern.patternId}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {dna.map(d => (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)" }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: d.color }}>
                      {d.value.toFixed(1)}{d.label === "Premium" ? "x" : "%"}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--s3)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(d.value / d.max) * 100}%`, background: d.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price history chart */}
          <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Price History</h2>
              <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <TrendingUp style={{ width: 13, height: 13 }} />
                +{((priceHistory[5].price / priceHistory[0].price - 1) * 100).toFixed(0)}% all time
              </span>
            </div>
            {/* Simple bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
              {priceHistory.map((h, i) => (
                <div key={h.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", background: i === priceHistory.length - 1 ? accentColor : `${accentColor}50`, borderRadius: "4px 4px 0 0", height: `${(h.price / maxPrice) * 100}px`, transition: "height 0.4s ease" }} />
                  <span style={{ fontSize: 10, color: "var(--t3)", whiteSpace: "nowrap" }}>{h.date}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
              <StatBox label="Lowest Recorded" value={fmt(priceHistory[0].price)} />
              <StatBox label="Highest Recorded" value={fmt(Math.max(...priceHistory.map(h => h.price)))} />
              <StatBox label="Last Sale" value={fmt(pattern.lastSalePrice)} />
            </div>
          </div>
        </div>

        {/* Right: info panel */}
        <div style={{ position: "sticky", top: 80 }}>
          {/* Title block */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "var(--t3)", margin: "0 0 4px" }}>{pattern.weaponName}</p>
            <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 6px" }}>{pattern.skinName}</h1>
            <p style={{ fontSize: 22, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: accentColor, margin: "0 0 16px" }}>
              Pattern #{pattern.patternId}
            </p>
            <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{pattern.description}</p>
          </div>

          {/* Price block */}
          <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--t3)", textTransform: "uppercase", margin: "0 0 8px" }}>Last Sale</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "JetBrains Mono, monospace", color: "var(--t1)" }}>
                {fmt(pattern.lastSalePrice)}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                <TrendingUp style={{ width: 13, height: 13 }} />
                {pattern.premiumMulti.toFixed(1)}x base
              </span>
            </div>
            {pattern.lastSaleDate && (
              <p style={{ fontSize: 12, color: "var(--t3)", margin: "8px 0 0" }}>
                Sold {pattern.lastSaleDate}
              </p>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Blue Coverage",  value: pattern.bluePercent  != null ? `${pattern.bluePercent}%`  : "—", color: "#60a5fa" },
              { label: "Gold Coverage",  value: pattern.goldPercent  != null ? `${pattern.goldPercent}%`  : "—", color: "#f59e0b" },
              { label: "Fade %",         value: pattern.fadePercent  != null ? `${pattern.fadePercent}%`  : "—", color: "#f472b6" },
              { label: "Rarity Score",   value: `${pattern.rarityScore}/100`, color: "#a855f7" },
              { label: "Phase",          value: pattern.phase ?? "—",          color: accentColor },
              { label: "Tier",           value: `Tier ${pattern.tier}`,        color: "#818cf8" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--s2)", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "var(--t3)", textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <button style={{ padding: "13px 20px", borderRadius: 12, background: "#5865f2", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 0 24px rgba(88,101,242,0.35)" }}>
              <Star style={{ width: 16, height: 16 }} />
              Add to Collection
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button style={{ padding: "10px", borderRadius: 10, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t2)", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Heart style={{ width: 14, height: 14 }} /> Save
              </button>
              <button style={{ padding: "10px", borderRadius: 10, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t2)", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Share2 style={{ width: 14, height: 14 }} /> Share
              </button>
            </div>
            <button
              onClick={generateShowcase}
              disabled={showcaseLoading}
              style={{ padding: "10px 20px", borderRadius: 10, background: "var(--s2)", border: `1px solid ${accentColor}40`, color: accentColor, fontWeight: 600, fontSize: 13, cursor: showcaseLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: showcaseLoading ? 0.7 : 1, marginTop: 10 }}
            >
              {showcaseLoading
                ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                : <Sparkles style={{ width: 14, height: 14 }} />}
              {showcaseLoading ? "Generating AI Showcase…" : "Generate AI Showcase"}
            </button>
            {showcaseError && (
              <p style={{ fontSize: 12, color: "#f87171", margin: "8px 0 0" }}>{showcaseError}</p>
            )}
            {pattern.inspectLink && (
              <a href={pattern.inspectLink} target="_blank" rel="noopener noreferrer"
                style={{ padding: "10px 20px", borderRadius: 10, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t2)", fontWeight: 500, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <ExternalLink style={{ width: 14, height: 14 }} /> Inspect In-Game
              </a>
            )}
          </div>

          {/* Back link */}
          <Link href="/patterns" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Pattern Explorer
          </Link>
        </div>
      </div>

      {/* Similar patterns */}
      {similar.length > 0 && (
        <section style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 24px" }}>Similar Patterns</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {similar.map(p => <PatternCard key={p.id} pattern={p} />)}
          </div>
        </section>
      )}

      {/* AI showcase modal */}
      {showcaseUrl && (
        <div
          onClick={() => setShowcaseUrl(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--s1)", border: `1px solid ${accentColor}40`, borderRadius: 20, padding: 20, maxWidth: 560, width: "100%", position: "relative" }}
          >
            <button
              onClick={() => setShowcaseUrl(null)}
              aria-label="Close"
              style={{ position: "absolute", top: 14, right: 14, background: "var(--s2)", border: "1px solid var(--border)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--t3)", textTransform: "uppercase", margin: "0 0 12px" }}>
              AI Showcase — {pattern.weaponName} | {pattern.skinName} #{pattern.patternId}
            </p>
            <img src={showcaseUrl} alt={`AI-generated showcase of ${pattern.weaponName} ${pattern.skinName} pattern ${pattern.patternId}`} style={{ width: "100%", borderRadius: 12, display: "block" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, background: "var(--s2)", borderRadius: 10, padding: "12px 14px" }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "var(--t3)", textTransform: "uppercase", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "var(--t1)", margin: 0 }}>{value}</p>
    </div>
  );
}
