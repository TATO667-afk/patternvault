import { NextRequest, NextResponse } from "next/server";
import {
  verifySteamOpenId,
  extractSteamId,
  fetchSteamProfile,
  upsertSteamUser,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Verify with Steam
  const isValid = await verifySteamOpenId(searchParams);
  if (!isValid) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid`);
  }

  const claimedId = searchParams.get("openid.claimed_id") ?? "";
  const steamId = extractSteamId(claimedId);
  if (!steamId) {
    return NextResponse.redirect(`${appUrl}/login?error=no_steam_id`);
  }

  // Fetch Steam profile
  const profile = await fetchSteamProfile(steamId);
  if (!profile) {
    return NextResponse.redirect(`${appUrl}/login?error=profile_failed`);
  }

  // Upsert user in DB
  const userId = await upsertSteamUser(profile);

  // Create session
  const token = await createSession(userId);

  const response = NextResponse.redirect(`${appUrl}/`);
  setSessionCookie(response, token);
  return response;
}
