/**
 * Tolerant JSON extraction from an LLM reply — mirrors the artifact's
 * sample.json behaviour: try the whole reply, then a fenced code block,
 * then the span from the first { or [ to the last } or ].
 */
export function extractJson(raw: string): unknown {
  const text = (raw || "").trim();
  if (!text) throw new Error("empty_completion");

  const tryParse = (s: string): unknown | undefined => {
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  };

  let v = tryParse(text);
  if (v !== undefined) return v;

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    v = tryParse(fence[1].trim());
    if (v !== undefined) return v;
  }

  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  const lastObj = text.lastIndexOf("}");
  const lastArr = text.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  if (start !== -1 && end > start) {
    v = tryParse(text.slice(start, end + 1));
    if (v !== undefined) return v;
  }
  throw new Error("invalid_json");
}
