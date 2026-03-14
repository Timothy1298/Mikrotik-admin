import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        white: "#ffffff",
        canvas: "#080e1f",
        slate: {
          50: "#ffffff",
          100: "#e0f2fe",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#bfd0e5",
          500: "#94a3b8",
          600: "#7dd3fc",
          700: "#38bdf8",
          800: "#0a1220",
          900: "#080e1f",
          950: "#080e1f",
        },
        surface: {
          1: "#080e1f",
          2: "#0a1220",
          3: "rgba(8,14,31,0.9)",
        },
        brand: {
          50: "#e0f2fe",
          100: "#7dd3fc",
          300: "#38bdf8",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#0284c7",
        },
        success: "#7dd3fc",
        warning: "#c4b5fd",
        danger: "#f87171",
      },
      boxShadow: {
        panel: "none",
        glow: "none",
        inset: "none",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "float-soft": "floatSoft 8s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "fade-up": "fadeUp 0.4s ease-out",
        pulsegrid: "pulseGrid 6s ease-in-out infinite",
      },
      keyframes: {
        floatSoft: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGrid: {
          "0%, 100%": { opacity: "0.18" },
          "50%": { opacity: "0.32" },
        },
      },
      backgroundImage: {
        "panel-glow": "radial-gradient(circle at top left, rgba(37,99,235,0.16) 0%, transparent 42%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
