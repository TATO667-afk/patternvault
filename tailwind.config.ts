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
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#111111",
        border: "#222222",
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#ffffff",
          hover: "#4338CA",
        },
        success: { DEFAULT: "#22C55E", foreground: "#ffffff" },
        danger: { DEFAULT: "#EF4444", foreground: "#ffffff" },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#4F46E5",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#111111",
          foreground: "#F9FAFB",
        },
        popover: {
          DEFAULT: "#111111",
          foreground: "#F9FAFB",
        },
        secondary: {
          DEFAULT: "#1A1A1A",
          foreground: "#9CA3AF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },
        input: "#1A1A1A",
        ring: "#4F46E5",
        foreground: "#F9FAFB",
        marketplaces: {
          steam: "#1B2838",
          csfloat: "#2563EB",
          skinport: "#7C3AED",
          buff: "#DC2626",
          dmarket: "#0EA5E9",
          gamerpay: "#16A34A",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        shimmer:
          "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backgroundSize: {
        shimmer: "400% 100%",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [animate],
};

export default config;
