import { NextRequest, NextResponse } from "next/server";
import { generateShowcaseImage, ShowcasePatternInput } from "@/lib/ideogram";
import { cacheGet, cacheSet, CacheTTL, buildCacheKey } from "@/lib/redis";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: ShowcasePatternInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.weaponName || !body?.skinName || typeof body?.patternId !== "number") {
    return NextResponse.json(
      { error: "weaponName, skinName, and patternId are required" },
      { status: 400 }
    );
  }

  const cacheKey = buildCacheKey("patterns:showcase", id);
  const cached = await cacheGet<{ imageUrl: string; prompt: string }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await generateShowcaseImage(body);
    await cacheSet(cacheKey, result, CacheTTL.DAY);
    return NextResponse.json(result);
  } catch (err) {
    console.error(`[/api/patterns/${id}/showcase]`, err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not configured") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
