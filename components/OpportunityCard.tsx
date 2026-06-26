"use client";
import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, Zap, Star, ArrowRight } from "lucide-react";
import { OpportunityItem } from "@/types";
import { formatPrice, formatPercent } from "@/lib/utils";
import { MarketplaceBadge } from "./MarketplaceBadge";
import { Badge } from "./ui/badge";

const OPPORTUNITY_ICONS: Record<string, React.ReactNode> = {
  arbitrage: <TrendingUp className="w-4 h-4" />,
  underpriced: <Zap className="w-4 h-4" />,
  rare_pattern: <Star className="w-4 h-4" />,
  low_float: <TrendingUp className="w-4 h-4" />,
};

const OPPORTUNITY_LABELS: Record<string, string> = {
  arbitrage: "Arbitrage",
  underpriced: "Underpriced",
  rare_pattern: "Rare Pattern",
  low_float: "Low Float",
};

const OPPORTUNITY_COLORS: Record<string, string> = {
  arbitrage: "text-primary",
  underpriced: "text-yellow-400",
  rare_pattern: "text-purple-400",
  low_float: "text-cyan-400",
};

interface OpportunityCardProps {
  opportunity: OpportunityItem;
  index?: number;
}

export function OpportunityCard({ opportunity, index = 0 }: OpportunityCardProps) {
  const { skin, type, sourceMarket, destMarket, buyPrice, sellPrice,
    expectedProfit, profitPercent, floatValue, paintSeed, listingUrl } = opportunity;

  const profitColor = expectedProfit > 0 ? "text-success" : "text-danger";
  const typeColor = OPPORTUNITY_COLORS[type] ?? "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#111111] border border-[#222222] rounded-lg p-5 hover:border-[#333333] transition-all hover:shadow-lg group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={typeColor}>{OPPORTUNITY_ICONS[type]}</span>
          <Badge variant="secondary" className={`text-xs ${typeColor}`}>
            {OPPORTUNITY_LABELS[type] ?? type}
          </Badge>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${profitColor}`}>
            {expectedProfit >= 0 ? "+" : ""}{formatPrice(expectedProfit)}
          </div>
          <div className={`text-xs ${profitColor} opacity-80`}>
            {formatPercent(profitPercent)} ROI
          </div>
        </div>
      </div>

      {/* Skin name */}
      <h3 className="font-semibold text-foreground text-sm mb-3 truncate">
        {skin.marketHashName ?? skin.name}
      </h3>

      {/* Float / Pattern */}
      {(floatValue !== undefined || paintSeed !== undefined) && (
        <div className="flex items-center gap-4 mb-3">
          {floatValue !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Float</p>
              <p className="text-xs font-mono text-foreground">{floatValue.toFixed(6)}</p>
            </div>
          )}
          {paintSeed !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Pattern</p>
              <p className="text-xs font-mono text-foreground">#{paintSeed}</p>
            </div>
          )}
        </div>
      )}

      {/* Buy → Sell flow */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground mb-1">Buy on</p>
          <MarketplaceBadge marketplace={sourceMarket} size="sm" />
          <p className="text-sm font-bold text-foreground mt-1">{formatPrice(buyPrice)}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {destMarket && sellPrice && (
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground mb-1">Sell on</p>
            <MarketplaceBadge marketplace={destMarket} size="sm" />
            <p className="text-sm font-bold text-foreground mt-1">{formatPrice(sellPrice)}</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <a
        href={listingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary text-sm font-medium transition-colors group-hover:border-primary/50"
      >
        View Listing
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </motion.div>
  );
}
