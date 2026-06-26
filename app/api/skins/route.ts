import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cacheGet, cacheSet, CacheTTL, buildCacheKey } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") ?? "";
  const weapon = searchParams.get("weapon");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const cacheKey = buildCacheKey("skins:search", query, weapon ?? "", String(page));
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const where: any = {
      OR: [
        { marketHashName: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { weapon: { contains: query, mode: "insensitive" } },
      ],
    };

    if (weapon) where.weapon = { equals: weapon, mode: "insensitive" };

    const [skins, total] = await Promise.all([
      prisma.skin.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { marketHashName: "asc" },
      }),
      prisma.skin.count({ where }),
    ]);

    const result = {
      data: skins,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };

    await cacheSet(cacheKey, result, CacheTTL.LONG);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/skins]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
