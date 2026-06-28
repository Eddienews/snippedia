
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        snippedia: {
          red: "#FE2C55",
          blue: "#20D5EC",
          dark: "#121212",
          gray: "#F1F1F2",
        },
        // New theme color schemes
        ocean: {
          primary: "#0EA5E9",
          secondary: "#06B6D4",
          accent: "#3B82F6",
          dark: "#0F172A",
        },
        forest: {
          primary: "#10B981",
          secondary: "#059669",
          accent: "#34D399",
          dark: "#064E3B",
        },
        sunset: {
          primary: "#F59E0B",
          secondary: "#EF4444",
          accent: "#F97316",
          dark: "#451A03",
        },
        midnight: {
          primary: "#8B5CF6",
          secondary: "#A855F7",
          accent: "#9333EA",
          dark: "#1E1B4B",
        },
        royal: {
          primary: "#DC2626",
          secondary: "#B91C1C",
          accent: "#EF4444",
          dark: "#7F1D1D",
        },
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
      },
      keyframes: {
        "ken-burns": {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.1) translate(-2%, -2%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(254, 44, 85, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(254, 44, 85, 0.8)" },
        },
        "theme-transition": {
          "0%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "ken-burns": "ken-burns 20s ease infinite alternate",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "theme-transition": "theme-transition 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
