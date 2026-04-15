import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        "bg-deep":   "#0B0C10",
        "bg-dark":   "#121317",
        "bg-mid":    "#1A1B20",
        "bg-card":   "#16181F",
        "bg-card2":  "#1F1F24",
        purple:      "#B026FF",
        cyan:        "#BDF4FF",
        "light-purple": "#E5B5FF",
        "text-primary": "#E3E2E8",
        "text-muted":   "#D2C1D7",
      },
      animation: {
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "float-hud": "floatHud 4s ease-in-out infinite",
        "scroll-fade": "scrollFade 2s ease-in-out infinite",
      },
      keyframes: {
        pulseDot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.3)" },
        },
        floatHud: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scrollFade: {
          "0%": { opacity: "1", transform: "scaleY(1)" },
          "100%": { opacity: "0", transform: "scaleY(0.2)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
