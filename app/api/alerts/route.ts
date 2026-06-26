import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
    include: { skin: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: alerts });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    skinId, targetPrice, condition, marketplace,
    wear, maxFloat, minFloat, patternId,
    notifyEmail, notifyBrowser,
  } = body;

  if (!skinId || !targetPrice || !condition) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const alert = await prisma.priceAlert.create({
    data: {
      userId: user.id,
      skinId,
      targetPrice: parseFloat(targetPrice),
      condition,
      marketplace: marketplace ?? null,
      wear: wear ?? null,
      maxFloat: maxFloat ? parseFloat(maxFloat) : null,
      minFloat: minFloat ? parseFloat(minFloat) : null,
      patternId: patternId ? parseInt(patternId) : null,
      notifyEmail: notifyEmail ?? true,
      notifyBrowser: notifyBrowser ?? true,
    },
    include: { skin: true },
  });

  return NextResponse.json({ data: alert });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, isActive } = body;

  const alert = await prisma.priceAlert.updateMany({
    where: { id, userId: user.id },
    data: { isActive },
  });

  return NextResponse.json({ data: alert });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.priceAlert.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}
