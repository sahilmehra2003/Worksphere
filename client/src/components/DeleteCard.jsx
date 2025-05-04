import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  Select,
  Button,
  IconButton,
} from "@mui/material";
import { FaTimes } from "react-icons/fa"; // Importing cross icon
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";

const DeleteDepartmentCard = ({ showCard, setShow,onDepartmentDeleted }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility
  const URL = "http://localhost:4000/departmentData/departments";

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(URL);
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Handle department selection
  const handleDepartmentChange = (event) => {
    const selectedId = event.target.value;
    setSelectedDepartmentId(selectedId);
    // console.log("Selected Department ID:", selectedId); // Added console log
  };

  // Handle delete department
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:4000/departmentData/department/delete/${selectedDepartmentId}`
      );
      setDepartments((prev) =>
        prev.filter((department) => department.id !== selectedDepartmentId)
      );
      setSelectedDepartmentId("");
      toast.success("Department deleted successfully")
      onDepartmentDeleted();
      setShow(false);
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("failed to delete the department")
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        margin: "auto",
        mt: 4,
        boxShadow: 3,
        padding: 2,
        opacity: isVisible ? 1 : 0, // Conditional opacity
        transition: "opacity 0.3s ease",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Typography
            variant="h4"
            sx={{ textAlign: "center", marginBottom: 2, fontWeight: "bold" }}
          >
            Delete Department
          </Typography>
          <IconButton
            onClick={() => {
              setIsVisible(false);
              setShow(false);
            }} // Hide the card on click
            sx={{ color: "white", marginLeft: "15px" }}
          >
            <FaTimes />
          </IconButton>
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Department:
          </Typography>
          <Select
            fullWidth
            value={selectedDepartmentId}
            onChange={handleDepartmentChange}
            displayEmpty
            sx={{ backgroundColor: "black" }}
          >
            <MenuItem value="" disabled>
              Select a department
            </MenuItem>
            {departments.map((department) => (
              <MenuItem key={department._id} value={department._id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Button
          variant="contained"
        
          fullWidth
          disabled={!selectedDepartmentId}
          onClick={handleDelete}
          sx={{ color: "red" }}
          startIcon={<DeleteIcon />}
        >
          Delete Department
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeleteDepartmentCard;
