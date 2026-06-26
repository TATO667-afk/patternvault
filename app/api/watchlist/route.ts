import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: {
        skin: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: items });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { skinId, notes } = body;

  if (!skinId) return NextResponse.json({ error: "skinId required" }, { status: 400 });

  try {
    const item = await prisma.watchlist.upsert({
      where: { userId_skinId: { userId: user.id, skinId } },
      create: { userId: user.id, skinId, notes },
      update: { notes },
      include: { skin: true },
    });
    return NextResponse.json({ data: item });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const skinId = searchParams.get("skinId");
  if (!skinId) return NextResponse.json({ error: "skinId required" }, { status: 400 });

  try {
    await prisma.watchlist.delete({
      where: { userId_skinId: { userId: user.id, skinId } },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
