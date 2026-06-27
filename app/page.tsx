"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Zap, Shield, Globe, ArrowRight,
  TrendingDown, Filter, RefreshCw,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { MarketTable } from "@/components/MarketTable";
import { SkinCard } from "@/components/SkinCard";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkinInfo, NormalizedListing, MarketplaceSlug, WearCategory } from "@/types";
import { formatPrice, formatPercent } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const POPULAR_SKINS = [
  "AK-47 | Case Hardened (Factory New)",
  "Karambit | Doppler (Factory New)",
  "AWP | Dragon Lore (Factory New)",
  "M4A1-S | Printstream (Factory New)",
  "Desert Eagle | Blaze (Factory New)",
  "Butterfly Knife | Fade (Factory New)",
];

const MARKETPLACES: MarketplaceSlug[] = ["steam", "csfloat", "skinport", "buff", "dmarket", "gamerpay"];
const WEAR_OPTIONS: WearCategory[] = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];

interface CompareState {
  listings: NormalizedListing[];
  errors: Record<string, string>;
  cheapestPrice: number;
  cheapestMarket: string;
  spread: number;
  spreadPercent: number;
  fetchedAt: string;
}

export default function HomePage() {
  const [selectedSkin, setSelectedSkin] = useState<SkinInfo | null>(null);
  const [compareData, setCompareData] = useState<CompareState | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [minFloat, setMinFloat] = useState("");
  const [maxFloat, setMaxFloat] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<MarketplaceSlug[]>([]);
  const [wear, setWear] = useState<string>("all");

  const runCompare = useCallback(async (skinName?: string) => {
    const name = skinName ?? selectedSkin?.marketHashName;
    if (!name) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ name });
      if (minFloat) params.set("minFloat", minFloat);
      if (maxFloat) params.set("maxFloat", maxFloat);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (selectedMarkets.length) params.set("markets", selectedMarkets.join(","));

      const res = await fetch(`/api/market/compare?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setCompareData({ listings: [], errors: data.errors ?? { api: data.error ?? "Failed" }, cheapestPrice: 0, cheapestMarket: "", spread: 0, spreadPercent: 0, fetchedAt: new Date().toISOString() });
      } else {
        setCompareData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSkin, minFloat, maxFloat, minPrice, maxPrice, selectedMarkets]);

  const handleSkinSelect = (skin: SkinInfo) => {
    setSelectedSkin(skin);
    setCompareData(null);
    // Auto-compare on select
    setTimeout(() => runCompare(skin.marketHashName), 50);
  };

  const handlePopularClick = (name: string) => {
    setSelectedSkin({ id: "", marketHashName: name, name, weapon: "", skin: "", imageUrl: null, rarity: null, type: null });
    runCompare(name);
  };

  const toggleMarket = (slug: MarketplaceSlug) => {
    setSelectedMarkets((prev) =>
      prev.includes(slug) ? prev.filter((m) => m !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative border-b border-[#222222] bg-gradient-to-b from-[#0D0D0D] to-background py-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <Badge variant="secondary" className="mb-4 text-xs">
              <Zap className="h-3 w-3 mr-1 text-primary" />
              Live prices from 6 marketplaces
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-foreground">Find the</span>{" "}
              <span className="text-gradient">Best CS2 Prices</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compare skins across Steam, CSFloat, Skinport, Buff, DMarket and GamerPay.
              Spot arbitrage opportunities in real time.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <SearchBar
              onSelect={handleSkinSelect}
              className="mb-4"
            />

            {/* Filter toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {MARKETPLACES.map((slug) => (
                  <button
                    key={slug}
                    onClick={() => toggleMarket(slug)}
                    className={`transition-opacity ${selectedMarkets.includes(slug) ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                  >
                    <MarketplaceBadge marketplace={slug} size="sm" />
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className="gap-1.5 text-muted-foreground"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </Button>
            </div>

            {/* Advanced filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-4 bg-[#111111] border border-[#222222] rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Min Float</label>
                      <Input placeholder="0.00" value={minFloat} onChange={(e) => setMinFloat(e.target.value)} className="h-9" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Max Float</label>
                      <Input placeholder="1.00" value={maxFloat} onChange={(e) => setMaxFloat(e.target.value)} className="h-9" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Min Price ($)</label>
                      <Input placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-9" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Max Price ($)</label>
                      <Input placeholder="999999" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-9" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Popular searches */}
          {!selectedSkin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-muted-foreground mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SKINS.map((name) => (
                  <button
                    key={name}
                    onClick={() => handlePopularClick(name)}
                    className="text-xs px-3 py-1.5 bg-[#111111] border border-[#222222] rounded-full text-muted-foreground hover:text-foreground hover:border-[#333333] transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedSkin && (
          <motion.div
            key={selectedSkin.marketHashName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Skin header + compare button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedSkin.marketHashName}
                </h2>
                {compareData && (
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>
                      Cheapest:{" "}
                      <span className="text-success font-medium">
                        {formatPrice(compareData.cheapestPrice)}
                      </span>
                      {" "}on{" "}
                      <MarketplaceBadge
                        marketplace={compareData.cheapestMarket as MarketplaceSlug}
                        size="sm"
                      />
                    </span>
                    <span>
                      Spread:{" "}
                      <span className="text-foreground font-medium">
                        {formatPrice(compareData.spread)} ({formatPercent(compareData.spreadPercent)})
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runCompare()}
                  disabled={loading}
                  className="gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Fetching..." : "Refresh"}
                </Button>
                {selectedSkin.id && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/skin/${selectedSkin.id}`} className="gap-1.5">
                      Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Errors */}
            {compareData?.errors && Object.keys(compareData.errors).length > 0 && (
              <div className="mb-4 p-3 bg-[#1A0D0D] border border-danger/20 rounded-lg text-xs text-muted-foreground">
                Failed to fetch from:{" "}
                {Object.keys(compareData.errors).map((m, i) => (
                  <span key={m}>
                    <MarketplaceBadge marketplace={m as MarketplaceSlug} size="sm" />
                    {i < Object.keys(compareData.errors).length - 1 ? ", " : ""}
                  </span>
                ))}
                {" "}— configure API keys to enable.
              </div>
            )}

            {/* Market table */}
            <MarketTable
              listings={compareData?.listings ?? []}
              loading={loading}
              onRefresh={() => runCompare()}
              lastUpdated={compareData?.fetchedAt}
            />
          </motion.div>
        )}

        {/* Stats when no search */}
        {!selectedSkin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8"
          >
            {[
              {
                icon: Globe,
                title: "6 Marketplaces",
                desc: "Steam, CSFloat, Skinport, Buff, DMarket, GamerPay",
              },
              {
                icon: TrendingDown,
                title: "Find Best Prices",
                desc: "Instantly compare listings and spot the cheapest options",
              },
              {
                icon: Shield,
                title: "Arbitrage Scanner",
                desc: "Automatically detect profitable buying opportunities",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-[#111111] border border-[#222222] rounded-xl"
              >
                <card.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
