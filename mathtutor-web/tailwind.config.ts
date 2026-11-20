import type { Config } from "tailwindcss";

// Visual identity carried over from the artifact: indigo brand, amber accent,
// green = verified, warm neutrals. Dark mode via prefers-color-scheme + .dark class.
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        ink: "var(--ink)",
        inksoft: "var(--ink-soft)",
        line: "var(--line)",
        brand: "var(--brand)",
        brandsoft: "var(--brand-soft)",
        accent: "var(--accent)",
        accentsoft: "var(--accent-soft)",
        good: "var(--good)",
        goodsoft: "var(--good-soft)",
        warn: "var(--warn)",
        warnsoft: "var(--warn-soft)",
        bad: "var(--bad)",
        badsoft: "var(--bad-soft)",
      },
      fontFamily: {
        head: ["var(--font-head)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl2: "16px" },
      boxShadow: {
        card: "0 1px 2px rgba(26,29,46,.05), 0 8px 24px rgba(26,29,46,.06)",
      },
    },
  },
  plugins: [],
};

export default config;
