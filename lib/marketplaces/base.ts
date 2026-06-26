import {
  AdapterResult,
  FetchListingsParams,
  MarketplaceConfig,
  MarketplaceSlug,
} from "@/types";

export abstract class MarketplaceAdapter {
  abstract readonly config: MarketplaceConfig;

  get slug(): MarketplaceSlug {
    return this.config.slug;
  }

  abstract fetchListings(params: FetchListingsParams): Promise<AdapterResult>;

  protected handleError(error: unknown, context: string): AdapterResult {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[${this.config.slug}] ${context}:`, message);
    return {
      listings: [],
      error: message,
      fetchedAt: new Date(),
    };
  }

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }
}
