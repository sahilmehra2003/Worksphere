import { GlobalStyles, useTheme } from '@mui/material';

const ScrollbarStyles = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <GlobalStyles styles={{
            '::-webkit-scrollbar': {
                width: '8px',
            },
            '::-webkit-scrollbar-track': {
                backgroundColor: isDark ? '#21295c' : '#e0e0e0',
            },
            '::-webkit-scrollbar-thumb': {
                backgroundColor: isDark ? '#666666' : '#999999',
                borderRadius: '10px',
            },
            '::-webkit-scrollbar-thumb:hover': {
                backgroundColor: isDark ? '#4d547d' : '#777777',
            },
        }} />
    );
};

export default ScrollbarStyles;
