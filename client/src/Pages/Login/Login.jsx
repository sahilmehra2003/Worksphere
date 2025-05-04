import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { Box, Grid, TextField, Typography, Button, InputAdornment, IconButton, Paper } from '@mui/material';
import formImage from '../../assets/form.jpg';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const URL = "http://localhost:4000/auth/login";
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const loginHandler = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(URL, formData);

      if (response.status === 200) {
        const { token, user } = response.data;
        toast.success("Login successful!");

        // Save token and user details in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Reset form and navigate
        setFormData({
          email: "",
          password: ""
        });
        navigate("/app/dashboard");
      } else {
        toast.error(response.data.message || "Invalid credentials.");
      }
      if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          // console.log("Decoded token", response.data.user);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "An error occurred while logging in. Please try again.");
    }
  };

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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ marginBottom: 2 }}
              />
              <Link
                to="#"
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
                sx={{ padding: 1.5, marginTop: "10px" }}
              >
                Log In
              </Button>
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
