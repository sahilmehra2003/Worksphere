import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { submitSelfAssessment } from '../../../redux/Slices/performanceReviewSlice';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const SelfAssessmentModal = ({ open, handleClose, review, onSuccess }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const [comments, setComments] = useState(review?.selfAssessmentComments || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await dispatch(submitSelfAssessment({
                selfAssessmentData: {
                    reviewId: review._id,
                    selfAssessmentComments: comments
                },
                token
            })).unwrap();
            setLoading(false);
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            setError(err?.message || 'Failed to submit self-assessment.');
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
                <Typography variant="h6" gutterBottom>Submit Self-Assessment</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Self-Assessment Comments"
                        multiline
                        minRows={4}
                        fullWidth
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    {loading ? <LoadingSpinner message="Submitting..." /> : (
                        <Button type="submit" variant="contained" color="warning" fullWidth>
                            Submit
                        </Button>
                    )}
                    {error && <ErrorDisplay message={error} />}
                </form>
            </Box>
        </Modal>
    );
};

SelfAssessmentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    review: PropTypes.object.isRequired,
    onSuccess: PropTypes.func
};

export default SelfAssessmentModal; 