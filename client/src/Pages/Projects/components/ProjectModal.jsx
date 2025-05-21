/* eslint-disable react/prop-types */
import { useEffect } from 'react';
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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createProject, updateProject, clearProjectOperationStatus } from '../../../redux/Slices/projectSlice';

const projectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Description is required'),
    status: z.string().min(1, 'Status is required'),
    priority: z.string().min(1, 'Priority is required'),
    dueDate: z.string().optional(),
});

const ProjectModal = ({ open, onClose, project }) => {
    const dispatch = useDispatch();
    const { operationLoading, operationError, operationSuccess } = useSelector((state) => state.project);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'active',
            priority: 'medium',
            dueDate: '',
        },
    });

    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                description: project.description,
                status: project.status,
                priority: project.priority,
                dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
            });
        }
    }, [project, reset]);

    useEffect(() => {
        if (operationSuccess) {
            onClose();
            dispatch(clearProjectOperationStatus());
        }
    }, [operationSuccess, onClose, dispatch]);

    const onSubmit = async (data) => {
        if (project) {
            await dispatch(updateProject({ projectId: project._id, updatedData: data }));
        } else {
            await dispatch(createProject(data));
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {project ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Project Name"
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description"
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                />
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    label="Status"
                                    error={Boolean(errors.status)}
                                    helperText={errors.status?.message}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="on hold">On Hold</MenuItem>
                                </TextField>
                            )}
                        />

                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    label="Priority"
                                    error={Boolean(errors.priority)}
                                    helperText={errors.priority?.message}
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                </TextField>
                            )}
                        />

                        <Controller
                            name="dueDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    type="date"
                                    label="Due Date"
                                    InputLabelProps={{ shrink: true }}
                                    error={Boolean(errors.dueDate)}
                                    helperText={errors.dueDate?.message}
                                />
                            )}
                        />
                    </Box>

                    {operationError && (
                        <Box mt={2}>
                            <Typography color="error">{operationError}</Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={operationLoading}
                        startIcon={operationLoading ? <CircularProgress size={20} /> : null}
                    >
                        {project ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProjectModal; 