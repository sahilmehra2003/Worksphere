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

const AddDepartmentForm = ({ onClose, onDepartmentAdded }) => {
  const theme = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    budgetAllocated: "",
    status: "active",
    averageRating: "",
    revenueGenerated: "",
    employees: [], // Employees assigned to the department
  });

  // Fetch employees from backend (those who don't belong to any department)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:4000/employeeInfo/employees");
        const filteredEmployees = response.data.filter((employee) => employee.department === null);
        setEmployees(filteredEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle multi-select for employees
  const handleEmployeeChange = (e) => {
    setFormData({ ...formData, employees: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData)
    try {
      const response = await axios.post("http://localhost:4000/departmentData/departments/create", formData, {
        headers: { "Content-Type": "application/json" },
      });
      // console.log(response);
      toast.success("Department added successfully!");
      onClose();
      onDepartmentAdded();
      setFormData({
        name: "",
        budgetAllocated: "",
        status: "active",
        averageRating: "",
        revenueGenerated: "",
        employees: [],
      });
    } catch (error) {
      console.error("Error adding department:", error);
      toast.error("Failed to add department.");
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
        Add New Department
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Department Name */}
        <TextField
          label="Department Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{ gridColumn: "1 / 2" }}
        />

        {/* Budget Allocated */}
        <TextField
          label="Budget Allocated"
          name="budgetAllocated"
          value={formData.budgetAllocated}
          onChange={handleChange}
          type="number"
          fullWidth
          margin="normal"
          required
          sx={{ gridColumn: "2 / 3" }}
        />

        {/* Status */}
        <FormControl fullWidth margin="normal" required sx={{ gridColumn: "1 / 2" }}>
          <InputLabel>Status</InputLabel>
          <Select name="status" value={formData.status} onChange={handleChange}>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        {/* Average Rating */}
        <TextField
          label="Average Rating"
          name="averageRating"
          value={formData.averageRating}
          onChange={handleChange}
          type="number"
          step="0.1"
          min="0"
          max="5"
          fullWidth
          margin="normal"
          required
          sx={{ gridColumn: "2 / 3" }}
        />

        {/* Revenue Generated */}
        <TextField
          label="Revenue Generated"
          name="revenueGenerated"
          value={formData.revenueGenerated}
          onChange={handleChange}
          type="number"
          fullWidth
          margin="normal"
          required
          sx={{ gridColumn: "1 / 2" }}
        />

        {/* Employees */}
        <FormControl fullWidth margin="normal" required sx={{ gridColumn: "1 / 2" }}>
          <InputLabel>Employees</InputLabel>
          <Select
            name="employees"
            multiple
            value={formData.employees}
            onChange={handleEmployeeChange}
            renderValue={(selected) => selected.join(", ")}
          >
            {loading ? (
              <MenuItem disabled>
                <em>Loading...</em>
              </MenuItem>
            ) : employees.length > 0 ? (
              employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                <em>No Employees Available</em>
              </MenuItem>
            )}
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
          Add Department
        </Button>
      </form>
    </Box>
  );
};

export default AddDepartmentForm;
