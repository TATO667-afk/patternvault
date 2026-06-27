"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink, ArrowUpDown, ChevronUp, ChevronDown,
  TrendingDown, TrendingUp, RefreshCw,
} from "lucide-react";
import { NormalizedListing } from "@/types";
import { formatPrice, formatPercent, formatFloat, timeAgo } from "@/lib/utils";
import { MarketplaceBadge } from "./MarketplaceBadge";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

type SortField = "price" | "float" | "profit" | "diff";
type SortDir = "asc" | "desc";

interface MarketTableProps {
  listings: NormalizedListing[];
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: string;
}

export function MarketTable({ listings, loading, onRefresh, lastUpdated }: MarketTableProps) {
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...listings].sort((a, b) => {
    let av: number, bv: number;
    switch (sortField) {
      case "price":   av = a.price; bv = b.price; break;
      case "float":   av = a.floatValue ?? 999; bv = b.floatValue ?? 999; break;
      case "profit":  av = a.potentialProfit ?? 0; bv = b.potentialProfit ?? 0; break;
      case "diff":    av = a.diffFromCheapest ?? 0; bv = b.diffFromCheapest ?? 0; break;
      default:        av = a.price; bv = b.price;
    }
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3" />;
  };

  const ColHeader = ({
    field, label, className = "",
  }: { field: SortField; label: string; className?: string }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No listings found</p>
        <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} across{" "}
            {new Set(listings.map((l) => l.marketplace)).size} marketplace
            {new Set(listings.map((l) => l.marketplace)).size !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {timeAgo(new Date(lastUpdated))}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#222222] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0D0D0D] border-b border-[#222222]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Marketplace</th>
                <ColHeader field="price" label="Price" />
                <ColHeader field="float" label="Float" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Pattern ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Wear</th>
                <ColHeader field="diff" label="vs Cheapest" />
                <ColHeader field="profit" label="Potential Profit" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((listing, i) => (
                <motion.tr
                  key={listing.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-[#1A1A1A] hover:bg-[#151515] transition-colors ${
                    i === 0 ? "bg-[#0E1B0E]" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {i === 0 ? (
                      <Badge variant="success" className="text-xs px-1.5 py-0">
                        Best
                      </Badge>
                    ) : (
                      i + 1
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <MarketplaceBadge marketplace={listing.marketplace} />
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                    {listing.floatValue !== undefined ? formatFloat(listing.floatValue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {listing.paintSeed ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {listing.wear ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {listing.diffFromCheapest === 0 ? (
                      <span className="text-success text-sm font-medium">Cheapest</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-danger" />
                        <span className="text-danger text-sm font-medium">
                          +{formatPrice(listing.diffFromCheapest)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({formatPercent(listing.diffPercent)})
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(listing.potentialProfit ?? 0) > 0 ? (
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5 text-success" />
                        <span className="text-success text-sm font-medium">
                          {formatPrice(listing.potentialProfit)}
                        </span>
                      </div>
                    ) : listing.potentialProfit === 0 ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : (
                      <span className="text-danger text-sm">
                        {formatPrice(listing.potentialProfit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {listing.listingUrl ? (
                      <a
                        href={listing.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Buy
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
