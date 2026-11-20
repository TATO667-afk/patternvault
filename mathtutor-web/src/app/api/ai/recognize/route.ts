import { NextResponse, type NextRequest } from "next/server";
import { guardAi, aiErrorResponse } from "@/lib/ai/guard";
import { completeJson, type ImagePart } from "@/lib/ai/anthropic";
import { RecognizedImageSchema } from "@/lib/ai/schemas";
import { recognizePrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED: Record<string, ImagePart["mediaType"]> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB upload cap

export async function POST(req: NextRequest) {
  const g = await guardAi("recognize");
  if ("error" in g) return g.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file", message: "לא התקבלה תמונה." }, { status: 400 });
  const mediaType = ALLOWED[file.type];
  if (!mediaType) return NextResponse.json({ error: "bad_type", message: "סוג קובץ לא נתמך (JPG/PNG/WEBP)." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large", message: "הקובץ גדול מדי (עד 6MB)." }, { status: 400 });

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  try {
    const data = await completeJson(RecognizedImageSchema, [{ role: "user", content: recognizePrompt() }], {
      images: [{ mediaType, base64 }],
      maxTokens: 800,
    });
    // Privacy: we do NOT persist the uploaded image; only the recognized text is returned.
    return NextResponse.json(data);
  } catch (e) {
    return aiErrorResponse(e);
  }
}
