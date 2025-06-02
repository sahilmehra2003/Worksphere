/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  Button,
  Checkbox,
  IconButton,
  CircularProgress,
  Tooltip,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlexBetween from "../../components/FlexBetween";
import AddEmployeeForm from "./AddEmployeeForm";
import EditEmployeeModal from "./EditEmployee";
import {
  fetchAllEmployeesInternal,
  setEmployeeInactive,
  clearEmployeeError,
  searchEmployees,
} from "../../redux/Slices/employeeSlice";
import { fetchAllDepartments } from "../../redux/Slices/departmentSlice";
import { toast } from 'react-hot-toast';

const EmployeeData = () => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    employees,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.employee);
  const { user: authUser } = useSelector((state) => state.auth);
  const { departments } = useSelector((state) => state.department);

  // Local state for MUI TablePagination and modals
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingEmployee, setCurrentEditingEmployee] = useState(null);

  // New state for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    employmentStatus: '',
    workingStatus: '',
  });

  const isAdmin = authUser?.role === 'Admin' || authUser?.role === 'HR';

  // Fetch departments when component mounts
  useEffect(() => {
    dispatch(fetchAllDepartments());
  }, [dispatch]);

  // Fetch employees based on page, rowsPerPage, search, and filters
  useEffect(() => {
    const departmentId = new URLSearchParams(location.search).get("departmentId");
    const searchParams = {
      page: page + 1,
      limit: rowsPerPage,
      search: searchQuery,
      ...filters,
      ...(departmentId ? { department: departmentId } : {}),
    };
    dispatch(searchEmployees(searchParams));
  }, [dispatch, location.search, page, rowsPerPage, searchQuery, filters]);

  // Effect to sync local page with Redux pagination
  useEffect(() => {
    setPage(pagination.currentPage - 1);
  }, [pagination.currentPage]);

  // Effect to display and clear errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearEmployeeError());
    }
  }, [error, dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 4));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = employees.map((n) => n._id);
      setSelectedEmployees(newSelecteds);
      return;
    }
    setSelectedEmployees([]);
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prevSelected) => {
      const selectedIndex = prevSelected.indexOf(employeeId);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(prevSelected, employeeId);
      } else {
        newSelected = prevSelected.filter(id => id !== employeeId);
      }
      return newSelected;
    });
  };

  const handleDeactivateSelected = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee to deactivate.");
      return;
    }
    if (window.confirm(`Are you sure you want to deactivate ${selectedEmployees.length} selected employee(s)? This will mark them as inactive.`)) {
      try {
        for (const employeeId of selectedEmployees) {
          await dispatch(setEmployeeInactive(employeeId)).unwrap();
        }
        toast.success("Selected employees have been deactivated successfully.");
        setSelectedEmployees([]);
        dispatch(searchEmployees({ page: 1, limit: rowsPerPage }));
        setPage(0);
      } catch (err) {
        console.error("Error deactivating employees:", err);
      }
    }
  };

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleOpenEditModal = (employee) => {
    setCurrentEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setCurrentEditingEmployee(null);
    setShowEditModal(false);
  };

  const handleEmployeeOperationSuccess = () => {
    const departmentId = new URLSearchParams(location.search).get("departmentId");
    const searchParams = {
      page: page + 1,
      limit: rowsPerPage,
      search: searchQuery,
      ...filters,
      ...(departmentId ? { department: departmentId } : {}),
    };
    dispatch(searchEmployees(searchParams));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page on new search
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0); // Reset to first page on filter change
  };

  if (loading && employees.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <FlexBetween mb={3}>
        <Typography variant="h3" color={theme.palette.primary.main} fontWeight="bold" align="center">
          {showAddModal ? "Add Employee" : "Employee List"}
        </Typography>
        {isAdmin && !showAddModal && (
          <Button
            sx={{ backgroundColor: theme.palette.primary.main }}
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            Add Employee
          </Button>
        )}
        {isAdmin && showAddModal && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleCloseAddModal}
          >
            Back to List
          </Button>
        )}
      </FlexBetween>

      {isAdmin && showAddModal && (
        <AddEmployeeForm
          onClose={handleCloseAddModal}
          onEmployeeAdded={handleEmployeeOperationSuccess}
        />
      )}

      {isAdmin && showEditModal && currentEditingEmployee && (
        <EditEmployeeModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          employeeData={currentEditingEmployee}
          onSuccess={handleEmployeeOperationSuccess}
        />
      )}

      {!showAddModal && (
        <>
          {/* Search and Filters Section */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search by Name or Email"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  value={filters.position}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="TeamHead">Team Head</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments?.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Employment Status"
                  value={filters.employmentStatus}
                  onChange={(e) => handleFilterChange('employmentStatus', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="working">Working</MenuItem>
                  <MenuItem value="resigned">Resigned</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                  <MenuItem value="pending_approval">Pending Approval</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Working Status"
                  value={filters.workingStatus}
                  onChange={(e) => handleFilterChange('workingStatus', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All Working Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="onLeave">On Leave</MenuItem>
                  <MenuItem value="workFromHome">Work From Home</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {isAdmin && selectedEmployees.length > 0 && (
            <Box mb={2} display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeactivateSelected}
                disabled={loading}
              >
                Deactivate Selected ({selectedEmployees.length})
              </Button>
            </Box>
          )}

          <Paper sx={{ width: '100%', overflowX: "auto" }}>
            <TableContainer component={Paper} elevation={0}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {isAdmin && (
                      <TableCell padding="checkbox" sx={{ backgroundColor: theme.palette.primary.main }}>
                        <Checkbox
                          color={theme.palette.background.default}
                          indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < (employees?.length || 0)}
                          checked={(employees?.length || 0) > 0 && selectedEmployees.length === (employees?.length || 0)}
                          onChange={handleSelectAllClick}
                          inputProps={{ 'aria-label': 'select all employees' }}
                        />
                      </TableCell>
                    )}
                    <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Name</Typography></TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Email</Typography></TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Phone</Typography></TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Role</Typography></TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Department</Typography></TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Employment Status</Typography></TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Working Status</Typography></TableCell>
                    {isAdmin && <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.text.light, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}><Typography variant="h5">Actions</Typography></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && employees.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 9 : 8} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && (!employees || employees.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 9 : 8} align="center">
                        <Typography>No employees found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && employees && employees.map((employee) => (
                    <TableRow
                      key={employee._id}
                      hover
                      onClick={(event) => {
                        if (isAdmin && event.target.type !== 'checkbox' && !event.target.closest('button')) {
                          handleSelectEmployee(employee._id);
                        }
                      }}
                      role="checkbox"
                      aria-checked={selectedEmployees.includes(employee._id)}
                      tabIndex={-1}
                      selected={selectedEmployees.includes(employee._id)}
                    >
                      {isAdmin && (
                        <TableCell padding="checkbox" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                          <Checkbox
                            color={theme.palette.background.default}
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleSelectEmployee(employee._id);
                            }}
                            inputProps={{ 'aria-labelledby': `employee-checkbox-${employee._id}` }}
                          />
                        </TableCell>
                      )}
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }} id={`employee-checkbox-${employee._id}`}><Typography variant="body1">{employee.name}</Typography></TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}><Typography variant="body1">{employee.email}</Typography></TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}><Typography variant="body1">{employee.phoneNumber}</Typography></TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}><Typography variant="body1">{employee.role}</Typography></TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}><Typography variant="body1">{employee.department?.name || "N/A"}</Typography></TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}><Typography variant="body1">{employee.employmentStatus}</Typography></TableCell>
                      <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}><Typography variant="body1">{employee.workingStatus || "N/A"}</Typography></TableCell>
                      {isAdmin && (
                        <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                          <Tooltip title="Edit Employee">
                            <IconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenEditModal(employee);
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination.totalRecords || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default EmployeeData;