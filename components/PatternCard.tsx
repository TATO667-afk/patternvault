"use client";
import Link from "next/link";
import { Heart, TrendingUp } from "lucide-react";
import type { MockPattern } from "@/lib/mock";

const TIER_LABELS = ["", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
const TIER_COLORS = ["", "#6b7280", "#22c55e", "#3b82f6", "#a855f7", "#f59e0b"];

const PHASE_COLORS: Record<string, string> = {
  "Sapphire":    "#60a5fa",
  "Ruby":        "#f87171",
  "Black Pearl": "#a78bfa",
  "Phase 1":     "#818cf8",
  "Phase 2":     "#c084fc",
  "Phase 3":     "#f472b6",
  "Phase 4":     "#34d399",
};

function TierBadge({ tier, isBlueGem }: { tier: number; isBlueGem: boolean }) {
  if (isBlueGem) {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)", letterSpacing: "0.04em" }}>
        BLUE GEM
      </span>
    );
  }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${TIER_COLORS[tier]}18`, color: TIER_COLORS[tier], border: `1px solid ${TIER_COLORS[tier]}40`, letterSpacing: "0.04em" }}>
      T{tier} · {TIER_LABELS[tier]}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const color = PHASE_COLORS[phase] ?? "#818cf8";
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}40`, letterSpacing: "0.04em" }}>
      {phase.toUpperCase()}
    </span>
  );
}

export function PatternCard({ pattern, size = "md" }: { pattern: MockPattern; size?: "sm" | "md" | "lg" }) {
  const isLg = size === "lg";
  const isSm = size === "sm";

  const formatPrice = (p?: number) => {
    if (!p) return null;
    if (p >= 1000) return `$${(p / 1000).toFixed(0)}k`;
    return `$${p.toLocaleString()}`;
  };

  return (
    <Link href={`/patterns/${pattern.slug}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--s2)", border: "1px solid var(--border)", borderRadius: isLg ? 20 : 14,
        overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
        position: "relative",
      }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--border2)";
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--border)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }}>

        {/* Blue gem glow */}
        {pattern.isBlueGem && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
        )}

        {/* Image area */}
        <div style={{ position: "relative", background: "linear-gradient(135deg, var(--s1), var(--s3))", paddingBottom: isLg ? "66%" : isSm ? "70%" : "70%", overflow: "hidden" }}>
          <img
            src={pattern.imageUrl}
            alt={`${pattern.weaponName} | ${pattern.skinName} #${pattern.patternId}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: "12%", transition: "transform 0.3s" }}
            onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
          />
          {/* Favorite btn */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
            style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 8, background: "rgba(7,8,10,0.8)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}>
            <Heart style={{ width: 14, height: 14, color: "var(--t3)" }} />
          </button>
          {/* Pattern ID badge */}
          <div style={{ position: "absolute", bottom: 10, left: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(7,8,10,0.8)", border: "1px solid var(--border)", fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "var(--t2)", zIndex: 2 }}>
            #{pattern.patternId}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isLg ? 20 : isSm ? 12 : 14, position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            {pattern.phase
              ? <PhaseBadge phase={pattern.phase} />
              : <TierBadge tier={pattern.tier} isBlueGem={pattern.isBlueGem} />
            }
          </div>

          <p style={{ fontSize: isSm ? 11 : 12, color: "var(--t3)", margin: "0 0 2px" }}>{pattern.weaponName}</p>
          <p style={{ fontSize: isLg ? 17 : isSm ? 13 : 15, fontWeight: 700, color: "var(--t1)", margin: "0 0 10px", lineHeight: 1.3 }}>
            {pattern.skinName}
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {pattern.bluePercent != null && (
              <Stat label="Blue" value={`${pattern.bluePercent.toFixed(1)}%`} color="#60a5fa" />
            )}
            {pattern.fadePercent != null && (
              <Stat label="Fade" value={`${pattern.fadePercent.toFixed(1)}%`} color="#f472b6" />
            )}
            {pattern.rarityScore != null && (
              <Stat label="Rarity" value={`${pattern.rarityScore.toFixed(0)}`} color="#a855f7" />
            )}
          </div>

          {/* Price & premium */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: isLg ? 20 : 16, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: "var(--t1)" }}>
              {formatPrice(pattern.lastSalePrice) ?? "—"}
            </span>
            {pattern.premiumMulti > 1 && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: "#22c55e" }}>
                <TrendingUp style={{ width: 12, height: 12 }} />
                {pattern.premiumMulti.toFixed(1)}x
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "var(--s3)", borderRadius: 6, padding: "4px 8px" }}>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", color: "var(--t3)", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color }}>{value}</span>
    </div>
  );
}
