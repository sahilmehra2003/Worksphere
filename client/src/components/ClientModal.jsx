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
    Button,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
    Typography,
    Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createClient, updateClient, clearClientOperationStatus } from '../redux/Slices/clientSlice';
import { fetchAllProjects } from '../redux/Slices/projectSlice';

// Zod Schema for Client Validation
const clientSchema = z.object({
    name: z.string().min(1, 'Client name is required'),
    contactPersonName: z.string().min(1, 'Contact person name is required'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
    location: z.string().min(1, 'Location is required'),
    clientCreationDate: z.date().optional().nullable(),
    clientFinishDate: z.date().optional().nullable(),
    project: z.string().optional(),
    department: z.string().optional(),
    status: z.boolean().optional(),
    paymentAfterCompletion: z.number().positive('Revenue must be a positive number').optional().nullable(),
}).refine(data => !data.clientFinishDate || !data.clientCreationDate || new Date(data.clientFinishDate) >= new Date(data.clientCreationDate), {
    message: "Finish date cannot be before creation date",
    path: ["clientFinishDate"],
});

const ClientModal = ({ open, onClose, client = null }) => {
    const dispatch = useDispatch();
    const { operationLoading, operationError } = useSelector((state) => state.client);
    const { projects } = useSelector((state) => state.project);

    const isEditMode = Boolean(client?._id);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty, isValid },
    } = useForm({
        resolver: zodResolver(clientSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            name: '',
            contactPersonName: '',
            email: '',
            phoneNumber: '',
            location: '',
            clientCreationDate: null,
            clientFinishDate: null,
            project: '',
            department: '',
            status: true,
            paymentAfterCompletion: null,
        },
    });

    useEffect(() => {
        if (open) {
            dispatch(fetchAllProjects());
            dispatch(clearClientOperationStatus());
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (open) {
            if (isEditMode && client) {
                reset({
                    name: client.name || '',
                    contactPersonName: client.contactPersonName || '',
                    email: client.email || '',
                    phoneNumber: client.phoneNumber || '',
                    location: client.location || '',
                    clientCreationDate: client.clientCreationDate && !isNaN(new Date(client.clientCreationDate)) ? new Date(client.clientCreationDate) : null,
                    clientFinishDate: client.clientFinishDate && !isNaN(new Date(client.clientFinishDate)) ? new Date(client.clientFinishDate) : null,
                    project: (typeof client.project === 'object' && client.project !== null) ? client.project._id : (client.project ?? ''),
                    department: (typeof client.department === 'object' && client.department !== null) ? client.department._id : (client.department ?? ''),
                    status: client.status !== undefined ? client.status : true,
                    paymentAfterCompletion: client.paymentAfterCompletion || null,
                });
            } else {
                reset({
                    name: '',
                    contactPersonName: '',
                    email: '',
                    phoneNumber: '',
                    location: '',
                    clientCreationDate: new Date(),
                    clientFinishDate: null,
                    project: '',
                    department: '',
                    status: true,
                    paymentAfterCompletion: null,
                });
            }
        }
    }, [open, client, isEditMode, reset]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            clientCreationDate: data.clientCreationDate ? new Date(data.clientCreationDate).toISOString() : null,
            clientFinishDate: data.clientFinishDate ? new Date(data.clientFinishDate).toISOString() : null,
            paymentAfterCompletion: data.paymentAfterCompletion ? Number(data.paymentAfterCompletion) : null,
        };

        if (!payload.project) delete payload.project;
        if (!payload.department) delete payload.department;

        try {
            if (isEditMode) {
                await dispatch(updateClient({ clientId: client._id, updatedData: payload })).unwrap();
            } else {
                await dispatch(createClient(payload)).unwrap();
            }
            handleModalClose();
        } catch (err) {
            console.error("ClientModal onSubmit error:", err);
        }
    };

    const handleModalClose = () => {
        reset();
        onClose();
    };

    console.log('isDirty:', isDirty, 'isValid:', isValid, 'errors:', errors);

    return (
        <Dialog open={open} onClose={handleModalClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {isEditMode ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Client Name*" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="contactPersonName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Contact Person Name*" fullWidth error={Boolean(errors.contactPersonName)} helperText={errors.contactPersonName?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Email Address*" type="email" fullWidth error={Boolean(errors.email)} helperText={errors.email?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Phone Number*" fullWidth error={Boolean(errors.phoneNumber)} helperText={errors.phoneNumber?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Location Address*" fullWidth error={Boolean(errors.location)} helperText={errors.location?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="clientCreationDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Client Creation Date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            slotProps={{ textField: { fullWidth: true, error: Boolean(errors.clientCreationDate), helperText: errors.clientCreationDate?.message } }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="clientFinishDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Client Finish Date (Optional)"
                                            value={field.value}
                                            onChange={field.onChange}
                                            minDate={watch('clientCreationDate')}
                                            slotProps={{ textField: { fullWidth: true, error: Boolean(errors.clientFinishDate), helperText: errors.clientFinishDate?.message } }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="project"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            label="Associated Project (Optional)"
                                            fullWidth
                                            error={Boolean(errors.project)}
                                            helperText={errors.project?.message}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {projects?.map((proj) => (
                                                <MenuItem key={proj._id} value={proj._id}>
                                                    {proj.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="paymentAfterCompletion"
                                    control={control}
                                    render={({ field: { onChange, value, ...restField } }) => (
                                        <TextField
                                            {...restField}
                                            value={value ?? ''}
                                            onChange={(e) => {
                                                const numValue = e.target.value === '' ? null : parseFloat(e.target.value);
                                                onChange(isNaN(numValue) ? value : numValue);
                                            }}
                                            type="number"
                                            label="Revenue Generated (Optional)"
                                            fullWidth
                                            error={Boolean(errors.paymentAfterCompletion)}
                                            helperText={errors.paymentAfterCompletion?.message}
                                            inputProps={{ min: 0 }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            variant='outlined'
                                            select
                                            label="Client Status"
                                            value={field.value ? 'true' : 'false'}
                                            onChange={(e) => field.onChange(e.target.value === 'true')}
                                            fullWidth
                                            error={Boolean(errors.status)}
                                            helperText={errors.status?.message}
                                        >
                                            <MenuItem value="true">Active</MenuItem>
                                            <MenuItem value="false">Inactive</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {operationError && (
                            <Box mt={2}>
                                <Typography color="error" variant="body2" textAlign="center">{operationError}</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleModalClose} color="inherit">Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={operationLoading || !isDirty || !isValid}
                        startIcon={operationLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEditMode ? 'Update Client' : 'Create Client'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

ClientModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    client: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        contactPersonName: PropTypes.string,
        email: PropTypes.string,
        phoneNumber: PropTypes.string,
        location: PropTypes.string,
        clientCreationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        clientFinishDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        project: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
            PropTypes.oneOf([null]),
            PropTypes.oneOf([undefined])
        ]),
        department: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
            PropTypes.oneOf([null]),
            PropTypes.oneOf([undefined])
        ]),
        status: PropTypes.bool,
        paymentAfterCompletion: PropTypes.number,
    }),
};

export default ClientModal;