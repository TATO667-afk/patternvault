import { requireLevel } from "@/lib/session";
import TutorClient from "@/components/TutorClient";

export const dynamic = "force-dynamic";

export default async function TutorPage({ searchParams }: { searchParams: { q?: string; session?: string } }) {
  const { level, supabase } = await requireLevel();
  const { data: sessions } = await supabase
    .from("tutoring_sessions")
    .select("id, problem, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);
  return (
    <TutorClient
      level={level}
      initialProblem={searchParams.q || ""}
      resumeSessionId={searchParams.session || ""}
      sessions={(sessions ?? []) as { id: string; problem: string; status: string; updated_at: string }[]}
    />
  );
}
