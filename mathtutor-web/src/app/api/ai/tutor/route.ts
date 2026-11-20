import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson, type TextTurn } from "@/lib/ai/anthropic";
import { TutorTurnSchema } from "@/lib/ai/schemas";
import { tutorInstruction } from "@/lib/ai/prompts";
import { resolveVerdict } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  problem: z.string().min(1).max(4000),
  explainLevel: z.enum(["simple", "regular", "advanced"]).default("regular"),
  turns: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(6000) }))
    .min(1)
    .max(40),
});

export async function POST(req: NextRequest) {
  const g = await guardAi("tutor");
  if ("error" in g) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_input" }, { status: 400 });
  const { problem, explainLevel, turns } = parsed.data;

  // Leading instruction turn + the page-kept conversation (ends on a user turn).
  const convo = turns.slice(-24) as TextTurn[];
  const input: TextTurn[] = [{ role: "user", content: tutorInstruction(problem, explainLevel) }, ...convo];
  try {
    const turn = await completeJson(TutorTurnSchema, input, { maxTokens: 1500 });
    const verdict = turn.evaluation && turn.evaluation !== "none" ? resolveVerdict(turn.evaluation, turn.check) : null;
    return NextResponse.json({ turn, verdict });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
