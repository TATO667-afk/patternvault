import { MarketplaceSlug } from "@/types";
import { cn } from "@/lib/utils";

const MARKETPLACE_META: Record<
  MarketplaceSlug,
  { label: string; color: string; textColor: string }
> = {
  steam: { label: "Steam", color: "#1B2838", textColor: "#c6d4df" },
  csfloat: { label: "CSFloat", color: "#1e40af", textColor: "#93c5fd" },
  skinport: { label: "Skinport", color: "#5b21b6", textColor: "#c4b5fd" },
  buff: { label: "Buff", color: "#7f1d1d", textColor: "#fca5a5" },
  dmarket: { label: "DMarket", color: "#0c4a6e", textColor: "#7dd3fc" },
  gamerpay: { label: "GamerPay", color: "#14532d", textColor: "#86efac" },
};

interface MarketplaceBadgeProps {
  marketplace: MarketplaceSlug;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MarketplaceBadge({
  marketplace,
  size = "md",
  className,
}: MarketplaceBadgeProps) {
  const meta = MARKETPLACE_META[marketplace] ?? {
    label: marketplace,
    color: "#1A1A1A",
    textColor: "#9CA3AF",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        className
      )}
      style={{ backgroundColor: meta.color, color: meta.textColor }}
    >
      {meta.label}
    </span>
  );
}
