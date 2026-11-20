import { requireLevel } from "@/lib/session";
import PracticeClient from "@/components/PracticeClient";

export const dynamic = "force-dynamic";

export default async function PracticePage({ searchParams }: { searchParams: { topic?: string; diff?: string } }) {
  const { level } = await requireLevel();
  const topicId = searchParams.topic || "";
  const diff = Math.min(3, Math.max(1, Number(searchParams.diff) || 0)) || 0;
  return <PracticeClient level={level} initialTopicId={topicId} initialDiff={diff} />;
}
