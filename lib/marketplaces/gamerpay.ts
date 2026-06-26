import { MarketplaceAdapter } from "./base";
import { AdapterResult, FetchListingsParams, MarketplaceConfig } from "@/types";
import { floatToWear } from "@/lib/utils";

export class GamerPayAdapter extends MarketplaceAdapter {
  readonly config: MarketplaceConfig = {
    slug: "gamerpay",
    name: "gamerpay",
    displayName: "GamerPay",
    logoUrl: "/logos/gamerpay.svg",
    baseUrl: "https://gamerpay.gg",
    feePercent: 5,
    color: "#16A34A",
    isActive: true,
  };

  private get apiKey(): string {
    return process.env.GAMERPAY_API_KEY ?? "";
  }

  async fetchListings(params: FetchListingsParams): Promise<AdapterResult> {
    if (!this.apiKey) {
      return { listings: [], error: "No GamerPay API key", fetchedAt: new Date() };
    }

    try {
      const qs = new URLSearchParams({
        name: params.marketHashName,
        limit: String(params.limit ?? 20),
        sort: "price_asc",
      });

      if (params.minFloat) qs.set("float_min", String(params.minFloat));
      if (params.maxFloat) qs.set("float_max", String(params.maxFloat));
      if (params.minPrice) qs.set("price_min", String(params.minPrice));
      if (params.maxPrice) qs.set("price_max", String(params.maxPrice));

      const res = await this.fetchWithTimeout(
        `https://api.gamerpay.gg/v2/items?${qs}`,
        { headers: { "X-API-Key": this.apiKey } }
      );

      if (!res.ok) throw new Error(`GamerPay API ${res.status}`);

      const data = await res.json();
      const items: any[] = data?.items ?? data?.data ?? [];

      const listings: AdapterResult["listings"] = items.map((item: any) => {
        const floatVal: number | undefined = item.float ?? item.floatValue ?? undefined;

        return {
          id: `gamerpay_${item.id}`,
          marketplace: "gamerpay" as const,
          marketplaceName: "GamerPay",
          externalId: String(item.id),
          price: parseFloat(item.price),
          currency: item.currency ?? "USD",
          floatValue: floatVal,
          paintSeed: item.paintSeed ?? item.pattern,
          wear: floatVal ? floatToWear(floatVal) : undefined,
          imageUrl: item.imageUrl ?? item.image,
          isStatTrak: item.isStatTrak ?? false,
          isSouvenir: item.isSouvenir ?? false,
          listingUrl: item.url ?? `https://gamerpay.gg/items/${item.id}`,
          fetchedAt: new Date(),
        };
      });

      return { listings, fetchedAt: new Date() };
    } catch (err) {
      return this.handleError(err, "fetchListings");
    }
  }
}
