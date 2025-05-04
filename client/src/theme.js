// Custom Color Palette
export const tokensCustom = {
    teal: {
        100: "#B6EADA",
    },
    black: {
        100: "#03001C",
    },
    blue: {
        100: "#5B8FB9",
    },
    deepBlue: {  
        100: "#301E67",
    }
};

// MUI theme settings function for dark mode
export const themeSettings = (mode) => {
    if (mode !== "dark") {
        throw new Error("This themeSettings function is currently set up for dark mode only.");
    }

    return {
        palette: {
            mode: mode,
            primary: {
                main: tokensCustom.deepBlue[100], // Use deep blue for primary
                light: tokensCustom.deepBlue[100],
                dark: tokensCustom.black[100],
            },
            secondary: {
                main: tokensCustom.blue[100], // Use blue for secondary
                light: tokensCustom.blue[100],
                dark: tokensCustom.blue[100],
            },
            neutral: {
                ...tokensCustom.teal,
                main: tokensCustom.teal[100], // Use white for neutral
            },
            background: {
                alt: tokensCustom.black[100],
            },
        },
        typography: {
            fontFamily: ["Inter", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 40,
            },
            h2: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 32,
            },
            h3: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 24,
            },
            h4: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 20,
            },
            h5: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 16,
            },
            h6: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 14,
            },
            body1: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 14,
            body2: {
                fontFamily: ["Inter", "sans-serif"].join(","),
                fontSize: 12,
            },
        },
    },
}
}