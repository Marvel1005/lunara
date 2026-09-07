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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card-bg)",
          foreground: "var(--card-fg)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-fg)",
          soft: "var(--primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-fg)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-fg)",
          soft: "var(--accent-soft)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-fg)",
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
        display: ["var(--font-outfit)", "serif"],
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
