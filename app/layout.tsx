import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TickerBar } from "@/components/TickerBar";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://patternvault.site"),
  title: { default: "PatternVault - CS2 Skin Terminal", template: "%s | PatternVault" },
  description: "Cross-market CS2 skin price comparison and arbitrage scanner.",
};

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pv_session")?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return {
      id: session.user.id,
      steamId: session.user.steamId,
      displayName: session.user.displayName,
      avatarUrl: session.user.avatarUrl ?? undefined,
    };
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: "#0a0b0f", margin: 0 }}>
        <Sidebar user={user} />
        <div style={{ marginLeft: 200, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <header style={{ borderBottom: "1px solid var(--border)", background: "#0d0e14", position: "sticky", top: 0, zIndex: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56 }}>
              <div style={{ flex: 1, maxWidth: 420 }}>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input placeholder="Search skins, weapons..." style={{ width: "100%", paddingLeft: 38, paddingRight: 16, paddingTop: 8, paddingBottom: 8, fontSize: 13, borderRadius: 10, outline: "none", background: "var(--bg-card2)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(0,229,160,0.2)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite", display: "inline-block" }} />
                  LIVE · 6 markets
                </div>
                <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, background: "var(--bg-card2)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>
                  USD · fees on
                </div>
                {user ? (
                  <img src={user.avatarUrl ?? ""} style={{ width: 32, height: 32, borderRadius: 8 }} alt="" />
                ) : (
                  <a href="/login" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--green)", color: "#0d0e14", textDecoration: "none" }}>Sign In</a>
                )}
              </div>
            </div>
          </header>
          <TickerBar />
          <main style={{ flex: 1, padding: 24 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
