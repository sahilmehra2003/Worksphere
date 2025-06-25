import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Modal,
    TextField,
    Slider,
    CircularProgress,
    Alert
} from '@mui/material';

// eslint-disable-next-line react/prop-types
const UpdateProgressModal = ({ open, handleClose, onSave, goal }) => {
    const [progress, setProgress] = useState(goal?.progress || 0);
    const [description, setDescription] = useState('');
    const { operationLoading, operationError, operationSuccess } = useSelector(state => state.goal);

    useEffect(() => {
        if (operationSuccess) handleClose();
    }, [operationSuccess, handleClose]);

    const handleSubmit = () => {
        onSave({ progress, progressDescription: description });
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                <Typography variant="h6">Update Progress for: {goal?.description}</Typography>
                {operationError && <Alert severity="error">{operationError}</Alert>}
                <Slider
                    value={progress}
                    onChange={(e, val) => setProgress(val)}
                    aria-labelledby="input-slider"
                    valueLabelDisplay="auto"
                />
                <TextField
                    label="Describe the progress you made"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Button onClick={handleSubmit} variant="contained" disabled={operationLoading}>
                    {operationLoading ? <CircularProgress size={24} /> : "Update"}
                </Button>
            </Box>
        </Modal>
    );
};

export default UpdateProgressModal; 