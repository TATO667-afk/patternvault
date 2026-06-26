"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bookmark, Bell, History, TrendingUp,
  Star, Zap, BarChart3, ArrowRight,
} from "lucide-react";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { AlertManager } from "@/components/AlertManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  watchlistCount: number;
  alertCount: number;
  activeAlerts: number;
  opportunitiesCount: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user").then((r) => r.json()),
      fetch("/api/watchlist").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
    ])
      .then(([userData, watchlistData, alertData]) => {
        setUser(userData.user);
        const alerts = alertData.data ?? [];
        setStats({
          watchlistCount: (watchlistData.data ?? []).length,
          alertCount: alerts.length,
          activeAlerts: alerts.filter((a: any) => a.isActive && !a.triggered).length,
          opportunitiesCount: 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-muted-foreground py-24">
        <BarChart3 className="h-12 w-12 mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to access your dashboard</h2>
        <p className="mb-6 text-sm">Track skins, set alerts, and monitor opportunities.</p>
        <Link href="/api/auth/steam">
          <Button className="gap-2">Sign In with Steam</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {user ? (
          <div className="flex items-center gap-3">
            {user.avatarUrl && (
              <img src={user.avatarUrl} alt={user.displayName} className="w-12 h-12 rounded-full" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user.displayName}
              </h1>
              <p className="text-muted-foreground text-sm">Your CS2 trading dashboard</p>
            </div>
          </div>
        ) : (
          <Skeleton className="h-12 w-64" />
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Watchlist",
            value: stats?.watchlistCount ?? "—",
            icon: Bookmark,
            color: "text-primary",
            href: "/dashboard#watchlist",
          },
          {
            label: "Price Alerts",
            value: stats?.alertCount ?? "—",
            icon: Bell,
            color: "text-yellow-400",
            href: "/dashboard#alerts",
          },
          {
            label: "Active Alerts",
            value: stats?.activeAlerts ?? "—",
            icon: Star,
            color: "text-success",
            href: "/dashboard#alerts",
          },
          {
            label: "Opportunities",
            value: "Live",
            icon: Zap,
            color: "text-purple-400",
            href: "/opportunities",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={stat.href}>
              <Card className="hover:border-[#333333] transition-colors cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? <Skeleton className="h-7 w-8" /> : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Watchlist + Alerts tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="watchlist">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="watchlist" className="gap-2">
                <Bookmark className="h-3.5 w-3.5" />
                Watchlist
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                <Bell className="h-3.5 w-3.5" />
                Alerts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="watchlist">
              <WatchlistPanel />
            </TabsContent>
            <TabsContent value="alerts">
              <AlertManager />
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick links / tips */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {[
                { label: "Compare Market Prices", icon: BarChart3, href: "/" },
                { label: "Scan Opportunities", icon: Zap, href: "/opportunities" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#222222] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <action.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-sm text-muted-foreground">
              <p>💡 Enable browser notifications to get alerted the moment a skin hits your target price.</p>
              <p>💡 Configure API keys in your <code>.env</code> file to get live data from all marketplaces.</p>
              <p>💡 Use float filters on the Market Compare page to find only skins matching your criteria.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
