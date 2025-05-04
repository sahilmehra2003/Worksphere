import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";

const AddEmployeeForm = ({onClose,onEmployeeAdded}) => {
  const theme = useTheme();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    city: "",
    state: "",
    country: "",
    department: "",
    position: "",
    role: "Employee",
    status:"working",

  });

  // Fetch departments from backend
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:4000/departmentData/departments");
        // console.log(response.data); // Debug API response
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);


  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response=await axios.post("http://localhost:4000/employeeInfo/employees/create", formData,{
        headers:{ "Content-Type": "application/json" } 
      });
      console.log(response)
      toast.success("Employee added successfully!");
      onClose();
      onEmployeeAdded();
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        city: "",
        state: "",
        country: "",
        department: "",
        position: "",
        role: "Employee",
        status:"working"
      });
    } catch (error) {
        
      console.error("Error adding employee:", error);
      toast.error("Failed to add employee.");
      
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        color={theme.palette.primary.main}
        gutterBottom
      >
        Add New Employee
      </Typography>
  <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
  {/* Name */}
  <TextField
    label="Name"
    name="name"
    value={formData.name}
    onChange={handleChange}
    fullWidth
    margin="normal"
    required
    sx={{ gridColumn: "1 / 2" }}
  />

  {/* Email */}
  <TextField
    label="Email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    type="email"
    fullWidth
    margin="normal"
    required
    sx={{ gridColumn: "2 / 3" }}
  />

  {/* Phone Number */}
  <TextField
    label="Phone Number"
    name="phoneNumber"
    value={formData.phoneNumber}
    onChange={handleChange}
    fullWidth
    margin="normal"
    required
    sx={{ gridColumn: "1 / 2" }}
  />

  {/* City */}
  <TextField
    label="City"
    name="city"
    value={formData.city}
    onChange={handleChange}
    fullWidth
    margin="normal"
    required
    sx={{ gridColumn: "2 / 3" }}
  />

  {/* State */}
  <TextField
    label="State"
    name="state"
    value={formData.state}
    onChange={handleChange}
    fullWidth
    margin="normal"
    required
    sx={{ gridColumn: "1 / 2" }}
  />

  {/* Country */}
  <TextField
    label="Country"
    name="country"
    value={formData.country}
    onChange={handleChange}
    fullWidth
    margin="normal"
    required
    sx={{ gridColumn: "2 / 3" }}
  />

  {/* Department */}
  <FormControl fullWidth margin="normal" required sx={{ gridColumn: "1 / 2" }}>
    <InputLabel>Department</InputLabel>
    <Select name="department" value={formData.department} onChange={handleChange}>
      <MenuItem value="">
        <em>Select Department</em>
      </MenuItem>
      {loading ? (
        <MenuItem disabled>
          <em>Loading...</em>
        </MenuItem>
      ) : departments.length > 0 ? (
        departments.map((dept) => (
          <MenuItem key={dept._id} value={dept._id}>
            {dept.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>
          <em>No Departments Available</em>
        </MenuItem>
      )}
    </Select>
  </FormControl>

  {/* Position */}
  <TextField
    label="Position"
    name="position"
    value={formData.position}
    onChange={handleChange}
    fullWidth
    margin="normal"
    required
    sx={{ gridColumn: "2 / 3" }}
  />

  {/* Role */}
  <FormControl fullWidth margin="normal" required sx={{ gridColumn: "1 / 2" }}>
    <InputLabel>Role</InputLabel>
    <Select name="role" value={formData.role} onChange={handleChange}>
      <MenuItem value="Employee">Employee</MenuItem>
      <MenuItem value="TeamHead">Team Head</MenuItem>
      <MenuItem value="DepartmentHead">Department Head</MenuItem>
    </Select>
  </FormControl>

  {/* Status */}
  <FormControl fullWidth margin="normal" required sx={{ gridColumn: "2 / 3" }}>
    <InputLabel>Status</InputLabel>
    <Select name="status" value={formData.status} onChange={handleChange}>
      <MenuItem value="working">Working</MenuItem>
      <MenuItem value="resigned">Resigned</MenuItem>
    </Select>
  </FormControl>

  {/* Submit Button */}
  <Button
    type="submit"
    variant="contained"
    color="primary"
    fullWidth
    sx={{
      mt: 2,
      backgroundColor: theme.palette.primary.main,
      "&:hover": { backgroundColor: theme.palette.primary.dark },
      gridColumn: "1 / 3", 
    }}
  >
    Add Employee
  </Button>
</form>

    </Box>
  );
};

export default AddEmployeeForm;

