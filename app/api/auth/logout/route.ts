import { NextRequest, NextResponse } from "next/server";
import { deleteSession, clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("pv_session")?.value;
  if (token) await deleteSession(token);

  const response = NextResponse.redirect(
    new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000")
  );
  clearSessionCookie(response);
  return response;
}
