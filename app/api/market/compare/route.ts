import { NextRequest, NextResponse } from "next/server";
import { fetchAllMarkets } from "@/lib/marketplaces";
import { cacheGet, cacheSet, CacheTTL, buildCacheKey } from "@/lib/redis";
import prisma from "@/lib/prisma";
import { MarketplaceSlug } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name");
  const marketsParam = searchParams.get("markets");
  const minFloat = searchParams.get("minFloat");
  const maxFloat = searchParams.get("maxFloat");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  if (!name) {
    return NextResponse.json({ error: "name param required" }, { status: 400 });
  }

  const markets = marketsParam
    ? (marketsParam.split(",") as MarketplaceSlug[])
    : undefined;

  const cacheKey = buildCacheKey(
    "market:compare",
    name,
    markets?.join(",") ?? "all",
    minFloat ?? "",
    maxFloat ?? "",
    minPrice ?? "",
    maxPrice ?? ""
  );

  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await fetchAllMarkets(
      {
        marketHashName: name,
        limit: 30,
        minFloat: minFloat ? parseFloat(minFloat) : undefined,
        maxFloat: maxFloat ? parseFloat(maxFloat) : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      },
      markets
    );

    // Try to enrich with skin metadata from DB
    const skin = await prisma.skin.findFirst({
      where: { marketHashName: { equals: name, mode: "insensitive" } },
    });

    const cheapest = result.listings[0];
    const highest = result.listings[result.listings.length - 1];
    const cheapestPrice = cheapest?.price ?? 0;
    const highestPrice = highest?.price ?? 0;
    const spread = highestPrice - cheapestPrice;
    const spreadPercent = cheapestPrice > 0 ? (spread / cheapestPrice) * 100 : 0;

    const response = {
      skin: skin ?? { marketHashName: name, name, weapon: "", skin: "" },
      listings: result.listings,
      errors: result.errors,
      cheapestPrice,
      cheapestMarket: cheapest?.marketplace,
      highestPrice,
      spread,
      spreadPercent,
      fetchedAt: result.fetchedAt.toISOString(),
    };

    await cacheSet(cacheKey, response, CacheTTL.SHORT);
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/market/compare]", err);
    return NextResponse.json({
      skin: { marketHashName: name, name, weapon: "", skin: "" },
      listings: [],
      errors: { general: String(err) },
      cheapestPrice: 0,
      cheapestMarket: "",
      highestPrice: 0,
      spread: 0,
      spreadPercent: 0,
      fetchedAt: new Date().toISOString(),
    });
  }
}
