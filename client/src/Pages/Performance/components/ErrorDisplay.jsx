import { Alert, Box } from '@mui/material';

const ErrorDisplay = ({ message, severity = "error" }) => {
    return (
        <Box sx={{ p: 3 }}>
            <Alert severity={severity}>
                {message || "An error occurred. Please try again."}
            </Alert>
        </Box>
    );
};

export default ErrorDisplay; 