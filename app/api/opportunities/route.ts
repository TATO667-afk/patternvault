import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cacheGet, cacheSet, CacheTTL, buildCacheKey } from "@/lib/redis";
import { fetchAllMarkets, getAllAdapters } from "@/lib/marketplaces";
import { calculateProfit } from "@/lib/utils";
import { OpportunityType } from "@/types";

const OPPORTUNITY_SKINS = [
  "AK-47 | Case Hardened (Factory New)",
  "AK-47 | Case Hardened (Field-Tested)",
  "Karambit | Doppler (Factory New)",
  "AWP | Dragon Lore (Factory New)",
  "M4A1-S | Printstream (Factory New)",
  "Butterfly Knife | Doppler (Factory New)",
  "AK-47 | Fire Serpent (Field-Tested)",
  "Desert Eagle | Blaze (Factory New)",
  "Glock-18 | Fade (Factory New)",
  "M9 Bayonet | Marble Fade (Factory New)",
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") as OpportunityType | null;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const minProfit = parseFloat(searchParams.get("minProfit") ?? "5");

  const cacheKey = buildCacheKey("opportunities", type ?? "all", String(page));
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Query stored opportunities from DB first
    const where: any = { isActive: true };
    if (type) where.type = type;

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        include: { skin: true },
        orderBy: { score: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.opportunity.count({ where }),
    ]);

    // If no stored opportunities, do live scan of popular skins
    if (opportunities.length === 0) {
      const live = await scanLiveOpportunities(minProfit);
      return NextResponse.json({
        data: live.slice((page - 1) * limit, page * limit),
        total: live.length,
        page,
        limit,
        hasMore: page * limit < live.length,
        source: "live",
      });
    }

    const result = {
      data: opportunities.map((opp) => ({
        ...opp,
        createdAt: opp.createdAt.toISOString(),
        updatedAt: opp.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      hasMore: page * limit < total,
      source: "cached",
    };

    await cacheSet(cacheKey, result, CacheTTL.MEDIUM);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/opportunities]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function scanLiveOpportunities(minProfit: number) {
  const opportunities: any[] = [];
  const adapters = getAllAdapters();

  await Promise.allSettled(
    OPPORTUNITY_SKINS.map(async (skinName) => {
      try {
        const result = await fetchAllMarkets({ marketHashName: skinName, limit: 5 });
        if (result.listings.length < 2) return;

        const sorted = result.listings.sort((a, b) => a.price - b.price);
        const cheapest = sorted[0];
        const priciest = sorted[sorted.length - 1];

        // Find the best sell market (account for fees)
        const bestSell = adapters
          .map((a) => ({
            slug: a.slug,
            fee: a.config.feePercent,
            // Approximate sell price as highest listing price on that market
            price:
              result.listings
                .filter((l) => l.marketplace === a.slug)
                .sort((a, b) => b.price - a.price)[0]?.price ?? 0,
          }))
          .filter((m) => m.price > 0 && m.slug !== cheapest.marketplace)
          .sort((a, b) => b.price * (1 - b.fee / 100) - a.price * (1 - a.fee / 100))[0];

        if (!bestSell) return;

        const { profit, profitPercent } = calculateProfit(
          cheapest.price,
          bestSell.price,
          bestSell.fee
        );

        if (profit < minProfit) return;

        // Detect type
        let oppType: OpportunityType = "arbitrage";
        if (cheapest.floatValue && cheapest.floatValue < 0.1) oppType = "low_float";
        if (profitPercent > 30 && !cheapest.floatValue) oppType = "underpriced";

        opportunities.push({
          id: `live_${Date.now()}_${Math.random()}`,
          skin: { marketHashName: skinName, name: skinName },
          type: oppType,
          sourceMarket: cheapest.marketplace,
          destMarket: bestSell.slug,
          buyPrice: cheapest.price,
          sellPrice: bestSell.price,
          expectedProfit: profit,
          profitPercent,
          floatValue: cheapest.floatValue,
          paintSeed: cheapest.paintSeed,
          listingUrl: cheapest.listingUrl,
          score: profit * (profitPercent / 100),
          createdAt: new Date().toISOString(),
        });
      } catch {}
    })
  );

  return opportunities.sort((a, b) => b.score - a.score);
}
