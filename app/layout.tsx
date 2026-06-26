import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://patternvault.vercel.app"),
  title: { default: "PatternVault – CS2 Skin Market Compare", template: "%s | PatternVault" },
  description: "Find the best CS2 skin prices across Steam, CSFloat, Skinport, Buff, DMarket and GamerPay.",
  keywords: ["CS2", "Counter-Strike 2", "skin market", "price compare", "CSFloat", "Skinport"],
  openGraph: {
    type: "website",
    siteName: "PatternVault",
    title: "PatternVault – CS2 Skin Market Compare",
    description: "Find the best CS2 skin prices across all major marketplaces.",
  },
  robots: { index: true, follow: true },
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
      profileUrl: session.user.profileUrl ?? undefined,
    };
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0A0A0A] antialiased`}>
        <Navbar user={user} />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <footer className="border-t border-[#222222] py-8 text-center text-xs text-gray-500">
          <p>PatternVault is not affiliated with Valve Corporation or any marketplace.</p>
          <p className="mt-1">© {new Date().getFullYear()} PatternVault</p>
        </footer>
      </body>
    </html>
  );
}
