import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      // NOTE: colors use RGB-channel vars with <alpha-value> so opacity
      // modifiers (bg-danger/10) and -fg utilities actually resolve.
      // Nested `fg` (not `foreground`) matches the *-fg classes in use.
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card-bg) / <alpha-value>)",
          fg: "rgb(var(--card-fg) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          fg: "rgb(var(--primary-fg) / <alpha-value>)",
          soft: "rgb(var(--primary-soft) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          fg: "rgb(var(--secondary-fg) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          fg: "rgb(var(--accent-fg) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          fg: "rgb(var(--muted-fg) / <alpha-value>)",
        },
        // Semantic status palette — Lunara-tinted, replaces raw
        // rose/amber/emerald/blue Tailwind defaults in feedback UI.
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          fg: "rgb(var(--success-fg) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          fg: "rgb(var(--warning-fg) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          fg: "rgb(var(--danger-fg) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--info) / <alpha-value>)",
          fg: "rgb(var(--info-fg) / <alpha-value>)",
        },
        // Severity scale tokens (6-bucket pain gradient). Lunara-tinted,
        // defined alongside success/warning/danger/info the same way.
        'severity-calm': {
          DEFAULT: "rgb(var(--severity-calm) / <alpha-value>)",
          fg: "rgb(var(--severity-calm-fg) / <alpha-value>)",
        },
        'severity-warm': {
          DEFAULT: "rgb(var(--severity-warm) / <alpha-value>)",
          fg: "rgb(var(--severity-warm-fg) / <alpha-value>)",
        },
        'severity-deep': {
          DEFAULT: "rgb(var(--severity-deep) / <alpha-value>)",
          fg: "rgb(var(--severity-deep-fg) / <alpha-value>)",
        },
        border: "var(--border)",
        lunara: {
          cream: "#FDFBF7",
          blush: "#F5E6E8",
          rose: "#E8C5C8",
          plum: "#4A2E35",
          charcoal: "#2D2628",
          lavender: "#E6E1F4",
          peach: "#FBE3D6",
          sage: "#E2EBE4",
          gold: "#F4E0A5",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(74, 46, 53, 0.05), 0 4px 12px -2px rgba(74, 46, 53, 0.03)",
        comfort: "0 20px 40px -15px rgba(232, 197, 200, 0.35), 0 8px 20px -6px rgba(74, 46, 53, 0.05)",
        glow: "0 0 25px rgba(232, 197, 200, 0.4)",
        card: "0 4px 20px -2px rgba(45, 38, 40, 0.04)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.8", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
