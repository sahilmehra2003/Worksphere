// AddDepartmentModal.jsx (Refactored for Redux and as a Modal)
import React, { useEffect } from "react";
import PropTypes from 'prop-types';
import {
  Box, TextField, MenuItem, Button, Typography, Select, InputLabel,
  FormControl, CircularProgress, FormHelperText,
  Dialog, DialogTitle, DialogContent, DialogActions,Grid2
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { createDepartment, clearDepartmentOperationStatus } from '../redux/Slices/departmentSlice'; 
import { fetchAllEmployeesInternal } from "../redux/Slices/employeeSlice"; 

// Zod Schema for Department Validation
const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  budgetAllocated: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
    z.number({ invalid_type_error: "Budget must be a number" }).positive("Budget must be positive").optional().nullable()
  ),
  status: z.enum(["Active", "Inactive"], { required_error: "Status is required" }),
  averageRating: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
    z.number({ invalid_type_error: "Rating must be a number" }).min(0, "Min 0").max(5, "Max 5").optional().nullable()
  ),
  revenueGenerated: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
    z.number({ invalid_type_error: "Revenue must be a number" }).positive("Revenue must be positive").optional().nullable()
  ),
  employees: z.array(z.string()).optional(), // Array of employee IDs
  // departmentHead: z.string().optional(), // If you add this field
});

const AddDepartmentModal = ({ open, onClose, onDepartmentAdded }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  // Assuming employees for dropdown are fetched and stored in employeeSlice
  const { employees, loading: employeesLoading } = useSelector((state) => state.employee);
  const { operationLoading, operationError, operationSuccess } = useSelector((state) => state.department);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      budgetAllocated: "",
      status: "Active",
      averageRating: "",
      revenueGenerated: "",
      employees: [],
    },
    mode: "onChange", // Validate on change
  });

  useEffect(() => {
    if (open) {
      // Fetch employees that can be assigned if not already loaded globally
      // For simplicity, assuming they might need to be fetched or are already available
      if (!employees || employees.length === 0) { // Basic check
        dispatch(fetchAllEmployeesInternal({ page: 1, limit: 1000 })); // Fetch a large list
      }
      dispatch(clearDepartmentOperationStatus()); // Clear previous errors/success on open
    }
  }, [open, dispatch, employees]);

  useEffect(() => {
    if (operationSuccess && open) { // Check 'open' to ensure it's for the current modal instance
      toast.success("Department added successfully!");
      if (onDepartmentAdded) onDepartmentAdded(); // Callback to parent
      reset(); // Reset form
      dispatch(clearDepartmentOperationStatus()); // Reset redux status
      if (onClose) onClose(); // Close the modal
    }
    if (operationError && open) {
      toast.error(operationError); // Display error from Redux
      dispatch(clearDepartmentOperationStatus()); // Reset redux status
    }
  }, [operationSuccess, operationError, dispatch, onClose, onDepartmentAdded, reset, open]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      budgetAllocated: data.budgetAllocated ? Number(data.budgetAllocated) : undefined,
      averageRating: data.averageRating ? Number(data.averageRating) : undefined,
      revenueGenerated: data.revenueGenerated ? Number(data.revenueGenerated) : undefined,
      employees: data.employees || [],
    };
    if (payload.employees && payload.employees.length === 0) {
      delete payload.employees; // Don't send empty array if it's optional and empty
    }
    dispatch(createDepartment(payload));
  };

  const handleActualClose = () => {
    reset(); // Reset form fields on cancel
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleActualClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
        Add New Department
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
            <Grid2 container spacing={2}>
              <Grid2 item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Department Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                  )}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <Controller
                  name="budgetAllocated"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Budget Allocated" type="number" fullWidth error={!!errors.budgetAllocated} helperText={errors.budgetAllocated?.message} />
                  )}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <Controller
                  name="revenueGenerated"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Revenue Generated" type="number" fullWidth error={!!errors.revenueGenerated} helperText={errors.revenueGenerated?.message} />
                  )}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status" displayEmpty>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                      {errors.status && <FormHelperText error>{errors.status.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <Controller
                  name="averageRating"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Average Rating (0-5)"
                      type="number"
                      inputProps={{ step: "0.1", min: "0", max: "5" }}
                      fullWidth
                      error={!!errors.averageRating}
                      helperText={errors.averageRating?.message}
                    />
                  )}
                />
              </Grid2>
              <Grid2 item xs={12}>
                <Controller
                  name="employees"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.employees}>
                      <InputLabel>Assign Employees (Optional)</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Assign Employees (Optional)"
                        renderValue={(selected) => {
                          if (!selected || selected.length === 0) return <em>None selected</em>;
                          return selected.map(id => (employees.find(emp => emp._id === id)?.name) || id).join(", ");
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select Employees</em>
                        </MenuItem>
                        {employeesLoading ? (
                          <MenuItem disabled><em>Loading employees...</em></MenuItem>
                        ) : employees && employees.length > 0 ? (
                          employees.map((employee) => (
                            <MenuItem key={employee._id} value={employee._id}>
                              {employee.name} ({employee.email})
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled><em>No Employees Available to Assign</em></MenuItem>
                        )}
                      </Select>
                      {errors.employees && <FormHelperText error>{errors.employees.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid2>
            </Grid2>
            {operationError && ( // Display error from Redux if form submission fails
              <Box mt={2}>
                <Typography color="error" variant="body2" textAlign="center">{operationError}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleActualClose} color="inherit" disabled={operationLoading}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={operationLoading || !isDirty || !isValid}
            startIcon={operationLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Add Department
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

AddDepartmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDepartmentAdded: PropTypes.func.isRequired,
};

export default AddDepartmentModal;