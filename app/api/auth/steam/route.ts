import { NextRequest, NextResponse } from "next/server";
import { buildSteamLoginUrl } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const returnTo = `${process.env.NEXTAUTH_URL}/api/auth/callback`;
  const loginUrl = buildSteamLoginUrl(returnTo);
  return NextResponse.redirect(loginUrl);
}
