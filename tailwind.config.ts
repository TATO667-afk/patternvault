import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1380px" } },
    extend: {
      colors: {
        bg:       "#07080a",
        s1:       "#0c0d11",
        s2:       "#111318",
        s3:       "#16181f",
        border:   { DEFAULT: "#1c1e27", bright: "#272a36" },
        t1:       "#eceef3",
        t2:       "#8c90a8",
        t3:       "#52556a",
        blue:     { DEFAULT: "#5865f2", bright: "#818cf8", dim: "rgba(88,101,242,0.12)" },
        purple:   "#9333ea",
        gold:     { DEFAULT: "#f59e0b", dim: "rgba(245,158,11,0.12)" },
        teal:     "#06b6d4",
        gem:      "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(88,101,242,0.2)" },
          "50%":      { boxShadow: "0 0 40px rgba(88,101,242,0.4)" },
        },
      },
      animation: {
        "fade-up":   "fade-up 0.5s ease both",
        shimmer:     "shimmer 1.5s infinite",
        float:       "float 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        card:       "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4)",
        blue:       "0 0 40px rgba(88,101,242,0.15)",
        gold:       "0 0 40px rgba(245,158,11,0.15)",
        gem:        "0 0 30px rgba(59,130,246,0.3)",
      },
    },
  },
  plugins: [animate],
};

export default config;
