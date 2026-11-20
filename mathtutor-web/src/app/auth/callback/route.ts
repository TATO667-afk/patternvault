import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Exchanges the email-link code for a session, then redirects into the app. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";
  if (code) {
    try {
      const supabase = createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      /* fall through to redirect */
    }
  }
  return NextResponse.redirect(`${origin}${next}`);
}
