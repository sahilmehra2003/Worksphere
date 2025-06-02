// eslint-disable-next-line no-unused-vars
import { useEffect, useState } from 'react';
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
    Button,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-hot-toast'; // Import toast
import { addTimesheetEntry, updateTimesheetEntry } from '../../../redux/Slices/timeSheetSlice';
import { fetchAllProjects } from '../../../redux/Slices/projectSlice';
import { fetchAllClients } from '../../../redux/Slices/clientSlice';
import { fetchAllTasks } from '../../../redux/Slices/taskSlice';

const timesheetEntrySchema = z.object({
    date: z.date({ required_error: "Date is required" }),
    hours: z.number({ required_error: "Hours are required" }).min(0.5, "Minimum 0.5 hours").max(24, "Maximum 24 hours"),
    description: z.string().min(1, 'Description is required'),
    project: z.string().min(1, 'Project is required'), // Project ID
    client: z.string().optional(), // Client ID, will be auto-filled
    task: z.string().optional(),   // Task ID
});

const TimesheetEntryForm = ({ open, onClose, onSuccess, entry = null }) => {
    const dispatch = useDispatch();
    const { operationLoading, operationError } = useSelector((state) => state.timesheet);
    const { projects } = useSelector((state) => state.project); // Expecting projects to have client info
    const { clients } = useSelector((state) => state.client); // Still needed if you want a full client list for some reason or fallback
    const { allTasks } = useSelector((state) => state.task);

    const {
        control,
        handleSubmit,
        reset,
        watch, // Watch for changes in form fields
        setValue, // To programmatically set form field values
        formState: { errors },
    } = useForm({
        resolver: zodResolver(timesheetEntrySchema),
        defaultValues: {
            date: new Date(),
            hours: 8,
            description: '',
            project: '',
            client: '', // Initially empty
            task: '',
        },
    });

    const selectedProjectId = watch('project'); // Watch the 'project' field

    useEffect(() => {
        if (open) {
            dispatch(fetchAllProjects());
            dispatch(fetchAllClients()); // Fetch clients if needed for fallback or direct selection
            dispatch(fetchAllTasks({ page: 1, limit: 100 }));
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (entry) {
            reset({
                date: entry.date && !isNaN(new Date(entry.date)) ? new Date(entry.date) : new Date(),
                hours: entry.hours,
                description: entry.description,
                project: entry.project?._id || entry.project, // Assuming entry.project might be an object or just ID
                client: entry.client?._id || entry.client,     // Assuming entry.client might be an object or just ID
                task: entry.task?._id || entry.task,
            });
        } else {
            // Reset to default when opening for a new entry
            reset({
                date: new Date(),
                hours: 8,
                description: '',
                project: '',
                client: '',
                task: '',
            });
        }
    }, [entry, reset, open]); // Added 'open' to reset form when re-opened for new entry

    // Effect to auto-select client when project changes
    useEffect(() => {
        if (selectedProjectId && projects.length > 0) {
            const project = projects.find(p => p._id === selectedProjectId);
            if (project && project.clientId) {
                // Assuming project.clientId is the ID string or an object with _id
                const clientIdToSet = typeof project.clientId === 'object' ? project.clientId._id : project.clientId;
                setValue('client', clientIdToSet, { shouldValidate: true });
            } else {
                // If project has no client or project not found, clear client field
                setValue('client', '', { shouldValidate: true });
            }
        } else {
            // If no project is selected, clear client field
            setValue('client', '', { shouldValidate: true });
        }
    }, [selectedProjectId, projects, setValue]);

    const onSubmit = async (data) => {
        try {
            const submissionData = { ...data };
            // Convert date to a suitable format if necessary, e.g., ISO string
            // submissionData.date = new Date(data.date).toISOString();

            if (entry) {
                await dispatch(updateTimesheetEntry({ entryId: entry._id, updatedData: submissionData })).unwrap();
            } else {
                await dispatch(addTimesheetEntry(submissionData)).unwrap();
            }
            onSuccess(); // Call this on success
            handleClose(); // Close modal and reset form
        } catch (error) {
            // Error is already handled by extraReducers setting operationError
            // and displayed in the form.
            // Toast can be redundant or provide a summary.
            toast.error(error.message || 'Failed to save timesheet entry.');
            console.error('Failed to save timesheet entry:', error);
        }
    };

    const handleClose = () => {
        reset({ // Reset to initial default values
            date: new Date(),
            hours: 8,
            description: '',
            project: '',
            client: '',
            task: '',
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} pt={1}> {/* Increased gap and padding-top */}
                        <Controller
                            name="date"
                            control={control}
                            defaultValue={new Date()}
                            render={({ field: { onChange, value, ...field } }) => {
                                // Ensure we have a valid date object
                                const dateValue = value ? new Date(value) : new Date();
                                return (
                                    <DatePicker
                                        {...field}
                                        label="Date"
                                        value={dateValue}
                                        onChange={(newValue) => {
                                            onChange(newValue);
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: Boolean(errors.date),
                                                helperText: errors.date?.message,
                                            },
                                        }}
                                    />
                                );
                            }}
                        />

                        <Controller
                            name="hours"
                            control={control}
                            render={({ field: { onChange, value, ...restField } }) => (
                                <TextField
                                    {...restField}
                                    value={value || ''} // Handle potential null/undefined for controlled input
                                    onChange={(e) => {
                                        const numValue = e.target.value === '' ? '' : parseFloat(e.target.value);
                                        onChange(numValue === '' ? '' : (isNaN(numValue) ? value : numValue));
                                    }}
                                    type="number"
                                    label="Hours"
                                    error={Boolean(errors.hours)}
                                    helperText={errors.hours?.message}
                                    inputProps={{ min: 0.5, max: 24, step: 0.1 }} // step 0.1 for finer control
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="project"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Project"
                                    error={Boolean(errors.project)}
                                    helperText={errors.project?.message}
                                    fullWidth
                                    value={typeof field.value === 'object' ? field.value._id : field.value || ''}
                                >
                                    <MenuItem value=""><em>Select a Project</em></MenuItem>
                                    {projects?.map((proj) => (
                                        <MenuItem key={proj._id} value={proj._id}>
                                            {proj.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="client"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Client"
                                    error={Boolean(errors.client)}
                                    helperText={selectedProjectId ? errors.client?.message : "Please select a project first"}
                                    fullWidth
                                    disabled={!selectedProjectId}
                                    value={typeof field.value === 'object' ? field.value._id : field.value || ''}
                                    InputLabelProps={{ shrink: !!selectedProjectId || !!field.value }}
                                >
                                    <MenuItem value="">
                                        <em>{selectedProjectId ? (field.value ? "Selected Client" : "No client for this project") : "Select a project first"}</em>
                                    </MenuItem>
                                    {selectedProjectId && field.value && clients?.find(c => c._id === (typeof field.value === 'object' ? field.value._id : field.value)) && (
                                        <MenuItem key={typeof field.value === 'object' ? field.value._id : field.value} value={typeof field.value === 'object' ? field.value._id : field.value}>
                                            {clients.find(c => c._id === (typeof field.value === 'object' ? field.value._id : field.value))?.name}
                                        </MenuItem>
                                    )}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="task"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Task (Optional)"
                                    error={Boolean(errors.task)}
                                    helperText={errors.task?.message}
                                    fullWidth
                                    value={typeof field.value === 'object' ? field.value._id : field.value || ''}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {allTasks?.map((task) => (
                                        <MenuItem key={task._id} value={task._id}>
                                            {task.title}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    multiline
                                    rows={3}
                                    label="Description"
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                    fullWidth
                                />
                            )}
                        />

                        {operationError && (
                            <Box mt={1}> {/* Adjusted margin */}
                                <Typography color="error" variant="body2">{operationError}</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: '16px 24px' }}> {/* Added padding to actions */}
                    <Button onClick={handleClose} color="inherit">Cancel</Button> {/* Changed color */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={operationLoading}
                        startIcon={operationLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {entry ? 'Update Entry' : 'Add Entry'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

TimesheetEntryForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    entry: PropTypes.shape({
        _id: PropTypes.string,
        date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), // Date can be string or Date object
        hours: PropTypes.number,
        description: PropTypes.string,
        project: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Project can be ID or object
        client: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),   // Client can be ID or object
        task: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),     // Task can be ID or object
    }),
};

export default TimesheetEntryForm;