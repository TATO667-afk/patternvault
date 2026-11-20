import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson } from "@/lib/ai/anthropic";
import { GeneratedQuestionSchema } from "@/lib/ai/schemas";
import { generateQuestionPrompt } from "@/lib/ai/prompts";
import { findTopic, anyTopic, diffWord } from "@/lib/curriculum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  level: z.enum(["3", "4", "5"]),
  topicId: z.string().min(1),
  diff: z.number().int().min(1).max(3),
});

export async function POST(req: NextRequest) {
  const g = await guardAi("generate");
  if ("error" in g) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_input" }, { status: 400 });
  const { level, topicId, diff } = parsed.data;
  const topic = findTopic(level, topicId) || anyTopic(topicId);
  if (!topic) return NextResponse.json({ error: "unknown_topic" }, { status: 400 });
  try {
    const data = await completeJson(GeneratedQuestionSchema, generateQuestionPrompt(level, topic.name, topic.subs, diffWord(diff)), {
      maxTokens: 1200,
    });
    return NextResponse.json(data);
  } catch (e) {
    return aiErrorResponse(e);
  }
}
