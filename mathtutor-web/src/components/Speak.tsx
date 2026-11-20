"use client";

/**
 * Independent Hebrew voice fallback using the browser's Web Speech API
 * (SpeechSynthesis). The artifact used Claude's `window.claude.tts`, which does
 * not exist outside Claude. This fallback needs no server and no key, BUT:
 *  - Hebrew voice availability and quality depend on the user's OS/browser.
 *  - Some browsers have no Hebrew voice at all (then it may be skipped/odd).
 *  Quality improvements are intentionally out of scope for Phase 5.
 */
export function speak(text: string) {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(String(text).slice(0, 2000));
    u.lang = "he-IL";
    const voices = window.speechSynthesis.getVoices();
    const he = voices.find((v) => (v.lang || "").toLowerCase().startsWith("he"));
    if (he) u.voice = he;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <button
      type="button"
      aria-label="השמע"
      title="השמע בקול (קול הדפדפן)"
      className={className || "text-brand p-1"}
      onClick={() => speak(text)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 6a9 9 0 0 1 0 12" />
      </svg>
    </button>
  );
}
