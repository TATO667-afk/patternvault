import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson } from "@/lib/ai/anthropic";
import { ExamEvalSchema } from "@/lib/ai/schemas";
import { examEvalPrompt } from "@/lib/ai/prompts";
import { resolveVerdict } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  items: z.array(z.object({ question: z.string().min(1), answer: z.string() })).min(1).max(12),
});

export async function POST(req: NextRequest) {
  const g = await guardAi("exam-eval");
  if ("error" in g) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_input" }, { status: 400 });
  const items = parsed.data.items;
  try {
    const arr = await completeJson(ExamEvalSchema, examEvalPrompt(items), { maxTokens: 2500 });
    const results = items.map((it, i) => {
      const answered = it.answer.trim().length > 0;
      if (!answered) return { index: i, verdict: "incorrect" as const, verified: false, cls: "bad" as const, label: "לא נענתה" };
      const ev = arr.find((a) => Number(a.index) === i);
      const r = resolveVerdict(ev?.evaluation, ev?.check ?? null);
      return { index: i, ...r };
    });
    const correct = results.filter((r) => r.verdict === "correct").length;
    return NextResponse.json({ results, correct, total: items.length });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
