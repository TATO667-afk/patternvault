"use client";

const TICKERS = [
  { name: "AK-47 Asiimov", price: "$68", change: "+25.1%" },
  { name: "AWP Dragon Lore", price: "$11.2k", change: "+18.7%" },
  { name: "M4A1-S Hyper Beast", price: "$79", change: "+22.2%" },
  { name: "USP-S Kill Confirmed", price: "$118", change: "+22.7%" },
  { name: "Karambit Fade", price: "$2.1k", change: "+14.3%" },
  { name: "Glock-18 Fade", price: "$402", change: "+18.2%" },
  { name: "Butterfly Knife", price: "$4.2k", change: "+11.8%" },
  { name: "M9 Bayonet", price: "$890", change: "+9.4%" },
];

export function TickerBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", background: "#0d0e14", height: 36, overflow: "hidden", flexShrink: 0 }}>
      <div style={{ flexShrink: 0, padding: "0 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--green)", borderRight: "1px solid var(--border)", height: "100%", display: "flex", alignItems: "center" }}>
        MOVERS
      </div>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{ display: "flex", gap: 28, padding: "0 16px", whiteSpace: "nowrap", animation: "ticker 35s linear infinite" }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{t.name}</span>
              <span style={{ fontFamily: "monospace", color: "var(--text-dim)" }}>{t.price}</span>
              <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--green)" }}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
