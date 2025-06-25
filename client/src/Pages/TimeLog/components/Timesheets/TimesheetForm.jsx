import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Typography, Box, Button, Modal, TextField, Grid,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import { fetchMyProjects } from '../../../../redux/Slices/projectSlice';
import { fetchMyTasks } from '../../../../redux/Slices/taskSlice';

const TimeSheetForm = ({ open, onClose, onSubmit, operationLoading }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { projects, loading: projectsLoading } = useSelector((state) => state.project);
    const { tasks, loading: tasksLoading } = useSelector((state) => state.task);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        notes: ''
    });

    // Fetch user's projects when the modal opens
    useEffect(() => {
        if (open && user?._id) {
            dispatch(fetchMyProjects());
        }
    }, [dispatch, open, user]);


    useEffect(() => {
        dispatch(fetchMyTasks());
    }, [dispatch]);


    const handleSave = () => {
        // Simple validation
        if (!formData.projectId || !formData.hours || !formData.date || !formData.notes) {
            alert("Please fill all required fields.");
            return;
        }
        // Ensure hours is a number before submitting
        const dataToSubmit = {
            ...formData,
            hours: parseFloat(formData.hours),
        };
        onSubmit(dataToSubmit);
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setFormData({
                projectId: '', taskId: '',
                date: new Date().toISOString().split('T')[0],
                hours: '', notes: ''
            });
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: { xs: '90%', md: '600px' }, bgcolor: 'background.paper',
                borderRadius: 2, boxShadow: 24, p: 4,
            }}>
                <Typography variant="h4" component="h2" gutterBottom>Add Time Entry</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel>Project</InputLabel>
                            <Select name="projectId" value={formData.projectId} label="Project" onChange={(e) => setFormData({ ...formData, projectId: e.target.value, taskId: '' })}>
                                {projectsLoading ? <MenuItem><em>Loading...</em></MenuItem> :
                                    projects?.length > 0 ?
                                        projects.map((proj) => (
                                            <MenuItem key={proj._id} value={proj._id}>{proj.name}</MenuItem>
                                        )) :
                                        <MenuItem disabled><em>No projects found</em></MenuItem>
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth disabled={tasksLoading}>
                            <InputLabel>Task (Optional)</InputLabel>
                            <Select name="taskId" value={formData.taskId} label="Task (Optional)" onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}>
                                {tasksLoading ? <MenuItem><em>Loading tasks...</em></MenuItem> :
                                    tasks?.length > 0 ?
                                        tasks.map((task) => (
                                            <MenuItem key={task._id} value={task._id}>{task.name}</MenuItem>
                                        )) :
                                        <MenuItem disabled><em>No tasks found</em></MenuItem>
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth required name="date" label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth required name="hours" label="Hours" type="number" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} inputProps={{ step: "0.1", min: "0" }} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth required name="notes" label="Work Description" multiline rows={4} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button variant="outlined" onClick={onClose} disabled={operationLoading}>Cancel</Button>
                        <Button variant="contained" onClick={handleSave} disabled={operationLoading}>
                            {operationLoading ? <CircularProgress size={24} /> : 'Save Entry'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};

TimeSheetForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    operationLoading: PropTypes.bool,
};

export default TimeSheetForm;
