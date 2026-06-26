import { MarketplaceAdapter } from "./base";
import { AdapterResult, FetchListingsParams, MarketplaceConfig } from "@/types";
import { floatToWear } from "@/lib/utils";
import crypto from "crypto";

export class DMarketAdapter extends MarketplaceAdapter {
  readonly config: MarketplaceConfig = {
    slug: "dmarket",
    name: "dmarket",
    displayName: "DMarket",
    logoUrl: "/logos/dmarket.svg",
    baseUrl: "https://dmarket.com",
    feePercent: 5,
    color: "#0EA5E9",
    isActive: true,
  };

  private sign(method: string, path: string, body: string = ""): Record<string, string> {
    const publicKey = process.env.DMARKET_PUBLIC_KEY ?? "";
    const secretKey = process.env.DMARKET_SECRET_KEY ?? "";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const stringToSign = method.toUpperCase() + path + body + timestamp;
    const signature = crypto
      .createHmac("sha256", Buffer.from(secretKey, "hex"))
      .update(stringToSign)
      .digest("hex");

    return {
      "X-Api-Key": publicKey,
      "X-Request-Sign": `dmar ed25519 ${signature}`,
      "X-Sign-Date": timestamp,
    };
  }

  async fetchListings(params: FetchListingsParams): Promise<AdapterResult> {
    if (!process.env.DMARKET_PUBLIC_KEY) {
      return { listings: [], error: "No DMarket API key", fetchedAt: new Date() };
    }

    try {
      const path = "/exchange/v1/market/items";
      const qs = new URLSearchParams({
        gameId: "a8db",
        title: params.marketHashName,
        limit: String(Math.min(params.limit ?? 20, 100)),
        orderBy: "price",
        orderDir: "asc",
        currency: "USD",
      });

      if (params.minPrice)
        qs.set("priceFrom", String(Math.round(params.minPrice * 100)));
      if (params.maxPrice)
        qs.set("priceTo", String(Math.round(params.maxPrice * 100)));

      const fullPath = `${path}?${qs}`;
      const headers = this.sign("GET", fullPath);

      const res = await this.fetchWithTimeout(
        `https://api.dmarket.com${fullPath}`,
        { headers: { ...headers, "Content-Type": "application/json" } }
      );

      if (!res.ok) throw new Error(`DMarket API ${res.status}: ${await res.text()}`);

      const data = await res.json();
      const items: any[] = data?.objects ?? [];

      const listings: AdapterResult["listings"] = items.map((item: any) => {
        const price = item.price?.USD ? parseInt(item.price.USD, 10) / 100 : 0;
        const floatVal: number | undefined = item.extra?.floatValue
          ? parseFloat(item.extra.floatValue)
          : undefined;

        return {
          id: `dmarket_${item.itemId}`,
          marketplace: "dmarket" as const,
          marketplaceName: "DMarket",
          externalId: item.itemId,
          price,
          currency: "USD",
          floatValue: floatVal,
          paintSeed: item.extra?.paintSeed,
          wear: floatVal ? floatToWear(floatVal) : undefined,
          imageUrl: item.image,
          isStatTrak: item.extra?.isStatTrak ?? false,
          isSouvenir: item.extra?.isSouvenir ?? false,
          listingUrl: `https://dmarket.com/ingame-items/item-list/csgo-skins?title=${encodeURIComponent(params.marketHashName)}`,
          fetchedAt: new Date(),
        };
      });

      return { listings, fetchedAt: new Date() };
    } catch (err) {
      return this.handleError(err, "fetchListings");
    }
  }
}
