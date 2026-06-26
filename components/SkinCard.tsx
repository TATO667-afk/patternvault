"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import { SkinInfo } from "@/types";
import { formatPrice, getRarityColor, WEAR_ABBREV } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface SkinCardProps {
  skin: SkinInfo;
  price?: number;
  wear?: string;
  float?: number;
  onWatchlist?: () => void;
  isWatchlisted?: boolean;
}

export function SkinCard({
  skin,
  price,
  wear,
  float: floatVal,
  onWatchlist,
  isWatchlisted,
}: SkinCardProps) {
  const rarityColor = getRarityColor(skin.rarity ?? "");

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className="relative group bg-[#111111] border border-[#222222] rounded-lg overflow-hidden hover:border-[#333333] transition-colors"
    >
      {/* Rarity accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: rarityColor }}
      />

      {/* Skin image */}
      <div className="relative h-44 bg-[#0D0D0D] flex items-center justify-center p-4">
        {skin.imageUrl ? (
          <Image
            src={skin.imageUrl}
            alt={skin.marketHashName}
            width={200}
            height={150}
            className="object-contain max-h-36 drop-shadow-lg"
            unoptimized
          />
        ) : (
          <div className="w-32 h-24 bg-[#1A1A1A] rounded flex items-center justify-center">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}

        {/* Watchlist button */}
        {onWatchlist && (
          <button
            onClick={(e) => { e.preventDefault(); onWatchlist(); }}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 ${
              isWatchlisted
                ? "bg-primary text-white"
                : "bg-[#1A1A1A] text-muted-foreground hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div>
          <p className="text-xs text-muted-foreground truncate">{skin.weapon}</p>
          <h3 className="text-sm font-medium text-foreground truncate">{skin.skin}</h3>
        </div>

        <div className="flex items-center gap-2">
          {wear && (
            <Badge variant="secondary" className="text-xs">
              {WEAR_ABBREV[wear as keyof typeof WEAR_ABBREV] ?? wear}
            </Badge>
          )}
          {floatVal !== undefined && (
            <span className="text-xs text-muted-foreground font-mono">
              {floatVal.toFixed(6)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {price !== undefined ? (
            <span className="text-base font-bold text-foreground">
              {formatPrice(price)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
          <Link href={`/skin/${skin.id}`}>
            <Button size="sm" variant="ghost" className="h-8 px-2">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
