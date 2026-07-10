"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { PatternCard } from "@/components/PatternCard";
import { MOCK_PATTERNS } from "@/lib/mock";
import type { MockPattern } from "@/lib/mock";

const WEAPONS = ["All", "AK-47", "Karambit", "Five-SeveN", "Butterfly Knife"];
const TIERS   = ["All", "Tier 5", "Tier 4", "Tier 3", "Tier 2", "Tier 1"];
const FILTERS = ["All", "Blue Gems", "Fades", "Dopplers", "Sapphires", "Rubies", "Black Pearls"];
const SORTS   = ["Rarity Score", "Blue %", "Fade %", "Last Sale Price", "Premium"];

export default function PatternsPage() {
  const [search, setSearch]   = useState("");
  const [weapon, setWeapon]   = useState("All");
  const [filter, setFilter]   = useState("All");
  const [sort, setSort]       = useState("Rarity Score");
  const [minBlue, setMinBlue] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);

  const results = useMemo(() => {
    let list: MockPattern[] = [...MOCK_PATTERNS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.skinName.toLowerCase().includes(q) ||
        p.weaponName.toLowerCase().includes(q) ||
        String(p.patternId).includes(q)
      );
    }

    if (weapon !== "All") list = list.filter(p => p.weaponName === weapon);

    if (filter === "Blue Gems")   list = list.filter(p => p.isBlueGem);
    if (filter === "Fades")       list = list.filter(p => p.fadePercent != null);
    if (filter === "Dopplers")    list = list.filter(p => p.phase != null);
    if (filter === "Sapphires")   list = list.filter(p => p.phase === "Sapphire");
    if (filter === "Rubies")      list = list.filter(p => p.phase === "Ruby");
    if (filter === "Black Pearls")list = list.filter(p => p.phase === "Black Pearl");

    if (minBlue > 0) list = list.filter(p => (p.bluePercent ?? 0) >= minBlue);

    list.sort((a, b) => {
      if (sort === "Blue %")          return (b.bluePercent ?? 0) - (a.bluePercent ?? 0);
      if (sort === "Fade %")          return (b.fadePercent ?? 0) - (a.fadePercent ?? 0);
      if (sort === "Last Sale Price") return (b.lastSalePrice ?? 0) - (a.lastSalePrice ?? 0);
      if (sort === "Premium")         return b.premiumMulti - a.premiumMulti;
      return b.rarityScore - a.rarityScore; // default: Rarity Score
    });

    return list;
  }, [search, weapon, filter, sort, minBlue]);

  return (
    <div style={{ maxWidth: 1380, margin: "0 auto", padding: "48px 24px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "var(--t3)", textTransform: "uppercase", margin: "0 0 8px" }}>Browse</p>
        <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Pattern Explorer</h1>
        <p style={{ fontSize: 16, color: "var(--t2)", margin: 0 }}>
          {MOCK_PATTERNS.length.toLocaleString()} patterns documented — search, filter, and discover.
        </p>
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {/* Sidebar filters */}
        {showSidebar && (
          <aside style={{ width: 240, flexShrink: 0 }}>
            <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Type filter */}
              <FilterGroup label="Type">
                {FILTERS.map(f => (
                  <FilterPill key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
                ))}
              </FilterGroup>

              {/* Weapon */}
              <FilterGroup label="Weapon">
                {WEAPONS.map(w => (
                  <FilterPill key={w} label={w} active={weapon === w} onClick={() => setWeapon(w)} />
                ))}
              </FilterGroup>

              {/* Tier */}
              <FilterGroup label="Tier">
                {TIERS.map(t => (
                  <FilterPill key={t} label={t} active={false} onClick={() => {}} />
                ))}
              </FilterGroup>

              {/* Blue % slider */}
              <FilterGroup label={`Min Blue % — ${minBlue}%`}>
                <input type="range" min={0} max={99} value={minBlue} onChange={e => setMinBlue(+e.target.value)}
                  style={{ width: "100%", accentColor: "#60a5fa", marginTop: 4 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
                  <span>0%</span><span>99%</span>
                </div>
              </FilterGroup>

              {/* Reset */}
              {(filter !== "All" || weapon !== "All" || minBlue > 0 || search) && (
                <button onClick={() => { setFilter("All"); setWeapon("All"); setMinBlue(0); setSearch(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t2)", fontSize: 13, cursor: "pointer" }}>
                  <X style={{ width: 13, height: 13 }} />
                  Clear filters
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <button onClick={() => setShowSidebar(s => !s)}
              style={{ padding: "8px 12px", borderRadius: 8, background: showSidebar ? "var(--s3)" : "var(--s2)", border: "1px solid var(--border)", color: "var(--t2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <SlidersHorizontal style={{ width: 14, height: 14 }} />
              Filters
            </button>

            {/* Search */}
            <div style={{ flex: 1, position: "relative" }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--t3)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by skin, weapon, pattern ID..."
                style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 8, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t1)", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
              />
            </div>

            {/* Sort */}
            <div style={{ position: "relative" }}>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: "8px 32px 8px 12px", borderRadius: 8, background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t1)", fontSize: 13, cursor: "pointer", appearance: "none", outline: "none", fontFamily: "Inter, sans-serif" }}>
                {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--t3)", pointerEvents: "none" }} />
            </div>

            <span style={{ fontSize: 13, color: "var(--t3)", whiteSpace: "nowrap" }}>{results.length} results</span>
          </div>

          {/* Active filter chips */}
          {(filter !== "All" || weapon !== "All" || minBlue > 0) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {filter !== "All" && <ActiveChip label={filter} onRemove={() => setFilter("All")} />}
              {weapon !== "All" && <ActiveChip label={weapon} onRemove={() => setWeapon("All")} />}
              {minBlue > 0    && <ActiveChip label={`Blue ≥ ${minBlue}%`} onRemove={() => setMinBlue(0)} />}
            </div>
          )}

          {/* Results grid */}
          {results.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {results.map(p => <PatternCard key={p.id} pattern={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--t3)" }}>
              <p style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>No patterns found</p>
              <p style={{ fontSize: 14 }}>Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--t3)", textTransform: "uppercase", margin: "0 0 10px" }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{children}</div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid",
      background: active ? "rgba(88,101,242,0.12)" : "var(--s2)",
      borderColor: active ? "rgba(88,101,242,0.4)" : "var(--border)",
      color: active ? "#818cf8" : "var(--t2)",
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 12px", borderRadius: 20, background: "rgba(88,101,242,0.1)", border: "1px solid rgba(88,101,242,0.3)", fontSize: 12, color: "#818cf8", fontWeight: 500 }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#818cf8", padding: 0, display: "flex", alignItems: "center" }}>
        <X style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
}
