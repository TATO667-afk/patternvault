import { MarketplaceAdapter } from "./base";
import {
  AdapterResult,
  FetchListingsParams,
  MarketplaceConfig,
} from "@/types";

export class SteamAdapter extends MarketplaceAdapter {
  readonly config: MarketplaceConfig = {
    slug: "steam",
    name: "steam",
    displayName: "Steam Market",
    logoUrl: "/logos/steam.svg",
    baseUrl: "https://steamcommunity.com/market",
    feePercent: 15,
    color: "#1B2838",
    isActive: true,
  };

  async fetchListings(params: FetchListingsParams): Promise<AdapterResult> {
    try {
      const encodedName = encodeURIComponent(params.marketHashName);
      const url = `https://steamcommunity.com/market/listings/730/${encodedName}/render/?query=&start=0&count=${params.limit ?? 20}&country=US&language=english&currency=1`;

      const res = await this.fetchWithTimeout(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; PatternVault/1.0; +https://patternvault.gg)",
        },
      });

      if (!res.ok) {
        throw new Error(`Steam API returned ${res.status}`);
      }

      const data = await res.json();
      const listingsHtml: string = data.listingshtml ?? "";

      // Steam doesn't expose float/pattern in market listings
      // Extract prices from HTML via regex
      const priceMatches = listingsHtml.match(/data-price="(\d+)"/g) ?? [];
      const listingIdMatches = listingsHtml.match(/id="listing_(\w+)"/g) ?? [];

      const listings = priceMatches
        .slice(0, params.limit ?? 20)
        .map((m, i) => {
          const priceStr = m.match(/data-price="(\d+)"/)?.[1] ?? "0";
          const price = parseInt(priceStr, 10) / 100; // cents to dollars
          const listingId = listingIdMatches[i]?.match(/id="listing_(\w+)"/)?.[1];

          if (price < (params.minPrice ?? 0) || (params.maxPrice && price > params.maxPrice)) {
            return null;
          }

          return {
            id: `steam_${listingId ?? i}`,
            marketplace: "steam" as const,
            marketplaceName: "Steam Market",
            externalId: listingId,
            price,
            currency: "USD",
            isStatTrak: params.marketHashName.includes("StatTrak"),
            isSouvenir: params.marketHashName.includes("Souvenir"),
            listingUrl: `https://steamcommunity.com/market/listings/730/${encodedName}`,
            fetchedAt: new Date(),
          };
        })
        .filter(Boolean) as AdapterResult["listings"];

      // Also pull the median price from the overview endpoint
      const overviewUrl = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodedName}`;
      const overviewRes = await this.fetchWithTimeout(overviewUrl).catch(() => null);
      let medianPrice: number | undefined;
      if (overviewRes?.ok) {
        const overview = await overviewRes.json().catch(() => null);
        if (overview?.median_price) {
          medianPrice = parseFloat(overview.median_price.replace(/[^0-9.]/g, ""));
        }
      }

      // If no listings found but we have median price, add a synthetic entry
      if (listings.length === 0 && medianPrice) {
        listings.push({
          id: "steam_median",
          marketplace: "steam",
          marketplaceName: "Steam Market",
          price: medianPrice,
          currency: "USD",
          isStatTrak: params.marketHashName.includes("StatTrak"),
          isSouvenir: params.marketHashName.includes("Souvenir"),
          listingUrl: `https://steamcommunity.com/market/listings/730/${encodedName}`,
          fetchedAt: new Date(),
        });
      }

      return { listings, fetchedAt: new Date() };
    } catch (err) {
      return this.handleError(err, "fetchListings");
    }
  }
}
