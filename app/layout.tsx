import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://patternvault.site"),
  title: { default: "PatternVault — CS2 Pattern Database", template: "%s · PatternVault" },
  description: "The definitive CS2 skin pattern database. Track Blue Gems, Fades, Dopplers, and rare patterns with Pattern DNA, price history, and collector tools.",
  openGraph: { type: "website", siteName: "PatternVault" },
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
    return { displayName: session.user.displayName, avatarUrl: session.user.avatarUrl ?? undefined };
  } catch { return null; }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ background: "#07080a", margin: 0 }}>
        <Navbar user={user} />
        <div style={{ paddingTop: 60 }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
