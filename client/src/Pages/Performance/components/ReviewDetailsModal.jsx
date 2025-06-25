import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Button,
    Modal,
    Grid,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Chip,
    Paper,
    Rating
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar
} from 'recharts';
import { fetchPerformanceReviewById } from '../../../redux/Slices/performanceReviewSlice';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import StatusChip from './StatusChip';

const ReviewDetailsModal = ({ open, handleClose, reviewId }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.auth.user);
    const { currentReviewDetails: review, detailsLoading, error } = useSelector(state => state.performanceReview);

    useEffect(() => {
        if (open && reviewId && token) {
            dispatch(fetchPerformanceReviewById({ reviewId, token }));
        }
    }, [dispatch, reviewId, token, open]);

    const handleCloseModal = useCallback(() => {
        handleClose();
    }, [handleClose]);

    // Prepare chart data
    const chartData = review?.goals?.map(goal => ({
        name: goal.description?.substring(0, 15) + '...' || 'Goal',
        progress: goal.progress || 0
    })) || [];

    if (review?.managerRating) {
        chartData.push({
            name: 'Overall Rating',
            progress: (review.managerRating / 5) * 100
        });
    }

    // Permission checks
    const canAcknowledge = review?.status === 'Completed' && review.employee?._id === user?._id;
    const canSubmitSelfAssessment = review?.status === 'Pending Self-Assessment' && review.employee?._id === user?._id;
    const canSubmitManagerReview = review?.status === 'Pending Manager Review' && review.manager?._id === user?._id;

    return (
        <Modal open={open} onClose={handleCloseModal}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 1000,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <IconButton
                    onClick={handleCloseModal}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>

                {detailsLoading ? (
                    <LoadingSpinner message="Loading review details..." />
                ) : error ? (
                    <ErrorDisplay message={error} />
                ) : !review ? (
                    <Typography>No review details found.</Typography>
                ) : (
                    <>
                        <Typography variant="h4" gutterBottom>
                            {review.reviewCycle?.name} for {review.employee?.name}
                        </Typography>

                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Review Information
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Status:</strong> <StatusChip status={review.status} />
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Employee:</strong> {review.employee?.name}
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Position:</strong> {review.employee?.position}
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Manager:</strong> {review.manager?.name || 'Not assigned'}
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Cycle:</strong> {review.reviewCycle?.name} {review.reviewCycle?.year}
                                    </Typography>
                                </Paper>

                                {review.goals && review.goals.length > 0 && (
                                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Goals
                                        </Typography>
                                        <List dense>
                                            {review.goals.map((goal, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={goal.description}
                                                        secondary={`Progress: ${goal.progress || 0}%`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                )}

                                {review.selfAssessmentComments && (
                                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Self-Assessment
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {review.selfAssessmentComments}
                                        </Typography>
                                    </Paper>
                                )}

                                {review.managerComments && (
                                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Manager Review
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                                            {review.managerComments}
                                        </Typography>

                                        {review.managerRating && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Overall Rating:
                                                </Typography>
                                                <Rating value={review.managerRating} readOnly max={5} />
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {review.managerRating}/5
                                                </Typography>
                                            </Box>
                                        )}

                                        {review.strengths && review.strengths.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Key Strengths:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {review.strengths.map((strength, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={strength}
                                                            size="small"
                                                            color="success"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {review.areasForDevelopment && review.areasForDevelopment.length > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Areas for Development:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {review.areasForDevelopment.map((area, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={area}
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Paper>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Performance Summary
                                    </Typography>
                                    {chartData.length > 0 ? (
                                        <Box sx={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={chartData}
                                                    layout="vertical"
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" domain={[0, 100]} unit="%" />
                                                    <YAxis type="category" dataKey="name" width={150} />
                                                    <Tooltip formatter={(value) => `${value}%`} />
                                                    <Legend />
                                                    <Bar dataKey="progress" fill="#8884d8" name="Completion/Rating" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No data available for chart.
                                        </Typography>
                                    )}
                                </Paper>

                                {/* Action Buttons */}
                                <Paper elevation={1} sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Actions
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {canSubmitSelfAssessment && (
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                fullWidth
                                            >
                                                Submit Self-Assessment
                                            </Button>
                                        )}

                                        {canSubmitManagerReview && (
                                            <Button
                                                variant="contained"
                                                color="info"
                                                fullWidth
                                            >
                                                Submit Manager Review
                                            </Button>
                                        )}

                                        {canAcknowledge && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircleIcon />}
                                                fullWidth
                                            >
                                                Acknowledge Review
                                            </Button>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </Modal>
    );
};

ReviewDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    reviewId: PropTypes.string
};

export default ReviewDetailsModal; 