// EmployeeData.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid2, // Keep Grid if you plan to use it for overall page layout, though Box is used here
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete"; 
import AddIcon from "@mui/icons-material/Add";
import FlexBetween from "../../components/FlexBetween"; 
import AddEmployeeForm from "./AddEmployeeForm";
import EditEmployeeModal from "./EditEmployee"; 
import {
  fetchAllEmployeesInternal,
  setEmployeeInactive,
  clearEmployeeError // To clear errors after displaying them
  // Other actions like setSearchQuery, setSortConfig can be used if you implement search/sort UI
} from "../../redux/Slices/employeeSlice"; // Adjust path
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
    // searchQuery, // For future use with search inputs
    // sortConfig,  // For future use with table sorting
  } = useSelector((state) => state.employee);
  const { user: authUser } = useSelector((state) => state.auth); // For role-based actions

  // Local state for MUI TablePagination (0-indexed) and modals
  const [page, setPage] = useState(0); // Corresponds to pagination.currentPage - 1
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false); // Changed from showAddForm
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingEmployee, setCurrentEditingEmployee] = useState(null);

  const isAdmin = authUser?.role === 'Admin' || authUser?.role === 'HR'; // Example roles

  // Fetch employees based on page, rowsPerPage, and potential filters
  useEffect(() => {
    const departmentId = new URLSearchParams(location.search).get("departmentId");
    const filters = departmentId ? { department: departmentId } : {};
    // Redux pagination is 1-indexed, MUI TablePagination is 0-indexed
    dispatch(fetchAllEmployeesInternal({ page: page + 1, limit: rowsPerPage, filters }));
  }, [dispatch, location.search, page, rowsPerPage]);

  // Effect to sync local page with Redux pagination if it changes externally
  useEffect(() => {
    setPage(pagination.currentPage - 1);
  }, [pagination.currentPage]);

  // Effect to display and clear errors from Redux state
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearEmployeeError()); // Clear the error after showing it
    }
  }, [error, dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
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

      if (selectedIndex === -1) { // Not currently selected
        newSelected = newSelected.concat(prevSelected, employeeId);
      } else { // Currently selected, so deselect
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
        // Dispatch deactivation for all selected employees
        // Consider Promise.all if you want to wait for all to complete
        for (const employeeId of selectedEmployees) {
          await dispatch(setEmployeeInactive(employeeId)).unwrap();
        }
        toast.success("Selected employees have been deactivated successfully.");
        setSelectedEmployees([]); // Clear selection
        // Re-fetch employees to reflect changes
        dispatch(fetchAllEmployeesInternal({ page: 1, limit: rowsPerPage })); // Fetch page 1 or current page
        setPage(0); // Reset to page 0 after deactivation
      } catch (err) {
        // Error is handled by the useEffect listening to 'error' in employeeSlice
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
    // Re-fetch the current page data to reflect additions or updates
    const departmentId = new URLSearchParams(location.search).get("departmentId");
    const filters = departmentId ? { department: departmentId } : {};
    dispatch(fetchAllEmployeesInternal({ page: page + 1, limit: rowsPerPage, filters }));
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
        <Typography variant="h3" color="primary" fontWeight="bold">
          Employee List
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            Add Employee
          </Button>
        )}
      </FlexBetween>

      {isAdmin && showAddModal && (
        <AddEmployeeForm
          onClose={handleCloseAddModal}
          onEmployeeAdded={handleEmployeeOperationSuccess} // Use unified success handler
        />
      )}

      {isAdmin && showEditModal && currentEditingEmployee && (
        <EditEmployeeModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          employeeData={currentEditingEmployee}
          onSuccess={handleEmployeeOperationSuccess} // Use unified success handler
        />
      )}

      {/* Hide table if a full-page form is shown, or integrate forms as modals */}
      {/* Assuming forms are now modals, so table is always potentially visible */}
      <>
        {isAdmin && selectedEmployees.length > 0 && (
          <Box mb={2} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeactivateSelected}
              disabled={loading} // Disable if main list is loading
            >
              Deactivate Selected ({selectedEmployees.length})
            </Button>
          </Box>
        )}
        <Paper sx={{ width: '100%', overflowX: "auto" }}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {isAdmin && (
                    <TableCell padding="checkbox" sx={{ backgroundColor: theme.palette.background.alt }}>
                      <Checkbox
                        indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < (employees?.length || 0)}
                        checked={(employees?.length || 0) > 0 && selectedEmployees.length === (employees?.length || 0)}
                        onChange={handleSelectAllClick}
                        inputProps={{ 'aria-label': 'select all employees' }}
                      />
                    </TableCell>
                  )}
                  <TableCell sx={{ backgroundColor: theme.palette.background.alt, color: theme.palette.text.primary, fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.background.alt, color: theme.palette.text.primary, fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.background.alt, color: theme.palette.text.primary, fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.background.alt, color: theme.palette.text.primary, fontWeight: 'bold' }}>Position</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.background.alt, color: theme.palette.text.primary, fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.background.alt, color: theme.palette.text.primary, fontWeight: 'bold' }}>Status</TableCell>
                  {isAdmin && <TableCell sx={{ backgroundColor: theme.palette.background.alt, color: theme.palette.text.primary, fontWeight: 'bold' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && employees.length > 0 && ( // Show inline loading only if some employees are already displayed
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && (!employees || employees.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} align="center">
                      <Typography>No employees found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && employees && employees.map((employee) => (
                  <TableRow
                    key={employee._id}
                    hover
                    onClick={(event) => { // Allow row click for selection if not clicking checkbox/button
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
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedEmployees.includes(employee._id)}
                          onChange={(event) => {
                            event.stopPropagation(); // Prevent row click from firing
                            handleSelectEmployee(employee._id);
                          }}
                          inputProps={{ 'aria-labelledby': `employee-checkbox-${employee._id}` }}
                        />
                      </TableCell>
                    )}
                    <TableCell id={`employee-checkbox-${employee._id}`}>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phoneNumber}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department?.name || "N/A"}</TableCell>
                    <TableCell>{employee.employmentStatus}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Tooltip title="Edit Employee">
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent row click
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
            count={pagination.totalRecords || 0} // Use totalRecords from backend pagination
            rowsPerPage={rowsPerPage}
            page={page} // Use local page state
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </>
    </Box>
  );
};

export default EmployeeData;