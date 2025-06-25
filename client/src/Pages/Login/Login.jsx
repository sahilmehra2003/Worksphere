import { useState, useEffect } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { Box, Grid, TextField, Typography, Button, InputAdornment, IconButton, Paper, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../../redux/Slices/authSlice';
import { toast } from 'react-hot-toast';
import formImage from '../../assets/form.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginToastShown, setLoginToastShown] = useState(false);

  // Get auth state from Redux
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Handle form input changes
  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const loginHandler = async (event) => {
    event.preventDefault();
    dispatch(loginUser(formData));
  };

  // Handle Google login (direct redirect)
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URL}/api/v1/auth/google`;
  };

  // Handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated && user && !loginToastShown) {
      toast.success("Login successful!");
      setLoginToastShown(true);
      if (!user.isProfileComplete) {
        navigate("/app/complete-profile");
      } else {
        navigate("/app/client");
      }
    }
  }, [isAuthenticated, user, navigate, loginToastShown]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoginToastShown(false);
    }
  }, [isAuthenticated]);

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
                marginBottom: 6,
                textAlign: 'center',
              }}
            >
              Login
            </Typography>
            <form onSubmit={loginHandler}>
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                required
                name="email"
                value={formData.email}
                onChange={changeHandler}
                placeholder="Enter your Email Address"
                sx={{ marginBottom: 5 }}
                disabled={loading}
              />
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={changeHandler}
                placeholder="Enter your password"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loading}
                      >
                        {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ marginBottom: 2 }}
              />
              <Link
                to="/forgot-password"
                style={{
                  display: 'block',
                  marginBottom: 12,
                  textAlign: 'right',
                  textDecoration: 'none',
                  color: '#1976d2',
                }}
              >
                Forgot Password?
              </Link>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ padding: 1.5, marginBottom: 2 }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>

              <Divider sx={{ my: 2 }}>OR</Divider>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogleLogin}
                disabled={loading}
                sx={{
                  padding: 1.5,
                  backgroundColor: '#fff',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
                startIcon={
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    style={{ width: 20, height: 20 }}
                  />
                }
              >
                Continue with Google
              </Button>

              <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Not registered yet?{' '}
                  <Link
                    to="/signup"
                    style={{
                      textDecoration: 'none',
                      color: '#1976d2',
                      fontWeight: 'bold',

                    }}
                  >
                    Register Here
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
              alt="Login Visual"
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

export default Login;
