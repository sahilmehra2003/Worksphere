import { useEffect, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { fetchAllReviewCycles } from '../../../redux/Slices/reviewCycleSlice';
import { fetchAllEmployeesInternal } from '../../../redux/Slices/employeeSlice';
import { fetchAllPerformanceReviews } from '../../../redux/Slices/performanceReviewSlice';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import StatusChip from './StatusChip';
import ManagerReviewModal from './ManagerReviewModal';

const PendingReviewsTab = ({ onReviewClick }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.auth.user);
    const reviewCycles = useSelector(state => state.reviewCycle.reviewCycles);
    const cyclesLoading = useSelector(state => state.reviewCycle.loadingList);
    const employeesLoading = useSelector(state => state.employee.loading);
    const allReviews = useSelector(state => state.performanceReview.allReviews);
    const reviewsLoading = useSelector(state => state.performanceReview.loading);
    const error = useSelector(state => state.performanceReview.error);

    const [selectedCycle, setSelectedCycle] = useState('');
    const [managerModalOpen, setManagerModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    // Load data on component mount
    useEffect(() => {
        if (token) {
            dispatch(fetchAllReviewCycles({ token }));
            dispatch(fetchAllEmployeesInternal({ token }));
            dispatch(fetchAllPerformanceReviews({ token }));
        }
    }, [dispatch, token]);

    // Filter reviews based on selected cycle
    const filteredReviews = useMemo(() => {
        if (!selectedCycle) {
            return allReviews;
        }
        return allReviews.filter(review =>
            review.reviewCycle?._id === selectedCycle
        );
    }, [selectedCycle, allReviews]);

    const handleViewReview = useCallback((reviewId) => {
        onReviewClick(reviewId);
    }, [onReviewClick]);

    const handleCycleChange = useCallback((event) => {
        setSelectedCycle(event.target.value);
    }, []);

    const handleOpenManagerReview = (review) => {
        setSelectedReview(review);
        setManagerModalOpen(true);
    };
    const handleCloseManagerReview = () => {
        setManagerModalOpen(false);
        setSelectedReview(null);
        // Optionally refresh reviews
        dispatch(fetchAllPerformanceReviews({ token }));
    };

    if (cyclesLoading || employeesLoading || reviewsLoading) {
        return <LoadingSpinner message="Loading reviews..." />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                All Performance Reviews
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

            {filteredReviews.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3 }}>
                    <Alert severity="info">
                        {selectedCycle
                            ? "No reviews found for the selected cycle."
                            : "No performance reviews found."
                        }
                    </Alert>
                </Paper>
            ) : (
                <Paper elevation={1}>
                    <List>
                        {filteredReviews.map(review => (
                            <Box key={review._id}>
                                <ListItem
                                    divider
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                <Typography variant="subtitle1">
                                                    {review.employee?.name || 'Unknown Employee'}
                                                </Typography>
                                                <StatusChip status={review.status} />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Cycle: {review.reviewCycle?.name} {review.reviewCycle?.year}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Position: {review.employee?.position || 'Not specified'}
                                                </Typography>
                                                {review.manager && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Manager: {review.manager?.name || 'Not assigned'}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AssignmentIcon />}
                                            onClick={() => handleViewReview(review._id)}
                                        >
                                            View Details
                                        </Button>
                                        {review.status === 'Pending Manager Review' && (review.manager?._id === user?._id || user?.role === 'Admin') && (
                                            <Button
                                                variant="contained"
                                                color="info"
                                                size="small"
                                                sx={{ ml: 1 }}
                                                onClick={() => handleOpenManagerReview(review)}
                                            >
                                                Add Manager Review
                                            </Button>
                                        )}
                                    </Box>
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                </Paper>
            )}
            {selectedReview && (
                <ManagerReviewModal
                    open={managerModalOpen}
                    handleClose={handleCloseManagerReview}
                    review={selectedReview}
                    onSuccess={handleCloseManagerReview}
                />
            )}
        </Box>
    );
};

PendingReviewsTab.propTypes = {
    onReviewClick: PropTypes.func.isRequired
};

export default PendingReviewsTab; 