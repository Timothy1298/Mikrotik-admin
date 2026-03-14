declare const _default: {
    content: string[];
    theme: {
        extend: {
            fontFamily: {
                sans: [string, string];
                mono: [string, string];
            };
            colors: {
                white: string;
                canvas: string;
                slate: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    900: string;
                    950: string;
                };
                surface: {
                    1: string;
                    2: string;
                    3: string;
                };
                brand: {
                    50: string;
                    100: string;
                    300: string;
                    500: string;
                    600: string;
                    700: string;
                };
                success: string;
                warning: string;
                danger: string;
            };
            boxShadow: {
                panel: string;
                glow: string;
                inset: string;
            };
            borderRadius: {
                "4xl": string;
            };
            animation: {
                "float-soft": string;
                shimmer: string;
                "fade-up": string;
                pulsegrid: string;
            };
            keyframes: {
                floatSoft: {
                    "0%, 100%": {
                        transform: string;
                    };
                    "50%": {
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
                pulseGrid: {
                    "0%, 100%": {
                        opacity: string;
                    };
                    "50%": {
                        opacity: string;
                    };
                };
            };
            backgroundImage: {
                "panel-glow": string;
            };
        };
    };
    plugins: any[];
};
export default _default;
