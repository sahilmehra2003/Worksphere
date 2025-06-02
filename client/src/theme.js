// Updated Custom Color Palette using only blue and related shades
export const tokensCustom = {
    blue: {
        100: "#5B8FB9",  // Primary
        200: "#7DA9C9",  // Lighter
        300: "#3A6FA5",  // Darker
    },
    black: {
        100: "#0B1120",  
        150: "#111827",  // Background (dark)
        200: "#181A33",  // Extra dark shade
    },
    white: {
        100: "#FFFFFF",  // Background (light)
        200: "#F3F4F6",  // Paper (light)
        300: "#E5E7EB",  
    },
    grey: {
        300: "#A0A0B0",  // Secondary text (dark)
        400: "#50506A",  // Divider (dark)
        500: "#4B5563",  // Secondary text (light)
    },
    deepBlue: {
        100: "#4b779b", // For `primary.dark`
    }
};

// MUI theme settings with dynamic mode
export const themeSettings = (mode) => {
    const isDark = mode === "dark";

    return {
        palette: {
            mode,
            primary: {
                main: tokensCustom.blue[100],
                light: tokensCustom.blue[200],
                dark: tokensCustom.deepBlue[100],
            },
            secondary: {
                main: tokensCustom.blue[200],
                light: tokensCustom.blue[100],
            },
            neutral: {
                main: tokensCustom.blue[100],
            },
            background: {
                default: isDark ? tokensCustom.black[150] : tokensCustom.white[200],
                paper: isDark ? tokensCustom.black[100] : tokensCustom.white[100],
            },
            text: {
                primary: isDark ? tokensCustom.white[100] : tokensCustom.black[150],
                secondary: isDark ? tokensCustom.grey[300] : tokensCustom.grey[500],
                light: tokensCustom.white[100],
                dark: tokensCustom.black[150] 
            },
            divider: isDark ? tokensCustom.grey[400] : tokensCustom.white[300],
            action: {
                hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                selected: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
            },
        },
        typography: {
            fontFamily: ["Roboto Mono", "monospace"].join(","),
            fontSize: 12,
            h1: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 40 },
            h2: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 32 },
            h3: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 24 },
            h4: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 20 },
            h5: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 16 },
            h6: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 14 },
            body1: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 14 },
            body2: { fontFamily: ["Roboto Mono", "monospace"].join(","), fontSize: 12 },
        },
    };
};
