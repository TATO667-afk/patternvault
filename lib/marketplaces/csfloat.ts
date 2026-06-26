import { MarketplaceAdapter } from "./base";
import {
  AdapterResult,
  FetchListingsParams,
  MarketplaceConfig,
} from "@/types";
import { floatToWear } from "@/lib/utils";

export class CSFloatAdapter extends MarketplaceAdapter {
  readonly config: MarketplaceConfig = {
    slug: "csfloat",
    name: "csfloat",
    displayName: "CSFloat",
    logoUrl: "/logos/csfloat.svg",
    baseUrl: "https://csfloat.com",
    feePercent: 2,
    color: "#2563EB",
    isActive: true,
  };

  private get apiKey(): string {
    return process.env.CSFLOAT_API_KEY ?? "";
  }

  async fetchListings(params: FetchListingsParams): Promise<AdapterResult> {
    if (!this.apiKey) {
      return { listings: [], error: "No CSFloat API key configured", fetchedAt: new Date() };
    }

    try {
      const queryParams = new URLSearchParams({
        market_hash_name: params.marketHashName,
        limit: String(Math.min(params.limit ?? 20, 50)),
        sort_by: "lowest_price",
        type: "buy_now",
      });

      if (params.minFloat !== undefined)
        queryParams.set("min_float", String(params.minFloat));
      if (params.maxFloat !== undefined)
        queryParams.set("max_float", String(params.maxFloat));
      if (params.minPrice !== undefined)
        queryParams.set("min_price", String(Math.round(params.minPrice * 100)));
      if (params.maxPrice !== undefined)
        queryParams.set("max_price", String(Math.round(params.maxPrice * 100)));

      const res = await this.fetchWithTimeout(
        `https://csfloat.com/api/v1/listings?${queryParams}`,
        { headers: { Authorization: this.apiKey } }
      );

      if (!res.ok) throw new Error(`CSFloat API ${res.status}: ${await res.text()}`);

      const data = await res.json();
      const items: unknown[] = data?.data ?? [];

      const listings: AdapterResult["listings"] = items.map((item: any) => ({
        id: `csfloat_${item.id}`,
        marketplace: "csfloat" as const,
        marketplaceName: "CSFloat",
        externalId: String(item.id),
        price: item.price / 100,
        currency: "USD",
        floatValue: item.item?.float_value,
        paintSeed: item.item?.paint_seed,
        wear: item.item?.float_value
          ? floatToWear(item.item.float_value)
          : undefined,
        inspectLink: item.item?.inspect_link,
        imageUrl: item.item?.icon_url
          ? `https://community.cloudflare.steamstatic.com/economy/image/${item.item.icon_url}`
          : undefined,
        stickers: item.item?.stickers?.map((s: any) => ({
          name: s.name,
          imageUrl: s.icon_url
            ? `https://community.cloudflare.steamstatic.com/economy/image/${s.icon_url}`
            : "",
          slot: s.slot,
          wear: s.wear,
        })),
        isStatTrak: item.item?.is_stattrak ?? false,
        isSouvenir: item.item?.is_souvenir ?? false,
        listingUrl: `https://csfloat.com/item/${item.id}`,
        fetchedAt: new Date(),
      }));

      return { listings, fetchedAt: new Date() };
    } catch (err) {
      return this.handleError(err, "fetchListings");
    }
  }
}
