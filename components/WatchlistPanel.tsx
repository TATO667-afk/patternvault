"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, TrendingUp, TrendingDown, Bell, BookmarkX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WatchlistItem } from "@/types";
import { formatPrice, formatPercent } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export function WatchlistPanel() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (skinId: string) => {
    await fetch(`/api/watchlist?skinId=${skinId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.skin.id !== skinId));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <BookmarkX className="h-10 w-10 mb-3 opacity-40" />
        <p className="font-medium">Your watchlist is empty</p>
        <p className="text-sm mt-1">Add skins to track their prices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {items.map((item) => {
          const isUp = (item.priceChange24h ?? 0) >= 0;
          return (
            <motion.div
              key={item.skin.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 bg-[#111111] border border-[#222222] rounded-lg hover:border-[#333333] transition-colors"
            >
              {item.skin.imageUrl ? (
                <Image
                  src={item.skin.imageUrl}
                  alt={item.skin.marketHashName}
                  width={48}
                  height={36}
                  className="object-contain flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-9 bg-[#1A1A1A] rounded flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <Link
                  href={`/skin/${item.skin.id}`}
                  className="text-sm font-medium text-foreground truncate block hover:text-primary transition-colors"
                >
                  {item.skin.marketHashName}
                </Link>
                {item.currentPrice !== undefined && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-mono">{formatPrice(item.currentPrice)}</span>
                    {item.priceChange24h !== undefined && (
                      <div className={`flex items-center gap-0.5 text-xs ${isUp ? "text-success" : "text-danger"}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatPercent(item.priceChange24h)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => removeItem(item.skin.id)}
                className="p-1 text-muted-foreground hover:text-danger transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
