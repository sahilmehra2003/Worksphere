import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { fetchAllEmployeesInternal } from '../../redux/Slices/employeeSlice';
import { createTask } from '../../redux/Slices/taskSlice';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    assignedTo: z.string().min(1, 'Assignee is required'),
    deadlineDate: z.string().optional(),
    priority: z.string().min(1, 'Priority is required'),
});

const AddTask = ({ open, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { employees, loading } = useSelector((state) => state.employee);
    const { operationLoading, operationError } = useSelector((state) => state.task);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            assignedTo: '',
            deadlineDate: '',
            priority: 'Medium',
        },
    });

    useEffect(() => {
        if (open) {
            dispatch(fetchAllEmployeesInternal());
            reset();
        }
    }, [dispatch, open, reset]);

    const onSubmit = async (data) => {
        await dispatch(createTask(data));
        reset();
        onSuccess();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Task</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Title"
                                    error={Boolean(errors.title)}
                                    helperText={errors.title?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Description"
                                    multiline
                                    rows={3}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="assignedTo"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Assign To"
                                    error={Boolean(errors.assignedTo)}
                                    helperText={errors.assignedTo?.message}
                                    fullWidth
                                >
                                    {loading ? (
                                        <MenuItem disabled>Loading...</MenuItem>
                                    ) : (
                                        employees.map((emp) => (
                                            <MenuItem key={emp._id} value={emp._id}>
                                                {emp.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="deadlineDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    label="Deadline"
                                    InputLabelProps={{ shrink: true }}
                                    error={Boolean(errors.deadlineDate)}
                                    helperText={errors.deadlineDate?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Priority"
                                    error={Boolean(errors.priority)}
                                    helperText={errors.priority?.message}
                                    fullWidth
                                >
                                    <MenuItem value="Low">Low</MenuItem>
                                    <MenuItem value="Medium">Medium</MenuItem>
                                    <MenuItem value="High">High</MenuItem>
                                </TextField>
                            )}
                        />
                        {operationError && (
                            <Typography color="error">{operationError}</Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={operationLoading}
                    >
                        {operationLoading ? <CircularProgress size={20} /> : 'Create Task'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

AddTask.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

export default AddTask; 