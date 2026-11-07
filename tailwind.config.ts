import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050805",
        "crt-green": "#20c20e",
        "crt-bright": "#3bf824",
        "crt-dim": "#0f5907",
        "crt-dark": "#0a2607",
        "crt-glow": "rgba(32, 194, 14, 0.35)",
        "crt-scanline": "rgba(16, 40, 16, 0.4)",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "'Liberation Mono'",
          "'Courier New'",
          "monospace",
        ],
      },
      animation: {
        flicker: "flicker 0.15s infinite",
        glitch: "glitch 0.3s cubic-bezier(.25, .46, .45, .94) both",
        scanline: "scanline 8s linear infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%": { opacity: "0.98" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.96" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-5px, 3px) skewX(2deg)" },
          "40%": { transform: "translate(5px, -3px) skewX(-2deg)" },
          "60%": { transform: "translate(-3px, 1px) scale(1.01)" },
          "80%": { transform: "translate(3px, -1px)" },
          "100%": { transform: "translate(0)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        pulseGlow: {
          "0%, 100%": { textShadow: "0 0 4px #20c20e, 0 0 10px rgba(32, 194, 14, 0.5)" },
          "50%": { textShadow: "0 0 8px #3bf824, 0 0 16px rgba(59, 248, 36, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
