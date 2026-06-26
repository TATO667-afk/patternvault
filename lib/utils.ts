import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WearCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Price Formatting ─────────────────────────────────────────────────────────

export function formatPrice(
  price: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatPercent(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatFloat(value: number): string {
  return value.toFixed(10).replace(/0+$/, "").padEnd(4, "0");
}

// ─── Float / Wear ─────────────────────────────────────────────────────────────

export function floatToWear(float: number): WearCategory {
  if (float < 0.07) return "Factory New";
  if (float < 0.15) return "Minimal Wear";
  if (float < 0.38) return "Field-Tested";
  if (float < 0.45) return "Well-Worn";
  return "Battle-Scarred";
}

export const WEAR_RANGES: Record<WearCategory, [number, number]> = {
  "Factory New": [0, 0.07],
  "Minimal Wear": [0.07, 0.15],
  "Field-Tested": [0.15, 0.38],
  "Well-Worn": [0.38, 0.45],
  "Battle-Scarred": [0.45, 1],
};

export const WEAR_ABBREV: Record<WearCategory, string> = {
  "Factory New": "FN",
  "Minimal Wear": "MW",
  "Field-Tested": "FT",
  "Well-Worn": "WW",
  "Battle-Scarred": "BS",
};

// ─── Profit Calculation ───────────────────────────────────────────────────────

export function calculateProfit(
  buyPrice: number,
  sellPrice: number,
  sellFeePercent: number = 0
): { profit: number; profitPercent: number; netSell: number } {
  const netSell = sellPrice * (1 - sellFeePercent / 100);
  const profit = netSell - buyPrice;
  const profitPercent = (profit / buyPrice) * 100;
  return { profit, profitPercent, netSell };
}

// ─── Market Hash Name Parsing ─────────────────────────────────────────────────

export function parseMarketHashName(name: string): {
  weapon: string;
  skin: string;
  wear?: WearCategory;
  isStatTrak: boolean;
  isSouvenir: boolean;
} {
  let clean = name;
  const isStatTrak = clean.startsWith("StatTrak™ ");
  const isSouvenir = clean.startsWith("Souvenir ");
  if (isStatTrak) clean = clean.replace("StatTrak™ ", "");
  if (isSouvenir) clean = clean.replace("Souvenir ", "");

  const wearMatch = clean.match(/\(([^)]+)\)$/);
  const wear = wearMatch ? (wearMatch[1] as WearCategory) : undefined;
  if (wearMatch) clean = clean.replace(` (${wearMatch[1]})`, "");

  const pipeIdx = clean.indexOf(" | ");
  const weapon = pipeIdx !== -1 ? clean.slice(0, pipeIdx) : clean;
  const skin = pipeIdx !== -1 ? clean.slice(pipeIdx + 3) : "";

  return { weapon, skin, wear, isStatTrak, isSouvenir };
}

// ─── Rarity Colors ────────────────────────────────────────────────────────────

export const RARITY_COLORS: Record<string, string> = {
  "Consumer Grade": "#b0c3d9",
  "Industrial Grade": "#5e98d9",
  "Mil-Spec Grade": "#4b69ff",
  Restricted: "#8847ff",
  Classified: "#d32ce6",
  Covert: "#eb4b4b",
  Contraband: "#e4ae39",
  "Base Grade": "#b0c3d9",
  "High Grade": "#4b69ff",
  Remarkable: "#8847ff",
  Exotic: "#d32ce6",
  Extraordinary: "#eb4b4b",
};

export function getRarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] ?? "#b0c3d9";
}

// ─── Image URLs ───────────────────────────────────────────────────────────────

export function getSteamImageUrl(iconPath: string): string {
  return `https://community.cloudflare.steamstatic.com/economy/image/${iconPath}/360fx360f`;
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Clamp ────────────────────────────────────────────────────────────────────

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
