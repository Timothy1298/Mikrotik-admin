var config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
                mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
            },
            colors: {
                background: {
                    main: "#0b1220",
                    panel: "#111827",
                    elevated: "#1f2937",
                    sidebar: "#0f172a",
                    border: "#1e293b",
                },
                primary: {
                    DEFAULT: "#3b82f6",
                    hover: "#2563eb",
                },
                brand: {
                    100: "#3b82f6",
                    200: "#3b82f6",
                    300: "#3b82f6",
                    400: "#3b82f6",
                    500: "#3b82f6",
                },
                text: {
                    primary: "#f9fafb",
                    secondary: "#9ca3af",
                    muted: "#6b7280",
                },
                warning: "#3b82f6",
                success: "#22c55e",
                danger: "#ef4444",
                slate: {
                    100: "#f9fafb",
                    200: "#d1d5db",
                    300: "#9ca3af",
                    400: "#6b7280",
                    500: "#6b7280",
                    700: "#1f2937",
                    800: "#111827",
                    900: "#0f172a",
                    950: "#0b1220",
                },
            },
            borderRadius: {
                lg: "8px",
                xl: "12px",
                "2xl": "16px",
            },
            boxShadow: {
                panel: "0 18px 40px rgba(2, 6, 23, 0.34)",
            },
            animation: {
                "fade-up": "fadeUp 0.24s ease-out",
                shimmer: "shimmer 1.8s linear infinite",
                pulsegrid: "pulseGrid 6s ease-in-out infinite",
            },
            keyframes: {
                fadeUp: {
                    from: { opacity: "0", transform: "translateY(8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "200% 0" },
                    "100%": { backgroundPosition: "-200% 0" },
                },
                pulseGrid: {
                    "0%, 100%": { opacity: "0.14" },
                    "50%": { opacity: "0.24" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
