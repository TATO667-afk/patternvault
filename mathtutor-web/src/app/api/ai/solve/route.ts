import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson } from "@/lib/ai/anthropic";
import { SolveSchema } from "@/lib/ai/schemas";
import { solvePrompt } from "@/lib/ai/prompts";
import { runCheck } from "@/lib/math/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ problem: z.string().min(1).max(4000) });

export async function POST(req: NextRequest) {
  const g = await guardAi("solve");
  if ("error" in g) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_input", message: "שאלה לא תקינה." }, { status: 400 });
  try {
    const data = await completeJson(SolveSchema, solvePrompt(parsed.data.problem), { maxTokens: 3200 });
    const verify = runCheck(data.check); // deterministic — authoritative, computed on the server
    return NextResponse.json({ ...data, verify });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
