import  { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Grid,
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
// import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FlexBetween from "../../components/FlexBetween";
import AddEmployeeForm from "./AddEmployeeForm"; // Import the form component
import {toast} from 'react-hot-toast'
import axiosInstance from "../../utils/apis";
const EmployeeData = () => {
  const theme = useTheme(); 
  const location = useLocation(); 
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false); // Manage form visibility

  useEffect(() => {
    const fetchEmployees = async () => {
      const searchParams = new URLSearchParams(location.search);
      const departmentId = searchParams.get("departmentId");
      // console.log(departmentId);
      try {
        const response = await axiosInstance.get(
          `http://localhost:4000/employeeInfo/employees`,
          {
            params: { departmentId },
          }
        );
        // console.log('Employees:', response.data);
        setEmployees(response.data?.data); // API directly returns the array
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [location.search]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId); // Deselect
      } else {
        return [...prev, employeeId]; // Select
      }
    });
  };


  const handleDeleteEmployee = async () => {
    if (selectedEmployees.length > 0) {
      try {
        // Loop over selected employees and delete each one
        for (const employeeId of selectedEmployees) {
          await axiosInstance.delete(`http://localhost:4000/employeeInfo/employees/delete/${employeeId}`);
          console.log(`Employee with ID ${employeeId} deleted`);
        }
  
        // Filter out deleted employees from the state
        const updatedEmployees = employees.filter(
          (emp) => !selectedEmployees.includes(emp._id)
        );
        setEmployees(updatedEmployees);
        setSelectedEmployees([]);  // Clear selected employees
  
        toast.success("Selected employees have been deleted successfully.");
      } catch (error) {
        console.error("Error deleting employees:", error);
        toast.error("There was an error deleting the employees.");
      }
    } else {
      toast.error("Please select at least one employee to delete.");
    }
  };

  const handleAddEmployee = () => {
    setShowAddForm(true); 
  };

  const handleFormClose = () => {
    setShowAddForm(false); 
  };

  const handleEmployeeAdded = (newEmployee) => {
    setEmployees((prev) => [...prev, newEmployee]); // Add new employee to the list
    setShowAddForm(false); // Hide the form after adding
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error fetching data: {error.message}</Typography>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography
          variant="h2"
          gutterBottom
          sx={{ color: "orange", fontWeight: "bold" }}
          textAlign={"center"}
        >
          Employee List
        </Typography>

        {showAddForm ? (
          <AddEmployeeForm
            onClose={()=>handleFormClose()}
            onEmployeeAdded={handleEmployeeAdded}
          />
        ) : (
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      Select
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      Phone Number
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      Position
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      ProjectTeam
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      Department
                    </TableCell>
                    
                    <TableCell
                      style={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee) => (
                      <TableRow key={employee._id}>
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                          }}
                        >
                          <Checkbox
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={() =>
                              handleSelectEmployee(employee._id)
                            }
                          />
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.neutral.main,
                          }}
                        >
                          {employee.name}
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.neutral.main,
                          }}
                        >
                          {employee.email}
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.neutral.main,
                          }}
                        >
                          {employee.phoneNumber}
                        </TableCell>
                        
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.neutral.main,
                          }}
                        >
                          {employee.position}
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.neutral.main,
                          }}
                        >
                          {employee.projectTeam?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.neutral.main,
                          }}
                        >
                          {employee.department?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.neutral.main,
                          }}
                        >
                          {employee.employmentStatus}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={employees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <FlexBetween>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddEmployee}
                style={{
                  marginTop: "20px",
                  marginRight: "10px",
                  marginLeft: "10px",
                }}
              >
                Add Employee
              </Button>
              <Button
                variant="contained"
                sx={{ color: "red" }}
                startIcon={<DeleteIcon />}
                onClick={handleDeleteEmployee}
                style={{ marginTop: "20px", marginRight: "10px" }}
              >
                Delete Selected
              </Button>
               {/* <Button
                variant="contained"
                color="info"
                startIcon={<EditIcon />}
                onClick={handleEditEmployee}
                style={{ marginTop: "20px" }}
              >
                Edit Selected
              </Button>  */}
            </FlexBetween>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default EmployeeData;





