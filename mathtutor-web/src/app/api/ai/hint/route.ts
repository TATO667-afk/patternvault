import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson } from "@/lib/ai/anthropic";
import { HintSchema } from "@/lib/ai/schemas";
import { hintPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  question: z.string().min(1).max(4000),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export async function POST(req: NextRequest) {
  const g = await guardAi("hint");
  if ("error" in g) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_input" }, { status: 400 });
  try {
    const data = await completeJson(HintSchema, hintPrompt(parsed.data.question, parsed.data.level), { maxTokens: 700 });
    return NextResponse.json(data);
  } catch (e) {
    return aiErrorResponse(e);
  }
}
