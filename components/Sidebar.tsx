"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, Package, Bookmark, Bell, Settings, ChevronDown } from "lucide-react";

interface SidebarProps {
  user?: { displayName: string; avatarUrl?: string } | null;
}

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compare", label: "Market Compare", icon: BarChart2, badge: "47" },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark, badge: "12" },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside style={{ position: "fixed", left: 0, top: 0, height: "100vh", width: 200, display: "flex", flexDirection: "column", zIndex: 50, background: "#0d0e14", borderRight: "1px solid var(--border)" }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 28, height: 28, background: "var(--green)", transform: "rotate(45deg)", borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 10, height: 10, background: "#0d0e14", borderRadius: 2 }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", color: "var(--text)" }}>PATTERNVAULT</div>
          <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "var(--text-muted)" }}>SKIN TERMINAL</div>
        </div>
      </div>
      {/* Nav */}
      <div style={{ padding: "20px 12px 8px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-muted)", margin: "0 0 10px 8px" }}>TRADING</p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: active ? "#0d0e14" : "var(--text-dim)", background: active ? "var(--green)" : "transparent", textDecoration: "none" }}>
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 6, fontFamily: "monospace", background: active ? "rgba(0,0,0,0.2)" : "var(--green-dim)", color: active ? "#0d0e14" : "var(--green)" }}>{badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div style={{ flex: 1 }} />
      {/* Wallet */}
      <div style={{ margin: "0 12px 10px", padding: 12, borderRadius: 12, background: "var(--bg-card2)", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Wallet balance</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "monospace", margin: "0 0 2px" }}>$12,480<span style={{ color: "var(--text-muted)" }}>.50</span></p>
        <p style={{ fontSize: 11, color: "var(--green)", margin: 0 }}>+$842.10 unrealized</p>
      </div>
      {/* User */}
      <div style={{ margin: "0 12px 16px", padding: "10px 12px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--border)", cursor: "pointer" }}>
        {user?.avatarUrl
          ? <img src={user.avatarUrl} style={{ width: 32, height: 32, borderRadius: 8 }} alt="" />
          : <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green)", color: "#0d0e14", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{user?.displayName?.[0]?.toUpperCase() ?? "?"}</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{user?.displayName ?? "Guest"}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Pro · Tier 3</p>
        </div>
        <ChevronDown style={{ width: 14, height: 14, color: "var(--text-muted)", flexShrink: 0 }} />
      </div>
    </aside>
  );
}
