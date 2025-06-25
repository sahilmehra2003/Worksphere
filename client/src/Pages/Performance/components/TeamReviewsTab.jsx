import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    List,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { fetchTeamPerformanceReviews } from '../../../redux/Slices/performanceReviewSlice';
import { fetchAllReviewCycles } from '../../../redux/Slices/reviewCycleSlice';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import ReviewListItem from './ReviewListItem';

const TeamReviewsTab = ({ onReviewClick }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const { teamReviews, loading, error } = useSelector(state => state.performanceReview);
    const { reviewCycles } = useSelector(state => state.reviewCycle);

    const [selectedCycle, setSelectedCycle] = useState('');

    useEffect(() => {
        if (token) {
            dispatch(fetchAllReviewCycles({ token }));
        }
    }, [dispatch, token]);

    useEffect(() => {
        if (token) {
            const params = selectedCycle ? { cycleId: selectedCycle } : {};
            dispatch(fetchTeamPerformanceReviews({ token, ...params }));
        }
    }, [dispatch, token, selectedCycle]);

    const handleViewReview = useCallback((reviewId) => {
        onReviewClick(reviewId);
    }, [onReviewClick]);

    const handleCycleChange = useCallback((event) => {
        setSelectedCycle(event.target.value);
    }, []);

    if (loading) {
        return <LoadingSpinner message="Loading team reviews..." />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Team Performance Reviews
            </Typography>

            {/* Filter by Review Cycle */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Filter by Review Cycle</InputLabel>
                        <Select
                            value={selectedCycle}
                            label="Filter by Review Cycle"
                            onChange={handleCycleChange}
                        >
                            <MenuItem value="">All Cycles</MenuItem>
                            {reviewCycles.map(cycle => (
                                <MenuItem key={cycle._id} value={cycle._id}>
                                    {cycle.name} {cycle.year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {teamReviews.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3 }}>
                    <Alert severity="info">
                        {selectedCycle
                            ? "No team reviews found for the selected cycle."
                            : "You don&apos;t have any team members with performance reviews yet."
                        }
                    </Alert>
                </Paper>
            ) : (
                <Paper elevation={1}>
                    <List>
                        {teamReviews.map(review => (
                            <ReviewListItem
                                key={review._id}
                                review={review}
                                onView={handleViewReview}
                            />
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

TeamReviewsTab.propTypes = {
    onReviewClick: PropTypes.func.isRequired
};

export default TeamReviewsTab; 