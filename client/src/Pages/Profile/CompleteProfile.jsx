import { useSelector, useDispatch } from 'react-redux';
import { Box, TextField, Button, Typography, Paper, Grid } from '@mui/material';
import { completeProfile } from '../../redux/Slices/authSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

const CompleteProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    console.log("CompleteProfile: Component rendering. User from Redux:", user); // Log user on every render

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        defaultValues: {
            name: '',
            email: '',
            position: '',
            country: '',
            state: '',
            city: '',
            phoneNumber: '',
        }
    });

    useEffect(() => {
        console.log("CompleteProfile: useEffect triggered. Current user in effect:", user); // Log user when effect runs
        if (user && Object.keys(user).length > 0) { // Ensure user is not null and not an empty object
            const formDataToReset = {
                name: user.name || '',
                email: user.email || '',
                position: user.position || '', // Or keep existing form value if user.position is undefined
                country: user.country || '',
                state: user.state || '',
                city: user.city || '',
                phoneNumber: user.phoneNumber || '',
            };
            console.log("CompleteProfile: Calling reset with data:", formDataToReset);
            reset(formDataToReset);
            console.log("CompleteProfile: Form reset called.");
        } else {
            console.log("CompleteProfile: useEffect triggered, but user is null, empty, or undefined. Not resetting form yet.");
        }
    }, [user, reset]); // Dependencies: user and reset

    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const onSubmit = async (data) => {
        console.log("CompleteProfile: Form submitted with data:", data);
        // Ensure email is included if it was disabled but is part of the user object
        const submissionData = {
            ...data,
            email: user?.email || data.email // Prioritize user.email if form field is disabled
        };
        console.log("CompleteProfile: Data being dispatched to completeProfile action:", submissionData);

        const res = await dispatch(completeProfile(submissionData));
        if (res.meta.requestStatus === 'fulfilled' && res.payload.success) {
            toast.success('Profile completed!');
            navigate('/app/dashboard');
        } else {
            toast.error(res.payload?.message || res.payload || 'Profile completion failed');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ padding: 4, maxWidth: 500, width: '100%' }}>
                <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>Complete Your Profile</Typography>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                fullWidth
                                {...register('name', { required: 'Name is required' })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            // InputLabelProps={{ shrink: !!watch('name') }} // Use watch if needed for shrink
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                fullWidth
                                disabled // Email is disabled
                                {...register('email')} // No validation needed if disabled and pre-filled
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            // InputLabelProps={{ shrink: !!watch('email') }}
                            />
                        </Grid>
                        {/* ... other fields ... */}
                        <Grid item xs={12}>
                            <TextField
                                label="Position"
                                fullWidth
                                {...register('position', { required: 'Position is required' })}
                                error={!!errors.position}
                                helperText={errors.position?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Country (2-letter code)"
                                fullWidth
                                {...register('country', {
                                    required: 'Country code is required',
                                    pattern: {
                                        value: /^[A-Z]{2}$/,
                                        message: 'Must be 2 uppercase letters (ISO 3166-1 alpha-2)',
                                    },
                                })}
                                error={!!errors.country}
                                helperText={errors.country?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="State"
                                fullWidth
                                {...register('state', { required: 'State is required' })}
                                error={!!errors.state}
                                helperText={errors.state?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="City"
                                fullWidth
                                {...register('city', { required: 'City is required' })}
                                error={!!errors.city}
                                helperText={errors.city?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Phone Number"
                                fullWidth
                                {...register('phoneNumber', {
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^\d{10}$/,
                                        message: 'Phone number must be 10 digits',
                                    },
                                })}
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" disabled={isSubmitting || loading} variant="contained" color="primary" fullWidth >
                                {isSubmitting || loading ? 'Submitting...' : 'Complete Profile'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default CompleteProfile;