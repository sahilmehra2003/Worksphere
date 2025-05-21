// DepartmentSlider.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from "@mui/material/styles";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FlexBetween from "../../components/FlexBetween";
import AddDepartmentModal from "../../components/DepartmentForm";
import EditDepartmentModal from "./EditDepartmentModal";
import {
  Box,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip
} from "@mui/material";
import { NavLink } from "react-router-dom";
import {
  fetchAllDepartments,
  setCurrentDepartmentByIndex,
  setDepartmentInactive,
  clearDepartmentOperationStatus
} from "../../redux/Slices/departmentSlice"; // Adjust path
import { toast } from "react-hot-toast";

const DepartmentSlider = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const {
    departments,
    currentDepartmentIndex,
    // currentDepartmentDetails is derived: departments[currentDepartmentIndex]
    loading,
    error,
    operationLoading,
    operationError,
    operationSuccess
  } = useSelector((state) => state.department);
  const { user: authUser } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // currentEditingDepartment will be departmentToDisplay when edit modal is opened

  const isAdmin = authUser?.role === 'Admin' || authUser?.role === 'HR'; // Or other appropriate roles

  useEffect(() => {
    dispatch(fetchAllDepartments());
  }, [dispatch]);

  // Effect for general operation toasts (though specific forms might handle their own)
  useEffect(() => {
    if (operationSuccess) {
      // A generic success, specific messages are better in the modal's success handler.
      // toast.success("Department operation successful!");
      dispatch(clearDepartmentOperationStatus());
    }
    if (operationError) {
      // A generic error, specific messages are better in the modal's error handler.
      // toast.error(operationError);
      dispatch(clearDepartmentOperationStatus());
    }
  }, [operationSuccess, operationError, dispatch]);

  const departmentToDisplay = departments && departments.length > 0 && departments[currentDepartmentIndex]
    ? departments[currentDepartmentIndex]
    : null;

  const handlePrevious = () => {
    dispatch(setCurrentDepartmentByIndex(currentDepartmentIndex - 1));
  };

  const handleNext = () => {
    dispatch(setCurrentDepartmentByIndex(currentDepartmentIndex + 1));
  };

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleOpenEditModal = () => { // No need to pass department, it uses departmentToDisplay
    if (departmentToDisplay) {
      setShowEditModal(true);
    } else {
      toast.error("No department selected to edit.");
    }
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleDeactivateDepartment = async () => {
    if (departmentToDisplay && window.confirm(`Are you sure you want to deactivate the "${departmentToDisplay.name}" department? Its status will be set to Inactive.`)) {
      dispatch(setDepartmentInactive(departmentToDisplay._id));
      // Thunks in departmentSlice now handle re-fetching list on success
    }
  };

  const handleOperationCompleted = () => { // Unified callback for modals
    dispatch(fetchAllDepartments()); // Re-fetch all after add/edit
  };


  if (loading && departments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && departments.length === 0) {
    return <Alert severity="error" sx={{ m: 2 }}>Error loading departments: {error}</Alert>;
  }

  if (departments.length === 0 && !loading && !error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h5" gutterBottom>No Departments Found</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
            Add Your First Department
          </Button>
        )}
      </Box>
    );
  }

  if (!departmentToDisplay && !loading && departments.length > 0) {
    // This might happen if index is out of sync briefly, or if departments becomes empty after a delete
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h5" gutterBottom>Please select a department or add one.</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
            Add Department
          </Button>
        )}
      </Box>
    );
  }

  // Ensure departmentToDisplay is not null before trying to access its properties
  const profitOrLoss = departmentToDisplay ?
    (departmentToDisplay.revenueGenerated || 0) - (departmentToDisplay.budgetAllocated || 0) : 0;

  return (
    <Box p={3}>
      {isAdmin && (
        <AddDepartmentModal
          open={showAddModal}
          onClose={handleCloseAddModal}
          onDepartmentAdded={handleOperationCompleted}
        />
      )}

      {isAdmin && departmentToDisplay && ( // Ensure departmentToDisplay exists before rendering Edit Modal
        <EditDepartmentModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          departmentData={departmentToDisplay}
          onSuccess={handleOperationCompleted}
        />
      )}

      {/* Main Department Display Area */}
      {departmentToDisplay ? ( // Only show if a department is selected/available
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: theme.spacing(3),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.default, // Your original style
            border: `1px solid ${theme.palette.primary.main}`, // Your original style
            boxShadow: theme.shadows[3], // Your original style
          }}
        >
          <FlexBetween width="100%" mb={2}>
            <Button
              variant="contained" // Your original style
              color="primary"
              onClick={handlePrevious}
              startIcon={<ArrowBackIosIcon />}
              disabled={departments.length <= 1 || operationLoading}
            >
              Previous
            </Button>
            <Typography variant="h2" sx={{ fontWeight: "bold", color: "orangered", textAlign: 'center', flexGrow: 1 }}>
              {departmentToDisplay.name || "Department Name"}
            </Typography>
            <Button
              variant="contained" // Your original style
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIosIcon />}
              disabled={departments.length <= 1 || operationLoading}
            >
              Next
            </Button>
          </FlexBetween>

          <Grid container justifyContent="space-between" alignItems="center" width="100%" mb={2}>
            <Grid item>
              <Typography variant="subtitle1" color="textSecondary">
                Head: {departmentToDisplay.departmentHead?.name || "N/A"} | Members:{" "}
                {departmentToDisplay.totalMembers || "N/A"}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" color="textSecondary">
                Rating: {departmentToDisplay.avgRating || "N/A"} | Profit/Loss:{" "}
                <Typography
                  component="span"
                  sx={{ color: profitOrLoss >= 0 ? "green" : "red", fontWeight: "bold" }}
                >
                  {profitOrLoss >= 0 ? "+" : ""}{profitOrLoss.toLocaleString()}
                </Typography>
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ width: '100%', mb: 2 }} />

          <Box sx={{ width: "100%" }}>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <Table size="small" >
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", border: `1px solid ${theme.palette.divider}`, color: theme.palette.common.white }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", border: `1px solid ${theme.palette.divider}`, color: theme.palette.common.white }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ textAlign: "center", fontWeight: "bold", border: `1px solid ${theme.palette.divider}` }}>Employees</TableCell>
                    <TableCell sx={{ textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>
                      <NavLink
                        to={`/app/employees?departmentId=${departmentToDisplay._id}`}
                        style={{ color: theme.palette.primary.main, textDecoration: "none", fontWeight: "bold" }}
                      >
                        View Employees ({departmentToDisplay.employees?.length || 0})
                      </NavLink>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ textAlign: "center", fontWeight: "bold", border: `1px solid ${theme.palette.divider}` }}>Projects</TableCell>
                    <TableCell sx={{ textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>
                      {departmentToDisplay.currentProjects?.length > 0
                        ? departmentToDisplay.currentProjects.map((proj) => (typeof proj === 'object' ? proj.name : proj) || 'Unnamed Project').join(', ')
                        : "No current projects"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ textAlign: "center", fontWeight: "bold", border: `1px solid ${theme.palette.divider}` }}>Clients</TableCell>
                    <TableCell sx={{ textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>
                      {departmentToDisplay.clientsAllocated?.length > 0
                        ? departmentToDisplay.clientsAllocated.map((client) => (typeof client === 'object' ? client.name : client) || 'Unnamed Client').join(', ')
                        : "No clients allocated"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ textAlign: "center", fontWeight: "bold", border: `1px solid ${theme.palette.divider}` }}>Status</TableCell>
                    <TableCell sx={{ textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>{departmentToDisplay.status}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {isAdmin && (
            <FlexBetween style={{ marginTop: "20px" }} width="auto" gap={2}> {/* Used FlexBetween and gap */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal} // This opens the Add Modal
                disabled={operationLoading}
              >
                Add Department
              </Button>
              <Button
                variant="contained"
                color="info"
                startIcon={<EditIcon />}
                onClick={handleOpenEditModal} // This opens the Edit Modal
                disabled={operationLoading}
              >
                Edit Department
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: theme.palette.error.main, color: "white", '&:hover': { backgroundColor: theme.palette.error.dark } }} // Your original styling
                startIcon={<DeleteIcon />}
                onClick={handleDeactivateDepartment}
                disabled={operationLoading || departmentToDisplay.status === 'Inactive'}
              >
                Deactivate
              </Button>
            </FlexBetween>
          )}
        </Paper>
      ) : (
        !loading && <Typography>No department to display. Please add one.</Typography> // Message if no department after loading
      )}
    </Box>
  );
};

export default DepartmentSlider;