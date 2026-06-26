import { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Shield, Zap, Bell, Bookmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to PatternVault with your Steam account.",
};

const FEATURES = [
  { icon: Bookmark, title: "Watchlist", desc: "Track your favourite skins" },
  { icon: Bell, title: "Price Alerts", desc: "Get notified on price drops" },
  { icon: Zap, title: "Opportunities", desc: "Monitor arbitrage deals" },
  { icon: Shield, title: "Free to use", desc: "No credit card required" },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const errors: Record<string, string> = {
    invalid: "Steam verification failed. Please try again.",
    no_steam_id: "Could not extract your Steam ID.",
    profile_failed: "Could not fetch your Steam profile.",
  };

  const errorMessage = (await searchParams).error ? errors[(await searchParams).error] : null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Pattern<span className="text-primary">Vault</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">CS2 Skin Market Compare</p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
              {errorMessage}
            </div>
          )}

          {/* Steam sign in */}
          <a
            href="/api/auth/steam"
            className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-[#1B2838] hover:bg-[#243447] border border-[#2a475e] rounded-xl text-white font-semibold transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4C12.954 4 4 12.954 4 24c0 9.13 6.004 16.87 14.318 19.457L23.59 32.5A6 6 0 0 1 30 26a6 6 0 0 1 6 6 6 6 0 0 1-6 6c-.23 0-.457-.013-.68-.038l-9.925 4.092C22.19 43.67 23.085 44 24 44c11.046 0 20-8.954 20-20S35.046 4 24 4z"
                fill="#c6d4df"
              />
              <circle cx="30" cy="32" r="4" fill="#1B2838" />
            </svg>
            Sign in with Steam
          </a>

          <p className="text-center text-xs text-muted-foreground mt-4">
            You'll be redirected to Steam's login page. We never store your password.
          </p>

          <div className="mt-6 pt-6 border-t border-[#222222] grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-2">
                <f.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Continue without signing in →
          </Link>
        </p>
      </div>
    </div>
  );
}
