import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Modal,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { clearReviewCycleOperationStatus } from '../../../redux/Slices/reviewCycleSlice';

// eslint-disable-next-line react/prop-types
const CycleFormModal = ({ open, handleClose, cycle, onSave }) => {
    const [formData, setFormData] = useState({});
    const { operationLoading, operationError } = useSelector(state => state.reviewCycle);
    const dispatch = useDispatch();

    useEffect(() => {
        if (cycle) {
            // Format dates for date input fields
            const formatDate = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
            setFormData({
                name: cycle.name || 'Q1',
                year: cycle.year || new Date().getFullYear(),
                description: cycle.description || '',
                startDate: formatDate(cycle.startDate),
                endDate: formatDate(cycle.endDate),
            });
        } else {
            // Default for new cycle
            setFormData({ name: 'Q1', year: new Date().getFullYear(), description: '', startDate: '', endDate: '' });
        }
    }, [cycle]);

    useEffect(() => {
        if (open) dispatch(clearReviewCycleOperationStatus());
    }, [open, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box component="form" onSubmit={handleSubmit} sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>{cycle ? 'Edit' : 'Create'} Review Cycle</Typography>
                {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError}</Alert>}
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Quarter</InputLabel>
                            <Select name="name" value={formData.name || 'Q1'} label="Quarter" onChange={handleChange}>
                                <MenuItem value="Q1">Q1</MenuItem>
                                <MenuItem value="Q2">Q2</MenuItem>
                                <MenuItem value="Q3">Q3</MenuItem>
                                <MenuItem value="Q4">Q4</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField name="year" label="Year" type="number" value={formData.year || ''} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="description" label="Description" value={formData.description || ''} onChange={handleChange} fullWidth multiline rows={2} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField name="startDate" label="Start Date" type="date" value={formData.startDate || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField name="endDate" label="End Date" type="date" value={formData.endDate || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={operationLoading}>
                        {operationLoading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CycleFormModal; 