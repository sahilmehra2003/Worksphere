import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Box, Grid, TextField, Typography, Button, InputAdornment, IconButton, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearAuthError, clearAuthSuccess } from '../../redux/Slices/authSlice';
import { toast } from 'react-hot-toast';
import formImage from '../../assets/form.jpg';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Get auth state from Redux
    const { loading, error, success } = useSelector((state) => state.auth);

    // Handle form input changes
    const changeHandler = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!token) {
            toast.error('Invalid reset link');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        dispatch(resetPassword({ token, passwordData: formData }));
    };

    // Handle error messages
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAuthError());
        }
    }, [error, dispatch]);

    // Handle successful password reset
    useEffect(() => {
        if (success) {
            toast.success('Password reset successfully!');
            dispatch(clearAuthSuccess());
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [success, dispatch, navigate]);

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
                            Reset Password
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                textAlign: 'center',
                                marginBottom: 4,
                            }}
                        >
                            Enter your new password below.
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="New Password"
                                variant="outlined"
                                fullWidth
                                required
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={changeHandler}
                                placeholder="Enter your new password"
                                disabled={loading || success}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                disabled={loading || success}
                                            >
                                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ marginBottom: 3 }}
                            />
                            <TextField
                                label="Confirm New Password"
                                variant="outlined"
                                fullWidth
                                required
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={changeHandler}
                                placeholder="Confirm your new password"
                                disabled={loading || success}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                disabled={loading || success}
                                            >
                                                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ marginBottom: 4 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading || success}
                                sx={{ padding: 1.5, marginBottom: 3 }}
                            >
                                {loading ? 'Resetting...' : success ? 'Password Reset Successfully!' : 'Reset Password'}
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
                            alt="Reset Password Visual"
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

export default ResetPassword; 