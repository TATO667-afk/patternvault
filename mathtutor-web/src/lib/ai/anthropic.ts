import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { extractJson } from "@/lib/ai/json";

/** Server-only Anthropic wrapper. The API key lives exclusively in
 *  process.env on the server and is never sent to the browser. */

export class AIError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message || code);
    this.code = code;
  }
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AIError("missing_key", "ANTHROPIC_API_KEY is not configured on the server");
  return new Anthropic({ apiKey: key });
}

export type Role = "user" | "assistant";
export interface TextTurn {
  role: Role;
  content: string;
}

export interface ImagePart {
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  base64: string;
}

export interface CompleteOptions {
  maxTokens?: number;
  images?: ImagePart[]; // attached to the final user turn
  system?: string;
}

function toMessages(input: string | TextTurn[], images?: ImagePart[]): Anthropic.MessageParam[] {
  const turns: TextTurn[] = typeof input === "string" ? [{ role: "user", content: input }] : input.slice();
  const msgs: Anthropic.MessageParam[] = turns.map((t) => ({ role: t.role, content: t.content }));
  if (images && images.length && msgs.length) {
    const last = msgs[msgs.length - 1];
    const blocks: Array<Anthropic.ImageBlockParam | Anthropic.TextBlockParam> = [];
    for (const img of images) {
      blocks.push({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } });
    }
    blocks.push({ type: "text", text: typeof last.content === "string" ? last.content : "" });
    last.content = blocks;
  }
  return msgs;
}

export async function complete(input: string | TextTurn[], opts: CompleteOptions = {}): Promise<string> {
  const client = getClient();
  let res: Anthropic.Message;
  try {
    res = await client.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 2000,
      system: opts.system,
      messages: toMessages(input, opts.images),
    });
  } catch (e: unknown) {
    const status = (e as { status?: number })?.status;
    if (status === 401) throw new AIError("auth", "Anthropic rejected the API key");
    if (status === 429) throw new AIError("rate_limited", "Anthropic rate limit");
    if (status === 400) throw new AIError("bad_request", (e as Error).message);
    throw new AIError("upstream_error", (e as Error)?.message || "AI request failed");
  }
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) throw new AIError("empty_completion", "AI returned no text");
  return text;
}

export async function completeJson<T>(schema: z.ZodType<T>, input: string | TextTurn[], opts: CompleteOptions = {}): Promise<T> {
  const raw = await complete(input, opts);
  let parsed: unknown;
  try {
    parsed = extractJson(raw);
  } catch {
    throw new AIError("invalid_json", "AI reply was not valid JSON");
  }
  const result = schema.safeParse(parsed);
  if (!result.success) throw new AIError("invalid_shape", "AI reply did not match the expected structure");
  return result.data;
}

/** Map an internal error code to friendly Hebrew copy for the client. */
export function hebrewError(code: string): string {
  switch (code) {
    case "missing_key":
    case "auth":
      return "שירות ה-AI אינו מוגדר כראוי בשרת. פנו למנהל המערכת.";
    case "rate_limited":
    case "quota":
      return "הגעתם למגבלת השימוש הזמנית. נסו שוב בעוד מעט.";
    case "invalid_json":
    case "invalid_shape":
    case "empty_completion":
      return "לא הצלחתי לנסח תשובה ברורה. נסו לנסח מחדש ולנסות שוב.";
    case "bad_request":
      return "הבקשה לא תקינה. נסו קלט אחר.";
    case "image_rejected":
      return "התמונה לא התקבלה. נסו קובץ אחר (JPG/PNG/WEBP, לא גדול מדי).";
    default:
      return "קרתה תקלה זמנית. נסו שוב בעוד רגע.";
  }
}
