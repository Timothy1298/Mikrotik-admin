declare const config: {
    content: string[];
    theme: {
        extend: {
            fontFamily: {
                sans: [string, string, string, string];
                mono: [string, string, string, string];
            };
            colors: {
                background: {
                    main: string;
                    panel: string;
                    elevated: string;
                    sidebar: string;
                    border: string;
                };
                primary: {
                    DEFAULT: string;
                    hover: string;
                };
                brand: {
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                };
                text: {
                    primary: string;
                    secondary: string;
                    muted: string;
                };
                warning: string;
                success: string;
                danger: string;
                slate: {
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    700: string;
                    800: string;
                    900: string;
                    950: string;
                };
            };
            borderRadius: {
                lg: string;
                xl: string;
                "2xl": string;
            };
            boxShadow: {
                panel: string;
            };
            animation: {
                "fade-up": string;
                shimmer: string;
                pulsegrid: string;
            };
            keyframes: {
                fadeUp: {
                    from: {
                        opacity: string;
                        transform: string;
                    };
                    to: {
                        opacity: string;
                        transform: string;
                    };
                };
                shimmer: {
                    "0%": {
                        backgroundPosition: string;
                    };
                    "100%": {
                        backgroundPosition: string;
                    };
                };
                pulseGrid: {
                    "0%, 100%": {
                        opacity: string;
                    };
                    "50%": {
                        opacity: string;
                    };
                };
            };
        };
    };
    plugins: any[];
};
export default config;
