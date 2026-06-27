"use client";
import { useState, useCallback } from "react";
import { RefreshCw, TrendingUp, Zap, Activity, DollarSign } from "lucide-react";

const POPULAR = [
  "AK-47 | Asiimov (Field-Tested)",
  "AWP | Dragon Lore (Field-Tested)",
  "Karambit | Fade (Factory New)",
  "M4A1-S | Hyper Beast (Minimal Wear)",
  "USP-S | Kill Confirmed (Minimal Wear)",
];

const MC: Record<string, string> = {
  steam: "#1b9bec",
  csfloat: "#00e5a0",
  skinport: "#e06c47",
  buff: "#f5c518",
  dmarket: "#a855f7",
  gamerpay: "#ec4899",
};

interface Listing {
  id: string;
  marketplace: string;
  price: number;
  wear?: string;
  floatValue?: number;
  listingUrl?: string;
  diffPercent?: number;
}

interface CompareData {
  listings: Listing[];
  errors: Record<string, string>;
  cheapestPrice: number;
  cheapestMarket: string;
  spread: number;
  spreadPercent: number;
  fetchedAt: string;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<CompareData | null>(null);
  const [skin, setSkin] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTime, setActiveTime] = useState("24h");

  const compare = useCallback(async (name: string) => {
    if (!name) return;
    setLoading(true);
    setSkin(name);
    try {
      const res = await fetch("/api/market/compare?name=" + encodeURIComponent(name));
      const d = await res.json();
      setData({
        listings: d.listings ?? [],
        errors: d.errors ?? {},
        cheapestPrice: d.cheapestPrice ?? 0,
        cheapestMarket: d.cheapestMarket ?? "",
        spread: d.spread ?? 0,
        spreadPercent: d.spreadPercent ?? 0,
        fetchedAt: d.fetchedAt ?? new Date().toISOString(),
      });
    } catch {
      setData({ listings: [], errors: {}, cheapestPrice: 0, cheapestMarket: "", spread: 0, spreadPercent: 0, fetchedAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  }, []);

  const fmt = (n?: number | null) =>
    n == null || isNaN(n) ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

  const fmtPct = (n?: number | null) =>
    n == null || isNaN(n) ? "—" : (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

  const sorted = data ? [...data.listings].sort((a, b) => a.price - b.price) : [];
  const cheap = sorted[0];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>Market Compare</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Cross-market spreads and live arbitrage across 6 marketplaces.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["1h", "24h", "7d", "30d"].map(t => (
            <button key={t} onClick={() => setActiveTime(t)}
              style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", background: activeTime === t ? "var(--green)" : "var(--bg-card2)", color: activeTime === t ? "#0d0e14" : "var(--text-dim)", border: "1px solid " + (activeTime === t ? "transparent" : "var(--border)") }}>
              {t}
            </button>
          ))}
          <button onClick={() => skin && compare(skin)} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--green)", color: "#0d0e14", border: "none", cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14, animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Best spread today", value: data ? fmtPct(data.spreadPercent) : "—", sub: data?.cheapestMarket || "no skin selected", color: "var(--green)" },
          { label: "Open opportunities", value: data ? String(data.listings.length) : "—", sub: "across markets", color: "var(--green)" },
          { label: "Avg margin (7d)", value: "9.2%", sub: "after fees & tax", color: "var(--yellow)" },
          { label: "24h tracked volume", value: "$1.24M", sub: "-3.1% vs avg", color: "var(--red)" },
        ].map(c => (
          <div key={c.label} style={{ borderRadius: 14, padding: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--text-muted)", margin: "0 0 8px", textTransform: "uppercase" }}>{c.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: c.color, margin: "0 0 4px" }}>{c.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 560 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && query) compare(query); }}
            placeholder="e.g. AK-47 | Asiimov (Field-Tested)"
            style={{ flex: 1, padding: "10px 14px", fontSize: 13, borderRadius: 10, outline: "none", background: "var(--bg-card2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <button onClick={() => query && compare(query)}
            style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "var(--green)", color: "#0d0e14", border: "none", cursor: "pointer" }}>
            Compare
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {POPULAR.map(s => (
            <button key={s} onClick={() => compare(s)}
              style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, background: "var(--bg-card2)", border: "1px solid var(--border)", color: "var(--text-dim)", cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel layout */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
        {/* Left: price panel */}
        <div style={{ borderRadius: 14, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>Price across markets</p>
          </div>
          {skin && data ? (
            <div style={{ padding: 16 }}>
              <div style={{ padding: 12, borderRadius: 10, background: "var(--bg-card2)", border: "1px solid var(--border)", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "var(--red)", margin: "0 0 2px" }}>Field-Tested</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>{skin.split(" (")[0]}</p>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", margin: 0 }}>float —</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", letterSpacing: "0.1em" }}>SPREAD</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "var(--green)", margin: 0 }}>{fmtPct(data.spreadPercent)}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", letterSpacing: "0.1em" }}>NET PROFIT</p>
                  <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "var(--green)", margin: 0 }}>+{fmt(data.spread)}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sorted.length > 0 ? sorted.slice(0, 6).map((l, i) => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: i === 0 ? "var(--green-dim)" : "var(--bg-card2)", border: "1px solid " + (i === 0 ? "rgba(0,229,160,0.3)" : "var(--border)") }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: MC[l.marketplace] ?? "#888", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, textTransform: "capitalize", color: i === 0 ? "var(--green)" : "var(--text)" }}>{l.marketplace}</span>
                      {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "var(--green)", color: "#0d0e14" }}>BEST BUY</span>}
                      {i === sorted.length - 1 && i > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "var(--red-dim)", color: "var(--red)" }}>HIGH</span>}
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: i === 0 ? "var(--green)" : i === sorted.length - 1 ? "var(--red)" : "var(--text)" }}>
                      {fmt(l.price)}
                    </span>
                  </div>
                )) : (
                  <p style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: "var(--text-muted)" }}>No listings found.</p>
                )}
              </div>
              {sorted.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <a href={cheap?.listingUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: "center", background: "var(--green)", color: "#0d0e14", textDecoration: "none" }}>
                    Buy {data.cheapestMarket}
                  </a>
                  <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "var(--bg-card2)", color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer" }}>
                    List Highest
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Search for a skin to see prices
            </div>
          )}
        </div>

        {/* Right: arbitrage table */}
        <div style={{ borderRadius: 14, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Arbitrage Opportunities</p>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(0,229,160,0.2)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite", display: "inline-block" }} />
              {sorted.length} live
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {["All", "Steam", "Buff", "Skinport", "CSFloat"].map((m, i) => (
                <button key={m} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: i === 0 ? "var(--green)" : "var(--bg-card2)", color: i === 0 ? "#0d0e14" : "var(--text-muted)", border: "1px solid " + (i === 0 ? "transparent" : "var(--border)") }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["ITEM", "BUY FROM", "SELL TO", "SPREAD", "PROFIT", "VOL"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.length > 1 ? sorted.slice(1).map(l => {
                  const profit = l.price - (cheap?.price ?? 0);
                  const pct = cheap?.price ? (profit / cheap.price) * 100 : 0;
                  return (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-card2)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 3, height: 32, borderRadius: 2, background: "var(--green)", flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 500, color: "var(--text)", margin: "0 0 2px" }}>{skin.split(" (")[0]}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{l.wear ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: MC[cheap?.marketplace ?? ""] ?? "#888" }} />
                          <span style={{ textTransform: "capitalize", color: "var(--text-dim)" }}>{cheap?.marketplace}</span>
                        </div>
                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", margin: "2px 0 0" }}>{fmt(cheap?.price)}</p>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: MC[l.marketplace] ?? "#888" }} />
                          <span style={{ textTransform: "capitalize", color: "var(--text-dim)" }}>{l.marketplace}</span>
                        </div>
                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", margin: "2px 0 0" }}>{fmt(l.price)}</p>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <svg viewBox="0 0 60 20" style={{ width: 48, height: 16 }}>
                            <polyline points="0,16 20,10 40,6 60,9" fill="none" stroke="var(--green)" strokeWidth="1.5" />
                          </svg>
                          <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--green)" }}>{fmtPct(pct)}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 600, color: profit >= 0 ? "var(--green)" : "var(--red)" }}>
                        {profit >= 0 ? "+" : ""}{fmt(profit)}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
                        {Math.floor(Math.random() * 900 + 100)}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "56px 16px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                      {loading ? "Fetching prices..." : "Search for a skin to see arbitrage opportunities"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
