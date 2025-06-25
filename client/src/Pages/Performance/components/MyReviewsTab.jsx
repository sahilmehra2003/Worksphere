import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    List,
    Alert,
    Paper,
    Button
} from '@mui/material';
import { fetchMyPerformanceReviews } from '../../../redux/Slices/performanceReviewSlice';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import ReviewListItem from './ReviewListItem';
import SelfAssessmentModal from './SelfAssessmentModal';

const MyReviewsTab = ({ onReviewClick }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.auth.user);
    const { myReviews, loading, error } = useSelector(state => state.performanceReview);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        if (token) {
            dispatch(fetchMyPerformanceReviews({ token }));
        }
    }, [dispatch, token]);

    const handleViewReview = useCallback((reviewId) => {
        onReviewClick(reviewId);
    }, [onReviewClick]);

    const handleOpenSelfAssessment = (review) => {
        setSelectedReview(review);
        setModalOpen(true);
    };
    const handleCloseSelfAssessment = () => {
        setModalOpen(false);
        setSelectedReview(null);
        // Optionally refresh reviews
        dispatch(fetchMyPerformanceReviews({ token }));
    };

    if (loading) {
        return <LoadingSpinner message="Loading your reviews..." />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                My Performance Reviews
            </Typography>

            {myReviews.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3 }}>
                    <Alert severity="info">
                        You don&apos;t have any performance reviews yet. Reviews will appear here once they are initiated by your manager or HR.
                    </Alert>
                </Paper>
            ) : (
                <Paper elevation={1}>
                    <List>
                        {myReviews.map(review => (
                            <Box key={review._id}>
                                <ReviewListItem
                                    review={review}
                                    onView={handleViewReview}
                                />
                                {review.status === 'Pending Self-Assessment' && review.employee?._id === user?._id && (
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            onClick={() => handleOpenSelfAssessment(review)}
                                        >
                                            Submit Self-Assessment
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </List>
                </Paper>
            )}
            {selectedReview && (
                <SelfAssessmentModal
                    open={modalOpen}
                    handleClose={handleCloseSelfAssessment}
                    review={selectedReview}
                    onSuccess={handleCloseSelfAssessment}
                />
            )}
        </Box>
    );
};

MyReviewsTab.propTypes = {
    onReviewClick: PropTypes.func.isRequired
};

export default MyReviewsTab; 