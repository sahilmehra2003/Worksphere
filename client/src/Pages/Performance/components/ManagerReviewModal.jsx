import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Rating
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { submitManagerReview } from '../../../redux/Slices/performanceReviewSlice';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const ManagerReviewModal = ({ open, handleClose, review, onSuccess }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const [comments, setComments] = useState(review?.managerComments || '');
    const [rating, setRating] = useState(review?.managerRating || 3);
    const [strengths, setStrengths] = useState(review?.strengths?.join(', ') || '');
    const [areas, setAreas] = useState(review?.areasForDevelopment?.join(', ') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await dispatch(submitManagerReview({
                managerReviewData: {
                    reviewId: review._id,
                    managerComments: comments,
                    managerRating: rating,
                    strengths: strengths.split(',').map(s => s.trim()).filter(Boolean),
                    areasForDevelopment: areas.split(',').map(a => a.trim()).filter(Boolean)
                },
                token
            })).unwrap();
            setLoading(false);
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            setError(err?.message || 'Failed to submit manager review.');
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4
            }}>
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" gutterBottom>Submit Manager Review</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Manager Comments"
                        multiline
                        minRows={4}
                        fullWidth
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Rating</Typography>
                        <Rating
                            value={rating}
                            onChange={(_, value) => setRating(value)}
                            max={5}
                            min={1}
                            required
                        />
                    </Box>
                    <TextField
                        label="Key Strengths (comma separated)"
                        fullWidth
                        value={strengths}
                        onChange={e => setStrengths(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Areas for Development (comma separated)"
                        fullWidth
                        value={areas}
                        onChange={e => setAreas(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    {loading ? <LoadingSpinner message="Submitting..." /> : (
                        <Button type="submit" variant="contained" color="info" fullWidth>
                            Submit
                        </Button>
                    )}
                    {error && <ErrorDisplay message={error} />}
                </form>
            </Box>
        </Modal>
    );
};

ManagerReviewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    review: PropTypes.object.isRequired,
    onSuccess: PropTypes.func
};

export default ManagerReviewModal; 