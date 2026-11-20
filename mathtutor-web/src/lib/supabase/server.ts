import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client bound to the request's auth cookies.
 *  Uses the anon key; all data access is still gated by Row Level Security. */
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env vars are not configured");
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component where cookies are read-only — safe to ignore;
          // middleware refreshes the session.
        }
      },
    },
  });
}
