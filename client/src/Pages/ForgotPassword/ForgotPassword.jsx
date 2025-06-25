import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Grid, TextField, Typography, Button, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearAuthError, clearAuthSuccess } from '../../redux/Slices/authSlice';
import { toast } from 'react-hot-toast';
import formImage from '../../assets/form.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();

    // Get auth state from Redux
    const { loading, error, success } = useSelector((state) => state.auth);

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }
        dispatch(forgotPassword({ email }));
    };

    // Handle error messages
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAuthError());
        }
    }, [error, dispatch]);

    // Handle success message
    useEffect(() => {
        if (success) {
            toast.success('Password reset link sent to your email!');
            dispatch(clearAuthSuccess());
            setEmail('');
        }
    }, [success, dispatch]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'inherit',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 1200,
                    width: '100%',
                    height: "100%",
                    minHeight: "600px",
                    overflow: 'hidden',
                    padding: 10,
                }}
            >
                <Grid container spacing={3}>
                    {/* Form Section */}
                    <Grid item xs={12} md={6} sx={{ padding: 4 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 'bold',
                                marginBottom: 2,
                                textAlign: 'center',
                            }}
                        >
                            Forgot Password
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                textAlign: 'center',
                                marginBottom: 4,
                            }}
                        >
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                fullWidth
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your Email Address"
                                sx={{ marginBottom: 4 }}
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                                sx={{ padding: 1.5, marginBottom: 3 }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Remember your password?{' '}
                                    <Link
                                        to="/login"
                                        style={{
                                            textDecoration: 'none',
                                            color: '#1976d2',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Back to Login
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    </Grid>

                    {/* Image Section */}
                    <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 2,
                        }}
                    >
                        <img
                            src={formImage}
                            alt="Forgot Password Visual"
                            loading="eager"
                            style={{
                                width: '90%',
                                height: '100%',
                                maxWidth: '800px',
                                maxHeight: '700px',
                                objectFit: 'cover',
                                borderRadius: '20px',
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ForgotPassword; 