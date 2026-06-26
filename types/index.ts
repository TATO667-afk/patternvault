// ─── Marketplace Types ────────────────────────────────────────────────────────

export type MarketplaceSlug =
  | "steam"
  | "csfloat"
  | "skinport"
  | "buff"
  | "dmarket"
  | "gamerpay";

export interface MarketplaceConfig {
  slug: MarketplaceSlug;
  name: string;
  displayName: string;
  logoUrl: string;
  baseUrl: string;
  feePercent: number;
  color: string;
  isActive: boolean;
}

// ─── Skin Types ───────────────────────────────────────────────────────────────

export type WearCategory =
  | "Factory New"
  | "Minimal Wear"
  | "Field-Tested"
  | "Well-Worn"
  | "Battle-Scarred";

export type WeaponType =
  | "Rifle"
  | "Pistol"
  | "Knife"
  | "Gloves"
  | "SMG"
  | "Shotgun"
  | "Sniper Rifle"
  | "Machine Gun"
  | "Other";

export interface SkinInfo {
  id: string;
  marketHashName: string;
  name: string;
  weapon: string;
  skin: string;
  imageUrl: string | null;
  rarity: string | null;
  type: string | null;
}

// ─── Listing Types ────────────────────────────────────────────────────────────

export interface Sticker {
  name: string;
  imageUrl: string;
  slot: number;
  wear?: number;
}

export interface MarketListing {
  id: string;
  skinId: string;
  marketHashName: string;
  marketplace: MarketplaceSlug;
  marketplaceName: string;
  externalId?: string;
  price: number;
  currency: string;
  floatValue?: number;
  paintSeed?: number;
  wear?: WearCategory;
  inspectLink?: string;
  imageUrl?: string;
  stickers?: Sticker[];
  isStatTrak: boolean;
  isSouvenir: boolean;
  listingUrl?: string;
  fetchedAt: Date;
}

export interface NormalizedListing extends MarketListing {
  priceAfterFee: number;
  diffFromCheapest: number;
  diffPercent: number;
  potentialProfit: number;
}

// ─── Market Compare Types ────────────────────────────────────────────────────

export interface MarketCompareResult {
  skin: SkinInfo;
  listings: NormalizedListing[];
  cheapestPrice: number;
  cheapestMarket: MarketplaceSlug;
  highestPrice: number;
  spread: number;
  spreadPercent: number;
  fetchedAt: Date;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface SearchFilters {
  query: string;
  weapon?: WeaponType;
  wear?: WearCategory;
  minFloat?: number;
  maxFloat?: number;
  minPrice?: number;
  maxPrice?: number;
  patternId?: number;
  isStatTrak?: boolean;
  isSouvenir?: boolean;
  marketplaces?: MarketplaceSlug[];
  page?: number;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "float_asc" | "float_desc" | "profit_desc";
}

// ─── Opportunity Types ────────────────────────────────────────────────────────

export type OpportunityType =
  | "arbitrage"
  | "underpriced"
  | "rare_pattern"
  | "low_float";

export interface OpportunityItem {
  id: string;
  skin: SkinInfo;
  type: OpportunityType;
  sourceMarket: MarketplaceSlug;
  destMarket?: MarketplaceSlug;
  buyPrice: number;
  sellPrice?: number;
  expectedProfit: number;
  profitPercent: number;
  floatValue?: number;
  paintSeed?: number;
  listingUrl: string;
  score: number;
  createdAt: Date;
}

// ─── Price History Types ──────────────────────────────────────────────────────

export type PriceHistoryPeriod = "24h" | "7d" | "30d" | "90d";

export interface PriceHistoryPoint {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
}

export interface PriceHistoryData {
  skinId: string;
  period: PriceHistoryPeriod;
  data: PriceHistoryPoint[];
  currentAvg: number;
  currentMin: number;
  currentMax: number;
  change24h: number;
  changePercent24h: number;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  steamId: string;
  displayName: string;
  avatarUrl?: string;
  profileUrl?: string;
  email?: string;
}

export interface WatchlistItem {
  id: string;
  skin: SkinInfo;
  currentPrice?: number;
  priceChange24h?: number;
  notes?: string;
  createdAt: Date;
}

export interface PriceAlertConfig {
  id: string;
  skinId: string;
  skin: SkinInfo;
  targetPrice: number;
  condition: "below" | "above";
  marketplace?: MarketplaceSlug;
  wear?: WearCategory;
  maxFloat?: number;
  minFloat?: number;
  patternId?: number;
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: Date;
  notifyEmail: boolean;
  notifyBrowser: boolean;
  createdAt: Date;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Adapter Types ────────────────────────────────────────────────────────────

export interface FetchListingsParams {
  marketHashName: string;
  limit?: number;
  minFloat?: number;
  maxFloat?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface AdapterResult {
  listings: Omit<MarketListing, "skinId" | "marketHashName">[];
  error?: string;
  fetchedAt: Date;
}
