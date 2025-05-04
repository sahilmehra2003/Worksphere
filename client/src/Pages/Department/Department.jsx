import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FlexBetween from "../../components/FlexBetween";
import DeleteDepartmentCard from "../../components/DeleteCard";
import AddDepartmentForm from "../../components/DepartmentForm";
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
  Backdrop,
} from "@mui/material";
import { NavLink } from "react-router-dom";

const DepartmentSlider = () => {
  const theme = useTheme();
  const [departments, setDepartments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteCard, setShowDeleteCard] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [departmentCreated, setDepartmentCreated] = useState(false); // To track if department was successfully created

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:4000/departmentData/departments");
      if (!response.data || response.data.length === 0) {
        throw new Error("No departments available.");
      }
      setDepartments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
 
  const handleDepartmentDeleted = () => {
    fetchDepartments();
  };
  function handleFormSubmit(){
     fetchDepartments()
  }
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? departments.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === departments.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDeleteCard = () => {
    setShowDeleteCard(true);
  };

  const handleCloseDeleteCard = () => {
    setShowDeleteCard(false);
  };

  const handleAddDepartment = () => {
    setShowForm(true); // Show the form when "Add Department" is clicked
  };

  const handleCloseForm = () => {
    setShowForm(false); // Close the form once the department is added
    setDepartmentCreated(true); // Set the department as created successfully
  };

  if (loading) {
    return <Typography>Loading departments...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  const currentDepartment = departments[currentIndex];
  const profitOrLoss =
    currentDepartment.revenueGenerated - currentDepartment.budgetAllocated;

  return (
    <Box>
      {showDeleteCard && (
        <Backdrop
          open={showDeleteCard}
          sx={{
            zIndex: theme.zIndex.modal,
            backdropFilter: "blur(5px)",
          }}
        >
          <DeleteDepartmentCard
            showCard={showDeleteCard}
            setShow={setShowDeleteCard}
            departmentId={currentDepartment._id}
            onClose={handleCloseDeleteCard}
            onDepartmentDeleted={handleDepartmentDeleted}
          />
        </Backdrop>
      )}
      
      {/* Conditional rendering: Show form only when showForm is true */}
      {showForm ? (
        <AddDepartmentForm onClose={handleCloseForm} onDepartmentAdded={handleFormSubmit} />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: theme.palette.background.default,
            padding: theme.spacing(4),
            borderRadius: theme.spacing(2),
            border: `1px solid ${theme.palette.primary.main}`,
            boxShadow: theme.shadows[3],
            transition: "opacity 0.3s",
            filter: showDeleteCard ? "blur(4px)" : "none",
          }}
        >
          {/* Navigation */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "80%",
              marginBottom: theme.spacing(2),
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrevious}
              startIcon={<ArrowBackIosIcon />}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIosIcon />}
            >
              Next
            </Button>
          </Box>

          {/* Department Content */}
          <Box
            sx={{
              textAlign: "center",
              marginBottom: theme.spacing(4),
              width: "100%",
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: "bold", color: "orangered" }}>
              {currentDepartment.name || "No department name"}
            </Typography>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="subtitle1" color="textSecondary">
                  Head: {currentDepartment.departmentHead?.name || "N/A"} | Total Strength:{" "}
                  {currentDepartment.totalMembers || "N/A"}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1" color="textSecondary">
                  Rating: {currentDepartment.avgRating || "N/A"} | Profit/Loss:{" "}
                  <Typography
                    component="span"
                    sx={{
                      color: profitOrLoss >= 0 ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {profitOrLoss >= 0 ? "+" : ""}
                    {profitOrLoss}
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Department Details */}
          <Divider sx={{ marginBottom: theme.spacing(4) }} />
          <Box sx={{ width: "100%" }}>
            <TableContainer>
              <Table sx={{ border: `1px solid ${theme.palette.divider}` }}>
                {/* Table Header */}
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      Category
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      Details
                    </TableCell>
                  </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                  <TableRow>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      Employees
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <NavLink
                        to={`/app/employees?departmentId=${currentDepartment._id}`}
                        style={{
                          color: theme.palette.primary.main,
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        View Employees
                      </NavLink>
                    </TableCell>
                  </TableRow>
                  {/* Other rows */}
                  {[{
                    category: "Current Projects",
                    data: currentDepartment.currentProjects?.map((proj) => proj.name) || ["No current projects"],
                  }, {
                    category: "Clients Allocated",
                    data: currentDepartment.clientsAllocated?.map((client) => client.name) || ["No clients allocated"],
                  }].map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontWeight: "bold",
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {row.category}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {row.data.length > 0 ? (
                          row.data.map((item, idx) => (
                            <Typography key={idx} variant="body2">
                              {item}
                            </Typography>
                          ))
                        ) : (
                          <Typography color="textSecondary">No data available</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <FlexBetween>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              style={{ marginTop: "20px", marginRight: "10px", marginLeft: "10px" }}
              onClick={handleAddDepartment}
            >
              Add Department
            </Button>
            <Button
              variant="contained"
              sx={{ color: "red" }}
              startIcon={<DeleteIcon />}
              style={{ marginTop: "20px", marginRight: "10px" }}
              onClick={handleDeleteCard}
            >
              Delete Department
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<EditIcon />}
              style={{ marginTop: "20px" }}
            >
              Edit Department
            </Button>
          </FlexBetween>
        </Box>
      )}
    </Box>
  );
};

export default DepartmentSlider;

