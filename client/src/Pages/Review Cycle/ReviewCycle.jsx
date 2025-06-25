import { Box, Typography } from '@mui/material';
import { ReviewCycleList } from './components';

const ReviewCycleManagement = () => {
    return (
        <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Review Cycle Management
            </Typography>
            <ReviewCycleList />
        </Box>
    );
};

export default ReviewCycleManagement;