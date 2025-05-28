import PropTypes from 'prop-types';
import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    CircularProgress
} from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const CreateTeamModal = ({ open, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        teamName: '',
        description: '',
        teamHead: '',
        workingOnProject: false,
        isInternalProject: false,
        projectId: '',
        clientId: ''
    });

    const { employees, projects, clients } = useSelector((state) => ({
        employees: state.employee.employees,
        projects: state.project.projects,
        clients: state.client.clients
    }));

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (!formData.teamName || !formData.description || !formData.teamHead) {
                toast.error('Please fill all required fields');
                return;
            }

            if (formData.workingOnProject && !formData.projectId) {
                toast.error('Please select a project');
                return;
            }

            if (formData.workingOnProject && !formData.isInternalProject && !formData.clientId) {
                toast.error('Please select a client');
                return;
            }

            await onSubmit(formData);
            setFormData({
                teamName: '',
                description: '',
                teamHead: '',
                workingOnProject: false,
                isInternalProject: false,
                projectId: '',
                clientId: ''
            });
        } catch (error) {
            toast.error('Please fill all required fields correctly');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        name="teamName"
                        label="Team Name"
                        value={formData.teamName}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <TextField
                        name="description"
                        label="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        fullWidth
                        multiline
                        rows={3}
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Team Head</InputLabel>
                        <Select
                            name="teamHead"
                            value={formData.teamHead}
                            onChange={handleChange}
                            label="Team Head"
                        >
                            {employees?.map(employee => (
                                <MenuItem key={employee._id} value={employee._id}>
                                    {employee.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                                name="workingOnProject"
                                checked={formData.workingOnProject}
                                onChange={handleChange}
                            />
                        }
                        label="Working on Project"
                    />

                    {formData.workingOnProject && (
                        <>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="isInternalProject"
                                        checked={formData.isInternalProject}
                                        onChange={handleChange}
                                    />
                                }
                                label="Internal Project"
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Project</InputLabel>
                                <Select
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleChange}
                                    label="Project"
                                >
                                    {projects?.map(project => (
                                        <MenuItem key={project._id} value={project._id}>
                                            {project.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {!formData.isInternalProject && (
                                <FormControl fullWidth required>
                                    <InputLabel>Client</InputLabel>
                                    <Select
                                        name="clientId"
                                        value={formData.clientId}
                                        onChange={handleChange}
                                        label="Client"
                                    >
                                        {clients?.map(client => (
                                            <MenuItem key={client._id} value={client._id}>
                                                {client.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    Create Team
                </Button>
            </DialogActions>
        </Dialog>
    );
};

CreateTeamModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};

export default CreateTeamModal; 