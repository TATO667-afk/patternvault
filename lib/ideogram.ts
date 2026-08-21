// Client for the Ideogram image generation API — used to render AI showcase
// art for standout patterns (blue gems, high-phase Dopplers, high Fade %).

const IDEOGRAM_GENERATE_URL = "https://api.ideogram.ai/generate";

export interface ShowcasePatternInput {
  weaponName: string;
  skinName: string;
  patternId: number;
  isBlueGem?: boolean;
  phase?: string;
  bluePercent?: number;
  goldPercent?: number;
  fadePercent?: number;
  rarityScore?: number;
  tier?: number;
}

export interface ShowcaseImageResult {
  imageUrl: string;
  prompt: string;
}

function buildPrompt(pattern: ShowcasePatternInput): string {
  const traits: string[] = [];

  if (pattern.isBlueGem) traits.push("an almost fully blue, mirror-polished case-hardened finish");
  if (pattern.phase) traits.push(`a vivid ${pattern.phase} doppler swirl`);
  if (pattern.fadePercent != null) traits.push(`a ${pattern.fadePercent}% purple-to-yellow fade gradient`);
  if (pattern.bluePercent != null && !pattern.isBlueGem) traits.push(`${pattern.bluePercent}% blue coverage`);
  if (pattern.goldPercent != null) traits.push(`${pattern.goldPercent}% gold streaking`);

  const traitText = traits.length ? traits.join(", ") : "a striking, richly detailed finish";
  const rarityText =
    pattern.rarityScore != null && pattern.rarityScore >= 95
      ? "This is one of the rarest, most sought-after collector patterns in existence."
      : "This is a prized collector pattern.";

  return (
    `Studio product photograph of a ${pattern.weaponName} ${pattern.skinName} weapon skin, ` +
    `pattern #${pattern.patternId}, showing ${traitText}. Dramatic dark background, ` +
    `rim lighting, macro detail on the metal finish, ultra-sharp reflections. ${rarityText} ` +
    `No text, no watermark, no UI elements.`
  );
}

export async function generateShowcaseImage(
  pattern: ShowcasePatternInput
): Promise<ShowcaseImageResult> {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("IDEOGRAM_API_KEY is not configured");
  }

  const prompt = buildPrompt(pattern);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let res: Response;
  try {
    res = await fetch(IDEOGRAM_GENERATE_URL, {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_request: {
          prompt,
          aspect_ratio: "ASPECT_1_1",
          model: "V_2",
          magic_prompt_option: "AUTO",
        },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Ideogram API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const imageUrl: string | undefined = data?.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Ideogram API returned no image");
  }

  return { imageUrl, prompt };
}
