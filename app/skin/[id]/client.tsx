"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Bell, ExternalLink } from "lucide-react";
import { PriceChart } from "@/components/PriceChart";
import { MarketTable } from "@/components/MarketTable";
import { SkinCard } from "@/components/SkinCard";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NormalizedListing, PriceHistoryPoint, PriceHistoryPeriod, SkinInfo, MarketplaceSlug } from "@/types";
import { formatPrice, formatPercent, formatFloat, getRarityColor } from "@/lib/utils";

export default function SkinDetailClient({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PriceHistoryPeriod>("7d");
  const [watchlisted, setWatchlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/skins/${id}?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, period]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96" />
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );

  if (!data?.skin) return (
    <div className="flex flex-col items-center justify-center min-h-96 text-gray-400">
      <p className="text-lg">Skin not found</p>
      <Link href="/" className="mt-4 text-[#4F46E5] hover:underline">Back to search</Link>
    </div>
  );

  const { skin, priceHistory, listings, similar } = data;
  const rarityColor = getRarityColor(skin.rarity ?? "");
  const cheapest = listings[0];
  const avgPrice = priceHistory.length
    ? priceHistory.reduce((s: number, p: any) => s + p.avgPrice, 0) / priceHistory.length
    : cheapest?.price;
  const change24h = priceHistory.length >= 2
    ? ((priceHistory[priceHistory.length - 1].avgPrice - priceHistory[0].avgPrice) / priceHistory[0].avgPrice) * 100
    : 0;

  const toggleWatchlist = async () => {
    if (watchlisted) {
      await fetch(`/api/watchlist?skinId=${skin.id}`, { method: "DELETE" });
    } else {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId: skin.id }),
      });
    }
    setWatchlisted((v) => !v);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="relative bg-[#0D0D0D] border border-[#222222] rounded-xl p-6 flex items-center justify-center min-h-56 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: rarityColor }} />
            {skin.imageUrl ? (
              <Image src={skin.imageUrl} alt={skin.marketHashName} width={280} height={210} className="object-contain max-h-48 drop-shadow-2xl" unoptimized />
            ) : (
              <div className="w-48 h-36 bg-[#1A1A1A] rounded flex items-center justify-center text-gray-500 text-sm">No image</div>
            )}
          </div>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400">{skin.weapon}</p>
                <h1 className="text-xl font-bold text-white">{skin.skin || skin.marketHashName}</h1>
              </div>
              {skin.rarity && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: rarityColor }} /><span className="text-sm text-gray-400">{skin.rarity}</span></div>}
              {cheapest?.floatValue !== undefined && (
                <div><p className="text-xs text-gray-400 mb-0.5">Float</p><p className="text-sm font-mono font-medium text-white">{formatFloat(cheapest.floatValue)}</p></div>
              )}
              {cheapest?.paintSeed !== undefined && (
                <div><p className="text-xs text-gray-400 mb-0.5">Pattern ID</p><p className="text-sm font-mono font-medium text-white">#{cheapest.paintSeed}</p></div>
              )}
              <div className="pt-2 flex flex-col gap-2">
                <button onClick={toggleWatchlist} className={`flex items-center justify-center gap-2 w-full py-2 rounded-md text-sm font-medium border transition-colors ${watchlisted ? "bg-[#4F46E5] border-[#4F46E5] text-white" : "border-[#222222] text-white hover:bg-[#1A1A1A]"}`}>
                  <Plus className="h-4 w-4" />{watchlisted ? "Watchlisted" : "Add to Watchlist"}
                </button>
              </div>
            </CardContent>
          </Card>
          {cheapest && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Best Price</span>
                  <MarketplaceBadge marketplace={cheapest.marketplace} size="sm" />
                </div>
                <p className="text-3xl font-bold text-green-400">{formatPrice(cheapest.price)}</p>
                {change24h !== 0 && <p className={`text-sm font-medium ${change24h >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPercent(change24h)} (24h)</p>}
                {cheapest.listingUrl && (
                  <a href={cheapest.listingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-[#4F46E5] text-white rounded-md text-sm font-medium hover:bg-[#4338CA] transition-colors">
                    Buy Now <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="compare">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="compare">Market Compare</TabsTrigger>
              <TabsTrigger value="history">Price History</TabsTrigger>
            </TabsList>
            <TabsContent value="compare" className="mt-4">
              <MarketTable listings={listings} loading={false} lastUpdated={data.fetchedAt} />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <PriceChart data={priceHistory} period={period} onPeriodChange={setPeriod} currentAvg={avgPrice} changePercent={change24h} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {similar?.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-white mb-4">Similar {skin.weapon} Skins</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {similar.map((s: any) => <SkinCard key={s.id} skin={s} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
