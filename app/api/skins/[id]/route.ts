import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cacheGet, cacheSet, CacheTTL, buildCacheKey } from "@/lib/redis";
import { fetchAllMarkets } from "@/lib/marketplaces";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") ?? "7d";

  const cacheKey = buildCacheKey("skin:detail", id);
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const skin = await prisma.skin.findUnique({ where: { id } });
    if (!skin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fetch price history
    const daysMap: Record<string, number> = {
      "24h": 1, "7d": 7, "30d": 30, "90d": 90,
    };
    const days = daysMap[period] ?? 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const priceHistory = await prisma.priceHistory.findMany({
      where: { skinId: id, date: { gte: since }, marketplace: null },
      orderBy: { date: "asc" },
    });

    // Fetch live listings
    const marketData = await fetchAllMarkets({
      marketHashName: skin.marketHashName,
      limit: 30,
    });

    // Fetch similar skins (same weapon)
    const similar = await prisma.skin.findMany({
      where: {
        weapon: skin.weapon,
        id: { not: id },
      },
      take: 6,
    });

    const result = {
      skin,
      priceHistory: priceHistory.map((h) => ({
        date: h.date.toISOString(),
        avgPrice: h.avgPrice,
        minPrice: h.minPrice,
        maxPrice: h.maxPrice,
        volume: h.volume,
      })),
      listings: marketData.listings,
      marketErrors: marketData.errors,
      similar,
      fetchedAt: new Date().toISOString(),
    };

    await cacheSet(cacheKey, result, CacheTTL.MEDIUM);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/skins/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
