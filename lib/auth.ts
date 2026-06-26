import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";
import { UserProfile } from "@/types";

const SESSION_COOKIE = "pv_session";
const SESSION_TTL_DAYS = 30;

// ─── Session Management ───────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID() + "-" + Date.now().toString(36);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

export async function getSessionUser(
  request: NextRequest
): Promise<UserProfile | null> {
  const cookieStore = request.cookies;
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { token } });
    return null;
  }

  return {
    id: session.user.id,
    steamId: session.user.steamId,
    displayName: session.user.displayName,
    avatarUrl: session.user.avatarUrl ?? undefined,
    profileUrl: session.user.profileUrl ?? undefined,
    email: session.user.email ?? undefined,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {});
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE);
}

// ─── Steam OpenID ─────────────────────────────────────────────────────────────

export const STEAM_OPENID_URL = "https://steamcommunity.com/openid";
export const STEAM_API_BASE = "https://api.steampowered.com";

export function buildSteamLoginUrl(returnTo: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": process.env.NEXTAUTH_URL || "http://localhost:3000",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID_URL}/login?${params}`;
}

export function extractSteamId(claimedId: string): string | null {
  const match = claimedId.match(/https:\/\/steamcommunity\.com\/openid\/id\/(\d+)/);
  return match ? match[1] : null;
}

export async function verifySteamOpenId(
  params: URLSearchParams
): Promise<boolean> {
  const verifyParams = new URLSearchParams(params);
  verifyParams.set("openid.mode", "check_authentication");

  try {
    const res = await fetch(STEAM_OPENID_URL + "/login", {
      method: "POST",
      body: verifyParams,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const text = await res.text();
    return text.includes("is_valid:true");
  } catch {
    return false;
  }
}

export interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

export async function fetchSteamProfile(
  steamId: string
): Promise<SteamPlayerSummary | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    );
    const data = await res.json();
    return data?.response?.players?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function upsertSteamUser(
  profile: SteamPlayerSummary
): Promise<string> {
  const user = await prisma.user.upsert({
    where: { steamId: profile.steamid },
    create: {
      steamId: profile.steamid,
      displayName: profile.personaname,
      avatarUrl: profile.avatarfull,
      profileUrl: profile.profileurl,
    },
    update: {
      displayName: profile.personaname,
      avatarUrl: profile.avatarfull,
      profileUrl: profile.profileurl,
    },
  });
  return user.id;
}
