// EditDepartmentModal.jsx
import React, { useEffect } from "react";
import PropTypes from 'prop-types';
import {
    Box, TextField, MenuItem, Button, Typography, Select, InputLabel,
    FormControl, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, FormHelperText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { updateDepartment, clearDepartmentOperationStatus } from '../../redux/Slices/departmentSlice'; // Adjust path
import { fetchAllEmployeesInternal } from "../../redux/Slices/employeeSlice"; // Adjust path

// Zod Schema (can be same as Add or specific for update)
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
    employees: z.array(z.string()).optional(),
});

const EditDepartmentModal = ({ open, onClose, departmentData, onSuccess }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { employees, loading: employeesLoading } = useSelector((state) => state.employee);
    const { operationLoading, operationError, operationSuccess } = useSelector((state) => state.department);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid, isDirty },
    } = useForm({
        resolver: zodResolver(departmentSchema),
        defaultValues: { // Initial defaults, will be overridden by reset
            name: '',
            budgetAllocated: '',
            status: 'Active',
            averageRating: '',
            revenueGenerated: '',
            employees: [],
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (open) {
            dispatch(fetchAllEmployeesInternal({ page: 1, limit: 1000 })); // Fetch employees
            if (departmentData) {
                reset({
                    name: departmentData.name || "",
                    budgetAllocated: departmentData.budgetAllocated?.toString() || "",
                    status: departmentData.status || "Active", // Make sure this matches one of the enum values
                    averageRating: departmentData.avgRating?.toString() || departmentData.averageRating?.toString() || "",
                    revenueGenerated: departmentData.revenueGenerated?.toString() || "",
                    employees: departmentData.employees?.map(emp => typeof emp === 'object' ? emp._id : emp) || [],
                });
            }
            dispatch(clearDepartmentOperationStatus());
        }
    }, [open, departmentData, reset, dispatch]);

    useEffect(() => {
        if (operationSuccess && open) {
            toast.success("Department updated successfully!");
            if (onSuccess) onSuccess();
            if (onClose) onClose();
            dispatch(clearDepartmentOperationStatus());
        }
        if (operationError && open) {
            toast.error(operationError);
            dispatch(clearDepartmentOperationStatus());
        }
    }, [operationSuccess, operationError, dispatch, onClose, onSuccess, open]);

    const onSubmit = async (data) => {
        if (!departmentData?._id) {
            toast.error("No department selected for update.");
            return;
        }
        const payload = {
            ...data,
            budgetAllocated: data.budgetAllocated ? Number(data.budgetAllocated) : undefined,
            averageRating: data.averageRating ? Number(data.averageRating) : undefined,
            revenueGenerated: data.revenueGenerated ? Number(data.revenueGenerated) : undefined,
            employees: data.employees || [],
        };
        if (payload.employees && payload.employees.length === 0) delete payload.employees;

        console.log("Updating department data:", payload);
        dispatch(updateDepartment({ departmentId: departmentData._id, updatedData: payload }));
    };

    const handleActualClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleActualClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                Edit Department
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}> {/* Name spanning full width */}
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Department Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="budgetAllocated"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Budget Allocated" type="number" fullWidth error={!!errors.budgetAllocated} helperText={errors.budgetAllocated?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="revenueGenerated"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Revenue Generated" type="number" fullWidth error={!!errors.revenueGenerated} helperText={errors.revenueGenerated?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                            </Grid>
                            <Grid item xs={12}> {/* Employees spanning full width */}
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
                                                    return selected.map(id => employees.find(emp => emp._id === id)?.name || id).join(", ");
                                                }}
                                            >
                                                <MenuItem value="" disabled><em>Select Employees</em></MenuItem>
                                                {employeesLoading ? (
                                                    <MenuItem disabled><em>Loading employees...</em></MenuItem>
                                                ) : employees && employees.length > 0 ? (
                                                    employees.map((employee) => (
                                                        <MenuItem key={employee._id} value={employee._id}>
                                                            {employee.name} ({employee.email})
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled><em>No Employees Available</em></MenuItem>
                                                )}
                                            </Select>
                                            {errors.employees && <FormHelperText error>{errors.employees.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        </Grid>
                        {operationError && (
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
                        disabled={operationLoading || !isDirty || !isValid} // Only enable if form is dirty and valid
                        startIcon={operationLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        Update Department
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

EditDepartmentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    departmentData: PropTypes.object.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

export default EditDepartmentModal;