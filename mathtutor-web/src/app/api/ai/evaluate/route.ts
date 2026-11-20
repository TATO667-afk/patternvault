import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson } from "@/lib/ai/anthropic";
import { AnswerEvaluationSchema } from "@/lib/ai/schemas";
import { evaluateAnswerPrompt } from "@/lib/ai/prompts";
import { resolveVerdict } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  question: z.string().min(1).max(4000),
  answer: z.string().min(1).max(4000),
  topicId: z.string().optional(),
  sessionId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const g = await guardAi("evaluate");
  if ("error" in g) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_input" }, { status: 400 });
  const { question, answer, topicId, sessionId } = parsed.data;
  try {
    const ev = await completeJson(AnswerEvaluationSchema, evaluateAnswerPrompt(question, answer), { maxTokens: 1200 });
    const verdict = resolveVerdict(ev.evaluation, ev.check); // deterministic-first, on the server

    // Persist the attempt (RLS ensures it lands on this user only).
    if (topicId) {
      await g.supabase.from("practice_attempts").insert({
        user_id: g.user.id,
        topic_id: topicId,
        session_id: sessionId ?? null,
        question,
        answer,
        verdict: verdict.verdict,
        verified: verdict.verified,
        evaluation: ev.evaluation,
      });
    }
    return NextResponse.json({ evaluation: ev, verdict });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
