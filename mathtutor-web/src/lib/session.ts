import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Level } from "@/lib/types";

export interface Profile {
  id: string;
  display_name: string | null;
  level: Level | null;
  preferences: Record<string, unknown>;
  created_at: string;
}

export async function getUserAndProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { supabase, user, profile: (profile as Profile | null) ?? null };
}

/** Pages that need a chosen study level. Sends new users to onboarding first. */
export async function requireLevel() {
  const ctx = await getUserAndProfile();
  if (!ctx.profile?.level) redirect("/onboarding");
  return { ...ctx, level: ctx.profile.level as Level };
}
