import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("display_name, level").eq("id", user.id).single();

  return (
    <div className="min-h-screen pb-16">
      <Nav level={profile?.level ?? null} displayName={profile?.display_name ?? ""} />
      <main className="max-w-4xl mx-auto px-4 mt-6">{children}</main>
    </div>
  );
}
