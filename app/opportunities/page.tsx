"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Star, Filter, RefreshCw } from "lucide-react";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OpportunityItem, OpportunityType } from "@/types";
import type { Metadata } from "next";

const TYPES: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Opportunities", icon: <Zap className="h-4 w-4" /> },
  { value: "arbitrage", label: "Arbitrage", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "underpriced", label: "Underpriced", icon: <Zap className="h-4 w-4" /> },
  { value: "rare_pattern", label: "Rare Pattern", icon: <Star className="h-4 w-4" /> },
  { value: "low_float", label: "Low Float", icon: <TrendingUp className="h-4 w-4" /> },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [minProfit, setMinProfit] = useState("5");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetch = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "20",
        minProfit,
      });
      if (type !== "all") params.set("type", type);

      const res = await window.fetch(`/api/opportunities?${params}`);
      const data = await res.json();

      if (reset) {
        setOpportunities(data.data ?? []);
        setPage(1);
      } else {
        setOpportunities((prev) => [...prev, ...(data.data ?? [])]);
      }
      setTotal(data.total ?? 0);
      setHasMore(data.hasMore ?? false);
    } catch {}
    setLoading(false);
  }, [type, minProfit, page]);

  useEffect(() => {
    fetch(true);
  }, [type, minProfit]);

  const loadMore = () => {
    setPage((p) => p + 1);
    fetch(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Opportunity Scanner</h1>
          <Badge variant="secondary" className="ml-2 text-xs">
            {total} found
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Automatically detected underpriced skins, arbitrage gaps, and rare patterns.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Type pills */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                type === t.value
                  ? "bg-primary text-white"
                  : "bg-[#1A1A1A] text-muted-foreground hover:text-foreground border border-[#222222]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Min profit */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Min profit:</span>
          <Select value={minProfit} onValueChange={setMinProfit}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["1", "5", "10", "25", "50", "100"].map((v) => (
                <SelectItem key={v} value={v}>${v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetch(true)}
            disabled={loading}
            className="h-8 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Scan
          </Button>
        </div>
      </div>

      {/* Results grid */}
      {loading && opportunities.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Zap className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No opportunities found</p>
          <p className="text-sm mt-1">Try lowering the minimum profit threshold.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {opportunities.map((opp, i) => (
              <OpportunityCard key={opp.id} opportunity={opp} index={i} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
