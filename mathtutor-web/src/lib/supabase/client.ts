import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (anon key only — never the service role). */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, anon);
}
