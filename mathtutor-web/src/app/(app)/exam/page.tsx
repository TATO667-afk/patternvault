import { requireLevel } from "@/lib/session";
import ExamClient from "@/components/ExamClient";

export const dynamic = "force-dynamic";

export default async function ExamPage() {
  const { level, supabase } = await requireLevel();
  const { data: history } = await supabase
    .from("mock_exams")
    .select("level, total, correct, submitted_at")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(8);
  return <ExamClient level={level} history={(history ?? []) as { level: string; total: number; correct: number; submitted_at: string }[]} />;
}
