
import {useEffect} from "react";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import { useForm, Controller } from 'react-hook-form'; // Using react-hook-form
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { createEmployee, clearEmployeeError } from '../../redux/Slices/employeeSlice'; // Adjust path
import { fetchAllDepartments } from "../../redux/Slices/departmentSlice"; // Assuming you have this

// Zod Schema for Employee Validation
const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Too long"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  department: z.string().min(1, "Department is required"), // Assuming department ID
  position: z.string().min(1, "Position is required"),
  role: z.enum(["Employee", "TeamHead", "DepartmentHead"], { required_error: "Role is required" }),
  employmentStatus: z.enum(["working", "resigned"], { required_error: "Status is required" }), // Changed 'status' to 'employmentStatus' to match slice
});

const AddEmployeeForm = ({ onClose, onEmployeeAdded }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { departments, loading: deptsLoading, error: deptsError } = useSelector((state) => state.department); // Assuming a department slice
  const { loading: employeeOpLoading, error: employeeOpError } = useSelector((state) => state.employee);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      city: "",
      state: "",
      country: "",
      department: "",
      position: "",
      role: "Employee",
      employmentStatus: "working",
    },
    mode: "onChange", // Validate on change for better UX
  });

  useEffect(() => {
    dispatch(fetchAllDepartments()); // Fetch departments for the dropdown
  }, [dispatch]);

  useEffect(() => {
    if (employeeOpError) {
      toast.error(employeeOpError);
      dispatch(clearEmployeeError()); // Clear error after showing
    }
  }, [employeeOpError, dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(createEmployee(data)).unwrap(); // Use unwrap to catch rejections
      toast.success("Employee added successfully!");
      onEmployeeAdded(); // This should trigger re-fetch in parent
      onClose(); // Close modal
      reset(); // Reset form
    } catch (error) {
      // Error is already set in Redux state and handled by the useEffect above
      console.error("Error adding employee:", error);
      // toast.error("Failed to add employee."); // Redundant if using Redux error state for toast
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
        textAlign="center"
      >
        Add New Employee
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} sx={{ gridColumn: "1 / 2" }} />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Email" type="email" fullWidth required error={!!errors.email} helperText={errors.email?.message} sx={{ gridColumn: "2 / 3" }} />
          )}
        />
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Phone Number" fullWidth required error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} sx={{ gridColumn: "1 / 2" }} />
          )}
        />
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="City" fullWidth required error={!!errors.city} helperText={errors.city?.message} sx={{ gridColumn: "2 / 3" }} />
          )}
        />
        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="State" fullWidth required error={!!errors.state} helperText={errors.state?.message} sx={{ gridColumn: "1 / 2" }} />
          )}
        />
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Country" fullWidth required error={!!errors.country} helperText={errors.country?.message} sx={{ gridColumn: "2 / 3" }} />
          )}
        />
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.department} sx={{ gridColumn: "1 / 2" }}>
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
        <Controller
          name="position"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Position" fullWidth required error={!!errors.position} helperText={errors.position?.message} sx={{ gridColumn: "2 / 3" }} />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.role} sx={{ gridColumn: "1 / 2" }}>
              <InputLabel>Role</InputLabel>
              <Select {...field} label="Role">
                <MenuItem value="Employee">Employee</MenuItem>
                <MenuItem value="TeamHead">Team Head</MenuItem>
                <MenuItem value="DepartmentHead">Department Head</MenuItem>
                {/* Add other roles as needed, ensure they match Zod schema */}
              </Select>
              {errors.role && <Typography color="error" variant="caption">{errors.role.message}</Typography>}
            </FormControl>
          )}
        />
        <Controller
          name="employmentStatus" // Changed from 'status' to 'employmentStatus'
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.employmentStatus} sx={{ gridColumn: "2 / 3" }}>
              <InputLabel>Status</InputLabel>
              <Select {...field} label="Status">
                <MenuItem value="working">Working</MenuItem>
                <MenuItem value="resigned">Resigned</MenuItem>
                {/* Add other statuses if needed, ensure they match Zod schema */}
              </Select>
              {errors.employmentStatus && <Typography color="error" variant="caption">{errors.employmentStatus.message}</Typography>}
            </FormControl>
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={employeeOpLoading || !isDirty || !isValid}
          startIcon={employeeOpLoading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ mt: 2, gridColumn: "1 / 3" }}
        >
          Add Employee
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={onClose}
          sx={{ mt: 1, gridColumn: "1 / 3" }}
          disabled={employeeOpLoading}
        >
          Cancel
        </Button>
      </form>
    </Box>
  );
};

AddEmployeeForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onEmployeeAdded: PropTypes.func.isRequired, // Callback to re-fetch or update parent list
};

export default AddEmployeeForm;