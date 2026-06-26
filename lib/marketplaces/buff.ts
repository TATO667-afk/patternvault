import { MarketplaceAdapter } from "./base";
import { AdapterResult, FetchListingsParams, MarketplaceConfig } from "@/types";
import { floatToWear } from "@/lib/utils";

// Note: Buff163 doesn't have an official public API.
// This adapter uses the unofficial/scraped approach via known endpoints.
// In production, consider using a paid data aggregator for Buff data.
export class BuffAdapter extends MarketplaceAdapter {
  readonly config: MarketplaceConfig = {
    slug: "buff",
    name: "buff",
    displayName: "Buff Market",
    logoUrl: "/logos/buff.svg",
    baseUrl: "https://buff.163.com",
    feePercent: 2.5,
    color: "#DC2626",
    isActive: true,
  };

  // USD/CNY rate – in production pull from a currency API
  private readonly CNY_TO_USD = 0.138;

  async fetchListings(params: FetchListingsParams): Promise<AdapterResult> {
    const session = process.env.BUFF_SESSION_COOKIE;
    if (!session) {
      return { listings: [], error: "No Buff session configured", fetchedAt: new Date() };
    }

    try {
      const searchRes = await this.fetchWithTimeout(
        `https://buff.163.com/api/market/search/client?game=csgo&keyword=${encodeURIComponent(params.marketHashName)}&page_num=1&page_size=5`,
        {
          headers: {
            Cookie: `session=${session}`,
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (!searchRes.ok) throw new Error(`Buff search ${searchRes.status}`);
      const searchData = await searchRes.json();
      const goodsId = searchData?.data?.items?.[0]?.id;

      if (!goodsId) return { listings: [], fetchedAt: new Date() };

      const listRes = await this.fetchWithTimeout(
        `https://buff.163.com/api/market/goods/sell_order?game=csgo&goods_id=${goodsId}&page_num=1&page_size=${params.limit ?? 20}&sort_by=default&mode=`,
        {
          headers: {
            Cookie: `session=${session}`,
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (!listRes.ok) throw new Error(`Buff listings ${listRes.status}`);
      const listData = await listRes.json();
      const items: any[] = listData?.data?.items ?? [];

      const listings: AdapterResult["listings"] = items.map((item: any) => {
        const priceCny = parseFloat(item.price);
        const priceUsd = priceCny * this.CNY_TO_USD;
        const floatVal: number | undefined = item.asset_info?.paintwear
          ? parseFloat(item.asset_info.paintwear)
          : undefined;

        return {
          id: `buff_${item.id}`,
          marketplace: "buff" as const,
          marketplaceName: "Buff Market",
          externalId: String(item.id),
          price: parseFloat(priceUsd.toFixed(2)),
          currency: "USD",
          floatValue: floatVal,
          paintSeed: item.asset_info?.paint_index,
          wear: floatVal ? floatToWear(floatVal) : undefined,
          isStatTrak: item.asset_info?.info?.stattrak ?? false,
          isSouvenir: false,
          listingUrl: `https://buff.163.com/goods/${goodsId}`,
          fetchedAt: new Date(),
        };
      });

      return { listings, fetchedAt: new Date() };
    } catch (err) {
      return this.handleError(err, "fetchListings");
    }
  }
}
