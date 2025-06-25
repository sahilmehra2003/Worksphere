import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Typography, Box, Button, Modal, TextField, Grid
} from '@mui/material';

const HalfDayRequestModal = ({ open, onClose, onSubmit, loading = false }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!date) {
            alert('Please select a date');
            return;
        }
        onSubmit({ date, notes });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>Request Half-Day</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>This will send a half-day request to your manager for approval.</Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Reason (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={loading || !date}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};

HalfDayRequestModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

export default HalfDayRequestModal;
