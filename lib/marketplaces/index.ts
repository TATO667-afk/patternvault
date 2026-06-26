import { MarketplaceAdapter } from "./base";
import { SteamAdapter } from "./steam";
import { CSFloatAdapter } from "./csfloat";
import { SkinportAdapter } from "./skinport";
import { BuffAdapter } from "./buff";
import { DMarketAdapter } from "./dmarket";
import { GamerPayAdapter } from "./gamerpay";
import { MarketplaceSlug, MarketplaceConfig } from "@/types";

// ─── Registry ─────────────────────────────────────────────────────────────────

const adapters: Map<MarketplaceSlug, MarketplaceAdapter> = new Map([
  ["steam", new SteamAdapter()],
  ["csfloat", new CSFloatAdapter()],
  ["skinport", new SkinportAdapter()],
  ["buff", new BuffAdapter()],
  ["dmarket", new DMarketAdapter()],
  ["gamerpay", new GamerPayAdapter()],
]);

export function getAdapter(slug: MarketplaceSlug): MarketplaceAdapter | undefined {
  return adapters.get(slug);
}

export function getAllAdapters(): MarketplaceAdapter[] {
  return Array.from(adapters.values()).filter((a) => a.config.isActive);
}

export function getActiveConfigs(): MarketplaceConfig[] {
  return getAllAdapters().map((a) => a.config);
}

export function registerAdapter(adapter: MarketplaceAdapter): void {
  adapters.set(adapter.slug, adapter);
}

// ─── Bulk Fetch ───────────────────────────────────────────────────────────────

import {
  FetchListingsParams,
  MarketListing,
  NormalizedListing,
  SkinInfo,
} from "@/types";

export interface FetchAllResult {
  listings: NormalizedListing[];
  errors: Record<MarketplaceSlug, string>;
  fetchedAt: Date;
}

export async function fetchAllMarkets(
  params: FetchListingsParams,
  markets?: MarketplaceSlug[]
): Promise<FetchAllResult> {
  const targets = markets
    ? markets.map((s) => getAdapter(s)).filter(Boolean) as MarketplaceAdapter[]
    : getAllAdapters();

  const results = await Promise.allSettled(
    targets.map((adapter) => adapter.fetchListings(params))
  );

  const allListings: MarketListing[] = [];
  const errors: Record<string, string> = {};

  results.forEach((result, i) => {
    const adapter = targets[i];
    if (result.status === "fulfilled") {
      if (result.value.error) {
        errors[adapter.slug] = result.value.error;
      }
      result.value.listings.forEach((listing) => {
        allListings.push({
          ...listing,
          skinId: "",
          marketHashName: params.marketHashName,
        });
      });
    } else {
      errors[adapter.slug] = result.reason?.message ?? "Unknown error";
    }
  });

  // Normalize listings relative to cheapest
  const sorted = allListings.sort((a, b) => a.price - b.price);
  const cheapestPrice = sorted[0]?.price ?? 0;

  const normalized: NormalizedListing[] = sorted.map((listing) => {
    const adapter = getAdapter(listing.marketplace);
    const feePercent = adapter?.config.feePercent ?? 0;
    const priceAfterFee = listing.price * (1 + feePercent / 100);
    const diffFromCheapest = listing.price - cheapestPrice;
    const diffPercent = cheapestPrice > 0 ? (diffFromCheapest / cheapestPrice) * 100 : 0;

    // Potential profit: buy here, sell on best market after fees
    const potentialProfit = cheapestPrice > 0 ? -diffFromCheapest : 0;

    return {
      ...listing,
      priceAfterFee,
      diffFromCheapest,
      diffPercent,
      potentialProfit,
    };
  });

  return { listings: normalized, errors: errors as any, fetchedAt: new Date() };
}

export { MarketplaceAdapter };
export * from "./base";
