import { MarketplaceAdapter } from "./base";
import { AdapterResult, FetchListingsParams, MarketplaceConfig } from "@/types";
import { floatToWear } from "@/lib/utils";

export class SkinportAdapter extends MarketplaceAdapter {
  readonly config: MarketplaceConfig = {
    slug: "skinport",
    name: "skinport",
    displayName: "Skinport",
    logoUrl: "/logos/skinport.svg",
    baseUrl: "https://skinport.com",
    feePercent: 12,
    color: "#7C3AED",
    isActive: true,
  };

  private async getToken(): Promise<string | null> {
    const clientId = process.env.SKINPORT_CLIENT_ID;
    const clientSecret = process.env.SKINPORT_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    try {
      const res = await this.fetchWithTimeout(
        "https://api.skinport.com/v1/oauth/client",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${creds}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ grant_type: "client_credentials" }),
        }
      );
      const data = await res.json();
      return data?.access_token ?? null;
    } catch {
      return null;
    }
  }

  async fetchListings(params: FetchListingsParams): Promise<AdapterResult> {
    try {
      // Skinport public items endpoint (no auth needed for basic pricing)
      const url = new URL("https://api.skinport.com/v1/items");
      url.searchParams.set("app_id", "730");
      url.searchParams.set("currency", "USD");
      url.searchParams.set("market_hash_name", params.marketHashName);

      const res = await this.fetchWithTimeout(url.toString());
      if (!res.ok) throw new Error(`Skinport API ${res.status}`);

      const data: any[] = await res.json();
      const item = data?.[0];
      if (!item) return { listings: [], fetchedAt: new Date() };

      const listings: AdapterResult["listings"] = [];

      if (item.min_price) {
        listings.push({
          id: `skinport_min_${item.market_hash_name}`,
          marketplace: "skinport" as const,
          marketplaceName: "Skinport",
          price: item.min_price,
          currency: "USD",
          isStatTrak: params.marketHashName.includes("StatTrak"),
          isSouvenir: params.marketHashName.includes("Souvenir"),
          listingUrl: `https://skinport.com/market?search=${encodeURIComponent(params.marketHashName)}`,
          fetchedAt: new Date(),
        });
      }

      return { listings, fetchedAt: new Date() };
    } catch (err) {
      return this.handleError(err, "fetchListings");
    }
  }
}
