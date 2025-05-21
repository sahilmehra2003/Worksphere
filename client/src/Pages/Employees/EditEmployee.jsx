// EditEmployeeModal.jsx
import React, { useEffect } from "react";
import PropTypes from 'prop-types';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Typography,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid2
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { updateEmployeeProfile, clearEmployeeError } from '../../redux/Slices/employeeSlice'; // Adjust path
import { fetchAllDepartments } from "../../redux/Slices/departmentSlice"; // Adjust path

// Zod Schema (can be same as AddEmployeeForm or slightly different if needed for updates)
const employeeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"), // Usually email is not editable
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Too long"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    department: z.string().min(1, "Department is required"),
    position: z.string().min(1, "Position is required"),
    role: z.enum(["Employee", "TeamHead", "DepartmentHead"]),
    employmentStatus: z.enum(["working", "resigned", "on_leave", "terminated"]), // Added more statuses
});


const EditEmployee = ({ open, onClose, employeeData, onSuccess }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { departments, loading: deptsLoading, error: deptsError } = useSelector((state) => state.department);
    const { loading: employeeOpLoading, error: employeeOpError } = useSelector((state) => state.employee);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid, isDirty },
    } = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: { // Will be overridden by reset in useEffect
            name: '',
            email: '',
            phoneNumber: '',
            city: '',
            state: '',
            country: '',
            department: '',
            position: '',
            role: 'Employee',
            employmentStatus: 'working',
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (open) {
            dispatch(fetchAllDepartments());
            if (employeeData) {
                reset({
                    name: employeeData.name || "",
                    email: employeeData.email || "", // Email might be non-editable
                    phoneNumber: employeeData.phoneNumber || "",
                    city: employeeData.city || "",
                    state: employeeData.state || "",
                    country: employeeData.country || "",
                    department: employeeData.department?._id || employeeData.department || "", // Handle populated or ID
                    position: employeeData.position || "",
                    role: employeeData.role || "Employee",
                    employmentStatus: employeeData.employmentStatus || "working",
                });
            }
            dispatch(clearEmployeeError()); // Clear previous errors
        }
    }, [open, employeeData, reset, dispatch]);

    useEffect(() => {
        if (employeeOpError) {
            toast.error(employeeOpError);
            dispatch(clearEmployeeError());
        }
    }, [employeeOpError, dispatch]);


    const onSubmit = async (data) => {
        if (!employeeData?._id) {
            toast.error("No employee selected for update.");
            return;
        }
        // The email field is usually not part of the update payload from the form
        // if it's non-editable. The backend should identify user by ID.
        const { email, ...updatePayload } = data; // Exclude email if not editable

        try {
            await dispatch(updateEmployeeProfile({ employeeId: employeeData._id, updatedData: updatePayload })).unwrap();
            toast.success("Employee profile updated successfully!");
            onSuccess(); // Callback to parent (e.g., re-fetch employees)
            onClose(); // Close modal
        } catch (error) {
            // Error handled by useEffect
            console.error("Error updating employee:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                Edit Employee Details
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
                        <Grid2 container spacing={2}>
                            {/* Name */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                    )}
                                />
                            </Grid2>
                            {/* Email (Typically non-editable) */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Email" type="email" fullWidth disabled error={!!errors.email} helperText={errors.email?.message} />
                                    )}
                                />
                            </Grid2>
                            {/* Phone Number */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Phone Number" fullWidth required error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} />
                                    )}
                                />
                            </Grid2>
                            {/* City */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="City" fullWidth required error={!!errors.city} helperText={errors.city?.message} />
                                    )}
                                />
                            </Grid2>
                            {/* State */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="state"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="State" fullWidth required error={!!errors.state} helperText={errors.state?.message} />
                                    )}
                                />
                            </Grid2>
                            {/* Country */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="country"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Country" fullWidth required error={!!errors.country} helperText={errors.country?.message} />
                                    )}
                                />
                            </Grid2>
                            {/* Department */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="department"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth required error={!!errors.department}>
                                            <InputLabel>Department</InputLabel>
                                            <Select {...field} label="Department">
                                                <MenuItem value=""><em>Select Department</em></MenuItem>
                                                {deptsLoading ? (
                                                    <MenuItem disabled><em>Loading...</em></MenuItem>
                                                ) : departments.length > 0 ? (
                                                    departments.map((dept) => (
                                                        <MenuItem key={dept._id} value={dept._id}>
                                                            {dept.name}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled><em>{deptsError ? 'Error loading' : 'No Departments'}</em></MenuItem>
                                                )}
                                            </Select>
                                            {errors.department && <Typography color="error" variant="caption">{errors.department.message}</Typography>}
                                        </FormControl>
                                    )}
                                />
                            </Grid2>
                            {/* Position */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="position"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Position" fullWidth required error={!!errors.position} helperText={errors.position?.message} />
                                    )}
                                />
                            </Grid2>
                            {/* Role */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth required error={!!errors.role}>
                                            <InputLabel>Role</InputLabel>
                                            <Select {...field} label="Role">
                                                <MenuItem value="Employee">Employee</MenuItem>
                                                <MenuItem value="TeamHead">Team Head</MenuItem>
                                                <MenuItem value="DepartmentHead">Department Head</MenuItem>
                                                {/* Add other roles as defined in your schema */}
                                            </Select>
                                            {errors.role && <Typography color="error" variant="caption">{errors.role.message}</Typography>}
                                        </FormControl>
                                    )}
                                />
                            </Grid2>
                            {/* Employment Status */}
                            <Grid2 item xs={12} sm={6}>
                                <Controller
                                    name="employmentStatus"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth required error={!!errors.employmentStatus}>
                                            <InputLabel>Employment Status</InputLabel>
                                            <Select {...field} label="Employment Status">
                                                <MenuItem value="working">Working</MenuItem>
                                                <MenuItem value="resigned">Resigned</MenuItem>
                                                <MenuItem value="on_leave">On Leave</MenuItem>
                                                <MenuItem value="terminated">Terminated</MenuItem>
                                            </Select>
                                            {errors.employmentStatus && <Typography color="error" variant="caption">{errors.employmentStatus.message}</Typography>}
                                        </FormControl>
                                    )}
                                />
                            </Grid2>
                        </Grid2>
                        {employeeOpError && (
                            <Box mt={2}>
                                <Typography color="error" variant="body2" textAlign="center">{employeeOpError}</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={employeeOpLoading || !isDirty || !isValid}
                        startIcon={employeeOpLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        Update Employee
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

EditEmployee.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    employeeData: PropTypes.object.isRequired, // Employee data to edit
    onSuccess: PropTypes.func.isRequired, // Callback for successful update
};

export default EditEmployee;