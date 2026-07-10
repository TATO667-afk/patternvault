import Link from "next/link";
import { BarChart3, Shield, Zap, Bell, Bookmark } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const errors: Record<string, string> = {
    invalid: "Steam verification failed. Please try again.",
    no_steam_id: "Could not extract your Steam ID.",
    profile_failed: "Could not fetch your Steam profile.",
  };
  const errorMessage = sp.error ? (errors[sp.error] ?? null) : null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-[#4F46E5]/10 rounded-2xl flex items-center justify-center mb-3">
              <BarChart3 className="w-7 h-7 text-[#4F46E5]" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Pattern<span className="text-[#4F46E5]">Vault</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">CS2 Skin Market Compare</p>
          </div>
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-sm text-red-400">
              {errorMessage}
            </div>
          )}
          <a
            href="/api/auth/steam"
            className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-[#1B2838] hover:bg-[#243447] border border-[#2a475e] rounded-xl text-white font-semibold transition-colors"
          >
            Sign in with Steam
          </a>
          <p className="text-center text-xs text-gray-500 mt-4">
            You will be redirected to Steam. We never store your password.
          </p>
          <div className="mt-6 pt-6 border-t border-[#222222] grid grid-cols-2 gap-3">
            {[
              { icon: "??", title: "Watchlist", desc: "Track your skins" },
              { icon: "??", title: "Alerts", desc: "Price drop alerts" },
              { icon: "?", title: "Opportunities", desc: "Arbitrage scanner" },
              { icon: "???", title: "Free", desc: "No card needed" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-2">
                <span className="text-sm">{f.icon}</span>
                <div>
                  <p className="text-xs font-medium text-white">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          <Link href="/" className="hover:text-white transition-colors">
            Continue without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}
