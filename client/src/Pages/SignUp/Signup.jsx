import React, { useState } from "react";
import { Box, Grid, TextField, Typography, Button, MenuItem, Paper } from "@mui/material";
import signupImage from '../../assets/signupForm.jpg'
import toast from "react-hot-toast";
const Signup = () => {
  const URL="http://localhost:4000/auth/signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    position: "",
    role: "Admin",
    city: "",
    state: "",
    country: "",
  });
  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit =async (event) => {
    event.preventDefault();
    try {
      const response=await fetch(URL,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(formData),
      })
      console.log(response)
      if (response.ok) {
        toast.success("User Registered successfully!")
        setFormData({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          position: "",
          role: "Admin",
          city: "",
          state: "",
          country: "",
        })
      }else{
        toast.error("User registeration fail")
      }
    } catch (error) {
       console.log("Signup Error",error);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "inherit" }}>
      <Paper elevation={3} sx={{ maxWidth: 1000, width: "100%", overflow: "hidden", padding: 2 }}>
        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={6} sx={{ padding: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }}>
              Signup
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* First Column */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    variant="outlined"
                    fullWidth
                    required
                    name="name"
                    value={formData.name}
                    onChange={changeHandler}
                    placeholder="Enter your full name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    variant="outlined"
                    fullWidth
                    required
                    name="email"
                    value={formData.email}
                    onChange={changeHandler}
                    placeholder="Enter your email address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={changeHandler}
                    placeholder="Enter your password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    required
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={changeHandler}
                    placeholder="Enter your phone number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Position"
                    variant="outlined"
                    fullWidth
                    required
                    name="position"
                    value={formData.position}
                    onChange={changeHandler}
                    placeholder="Enter your position"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Role"
                    variant="outlined"
                    fullWidth
                    required
                    name="role"
                    select
                    value={formData.role}
                    onChange={changeHandler}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    variant="outlined"
                    fullWidth
                    required
                    name="city"
                    value={formData.city}
                    onChange={changeHandler}
                    placeholder="Enter your city"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State"
                    variant="outlined"
                    fullWidth
                    required
                    name="state"
                    value={formData.state}
                    onChange={changeHandler}
                    placeholder="Enter your state"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Country"
                    variant="outlined"
                    fullWidth
                    required
                    name="country"
                    value={formData.country}
                    onChange={changeHandler}
                    placeholder="Enter your country"
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 3, padding: 1.5 }}>
                Sign Up
              </Button>
            </form>
          </Grid>

          {/* Image Section */}
          <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 2 }}>
            <img
              loading="eager"
              src={signupImage}
              alt="Signup Visual"
              style={{
                width: "80%",
                height: "auto",
                maxWidth: "400px",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Signup;
