import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson } from "@/lib/ai/anthropic";
import { ExamQuestionsSchema } from "@/lib/ai/schemas";
import { examQuestionsPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  level: z.enum(["3", "4", "5"]),
  count: z.number().int().min(1).max(12),
});

export async function POST(req: NextRequest) {
  const g = await guardAi("exam");
  if ("error" in g) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_input" }, { status: 400 });
  try {
    const data = await completeJson(ExamQuestionsSchema, examQuestionsPrompt(parsed.data.level, parsed.data.count), {
      maxTokens: 3500,
    });
    return NextResponse.json({ questions: data });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
