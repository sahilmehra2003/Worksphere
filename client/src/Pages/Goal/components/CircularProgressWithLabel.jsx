import { Box, Typography, CircularProgress } from '@mui/material';

// eslint-disable-next-line react/prop-types
const CircularProgressWithLabel = (props) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" {...props} size={60} />
        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" component="div" color="text.secondary">
                {`${Math.round(props.value)}%`}
            </Typography>
        </Box>
    </Box>
);

export default CircularProgressWithLabel; 