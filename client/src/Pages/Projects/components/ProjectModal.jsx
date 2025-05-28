/* eslint-disable react/prop-types */
import { useEffect } from 'react'; // Removed useState for formData as react-hook-form handles it
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clearProjectOperationStatus } from '../../../redux/Slices/projectSlice'; // Assuming this is your project slice actions

// Import fetch actions for dropdowns
import { fetchAllClients } from '../../../redux/Slices/clientSlice'; // Adjust path as needed
import { getAllTeams } from '../../../redux/Slices/projectTeamSlice'; // Adjust path as needed
import { fetchAllDepartments } from '../../../redux/Slices/departmentSlice'; // Assuming this exists - Adjust path

// Updated Zod schema
const projectFormSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Description is required'),
    status: z.string().min(1, 'Status is required'),
    priority: z.string().min(1, 'Priority is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional().nullable().default(null), // Ensure default null if empty
    budget: z.preprocess(
        (val) => (String(val).trim() === '' ? NaN : parseFloat(String(val))), // Handle empty string for NaN
        z.number().positive('Budget must be a positive number')
    ),
    clientId: z.string().optional().nullable().default(null),
    departmentId: z.string().optional().nullable().default(null),
    teamId: z.array(z.string()).optional().default([]),
});

const ProjectModal = ({ open, onClose, project, onSubmit, loading: formSubmissionLoading }) => { // Renamed loading to formSubmissionLoading
    const dispatch = useDispatch();
    const { operationError, operationSuccess } = useSelector((state) => state.project);

    // Data for dropdowns from Redux store
    const { clients, loading: clientsLoading } = useSelector((state) => state.client || { clients: [], loading: false });
    const { departments, loading: departmentsLoading } = useSelector((state) => state.department || { departments: [], loading: false });
    const { teams: projectTeams, loading: teamsLoading } = useSelector((state) => state.projectTeam || { teams: [], loading: false });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'In Progress',
            priority: 'medium',
            startDate: new Date().toISOString().split('T')[0],
            endDate: null,
            budget: '',
            clientId: null,
            departmentId: null,
            teamId: [],
        },
    });

    // Fetch data for dropdowns when modal opens, if not already loaded
    useEffect(() => {
        if (open) {
            if (!clients || clients.length === 0) {
                dispatch(fetchAllClients());
            }
            if (!departments || departments.length === 0) {
                dispatch(fetchAllDepartments()); // Ensure this thunk exists and is imported
            }
            if (!projectTeams || projectTeams.length === 0) {
                dispatch(getAllTeams());
            }
        }
    }, [open, clients, departments, projectTeams, dispatch]);


    useEffect(() => {
        if (open) {
            if (project) {
                reset({
                    name: project.name || '',
                    description: project.description || '',
                    status: project.status || 'In Progress',
                    priority: project.priority || 'medium',
                    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : null,
                    budget: project.budget || '',
                    clientId: project.clientId?._id || project.clientId || null,
                    departmentId: project.departmentId?._id || project.departmentId || null,
                    teamId: project.teamId?.map(t => typeof t === 'string' ? t : t._id) || [],
                });
            } else {
                reset({ // Default values for new project
                    name: '',
                    description: '',
                    status: 'In Progress',
                    priority: 'medium',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: null,
                    budget: '',
                    clientId: null,
                    departmentId: null,
                    teamId: [],
                });
            }
        }
    }, [project, open, reset]);

    useEffect(() => {
        if (operationSuccess) {
            onClose();
            dispatch(clearProjectOperationStatus());
        }
    }, [operationSuccess, onClose, dispatch]);

    const handleFormSubmit = (data) => {
        const submissionData = {
            ...data,
            endDate: data.endDate || null, // Ensure empty date is null
            clientId: data.clientId || null, // Ensure empty select is null
            departmentId: data.departmentId || null, // Ensure empty select is null
            teamId: data.teamId || [], // Ensure it's an array
        };
        onSubmit(submissionData);
    };

    const handleCloseDialog = () => {
        onClose();
        dispatch(clearProjectOperationStatus());
    };
    
    const isLoadingDropdowns = clientsLoading || departmentsLoading || teamsLoading;

    return (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
                {project ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} sx={{ pt: 1 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} fullWidth label="Project Name*" error={Boolean(errors.name)} helperText={errors.name?.message} />
                            )}
                        />
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} fullWidth multiline rows={3} label="Description*" error={Boolean(errors.description)} helperText={errors.description?.message} />
                            )}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth type="date" label="Start Date*" InputLabelProps={{ shrink: true }} error={Boolean(errors.startDate)} helperText={errors.startDate?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} error={Boolean(errors.endDate)} helperText={errors.endDate?.message} />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Controller
                            name="budget"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} fullWidth type="number" label="Budget (Amount)*" error={Boolean(errors.budget)} helperText={errors.budget?.message} InputProps={{ inputProps: { min: 0 } }} />
                            )}
                        />
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select fullWidth label="Status*" error={Boolean(errors.status)} helperText={errors.status?.message} >
                                    <MenuItem value="Not Assigned">Not Assigned</MenuItem>
                                    <MenuItem value="In Progress">In Progress</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                    <MenuItem value="Abandoned">Abandoned</MenuItem>
                                    <MenuItem value="On Hold">On Hold</MenuItem>
                                </TextField>
                            )}
                        />
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select fullWidth label="Priority*" error={Boolean(errors.priority)} helperText={errors.priority?.message} >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                </TextField>
                            )}
                        />

                        <FormControl fullWidth error={Boolean(errors.clientId)} disabled={isLoadingDropdowns}>
                            <InputLabel id="client-select-label">Client (Optional)</InputLabel>
                            <Controller
                                name="clientId"
                                control={control}
                                render={({ field }) => (
                                    <Select labelId="client-select-label" label="Client (Optional)" {...field} defaultValue={null}>
                                        <MenuItem value={null}><em>None</em></MenuItem>
                                        {clients?.map((client) => (
                                            <MenuItem key={client._id} value={client._id}>
                                                {client.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.clientId && <Typography color="error" variant="caption">{errors.clientId.message}</Typography>}
                        </FormControl>

                        <FormControl fullWidth error={Boolean(errors.departmentId)} disabled={isLoadingDropdowns}>
                            <InputLabel id="department-select-label">Department (Optional)</InputLabel>
                            <Controller
                                name="departmentId"
                                control={control}
                                render={({ field }) => (
                                    <Select labelId="department-select-label" label="Department (Optional)" {...field} defaultValue={null}>
                                        <MenuItem value={null}><em>None</em></MenuItem>
                                        {departments?.map((dept) => (
                                            <MenuItem key={dept._id} value={dept._id}>
                                                {dept.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.departmentId && <Typography color="error" variant="caption">{errors.departmentId.message}</Typography>}
                        </FormControl>

                        <FormControl fullWidth error={Boolean(errors.teamId)} disabled={isLoadingDropdowns}>
                            <InputLabel id="teams-select-label">Assign Teams (Optional)</InputLabel>
                            <Controller
                                name="teamId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        labelId="teams-select-label"
                                        label="Assign Teams (Optional)"
                                        multiple
                                        {...field}
                                        value={field.value || []}
                                    >
                                        {projectTeams?.map((team) => (
                                            <MenuItem key={team._id} value={team._id}>
                                                {team.teamName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.teamId && <Typography color="error" variant="caption">{errors.teamId.message}</Typography>}
                        </FormControl>

                        {isLoadingDropdowns && <Box sx={{display: 'flex', justifyContent: 'center', my:1}}><CircularProgress size={24} /></Box>}

                        {operationError && (
                            <Box mt={2}>
                                <Typography color="error">{typeof operationError === 'string' ? operationError : JSON.stringify(operationError)}</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={formSubmissionLoading || isLoadingDropdowns || !isDirty}
                        startIcon={formSubmissionLoading ? <CircularProgress size={20} /> : null}
                    >
                        {project ? 'Update Project' : 'Create Project'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};



export default ProjectModal;