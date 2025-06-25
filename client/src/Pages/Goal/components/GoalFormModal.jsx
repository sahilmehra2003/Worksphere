import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Modal,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';

// eslint-disable-next-line react/prop-types
const GoalFormModal = ({ open, handleClose, onSave }) => {
    const [description, setDescription] = useState('');
    const { operationLoading, operationError, operationSuccess } = useSelector(state => state.goal);

    useEffect(() => {
        if (operationSuccess) handleClose();
    }, [operationSuccess, handleClose]);

    const handleSubmit = () => {
        onSave({ description });
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                <Typography variant="h6">Create New Goal</Typography>
                {operationError && <Alert severity="error">{operationError}</Alert>}
                <TextField
                    label="Goal Description"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Button onClick={handleSubmit} variant="contained" disabled={operationLoading}>
                    {operationLoading ? <CircularProgress size={24} /> : "Save Goal"}
                </Button>
            </Box>
        </Modal>
    );
};

export default GoalFormModal; 