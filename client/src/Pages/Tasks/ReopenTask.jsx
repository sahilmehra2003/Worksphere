import { useState } from 'react';
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
    CircularProgress,
} from '@mui/material';
import { reopenTask } from '../../redux/Slices/taskSlice';

const reopenTaskSchema = z.object({
    newDeadlineDate: z.string().min(1, 'New deadline is required'),
    description: z.string().optional(),
});

const ReopenTask = ({ open, onClose, onSuccess, taskId }) => {
    const dispatch = useDispatch();
    const { operationLoading, operationError } = useSelector((state) => state.task);
    const [minDate] = useState(new Date().toISOString().split('T')[0]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(reopenTaskSchema),
        defaultValues: {
            newDeadlineDate: '',
            description: '',
        },
    });

    const onSubmit = async (data) => {
        await dispatch(reopenTask({ taskId, ...data }));
        reset();
        onSuccess();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reopen Task</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Controller
                            name="newDeadlineDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    label="New Deadline"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: minDate }}
                                    error={Boolean(errors.newDeadlineDate)}
                                    helperText={errors.newDeadlineDate?.message}
                                    fullWidth
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Updated Description (Optional)"
                                    multiline
                                    rows={3}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                    fullWidth
                                />
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
                        {operationLoading ? <CircularProgress size={20} /> : 'Reopen Task'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

ReopenTask.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    taskId: PropTypes.string,
};

export default ReopenTask; 