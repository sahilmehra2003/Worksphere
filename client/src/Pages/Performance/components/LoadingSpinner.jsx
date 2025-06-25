import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                gap: 2
            }}
        >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
};

export default LoadingSpinner; 