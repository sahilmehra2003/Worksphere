// Dashboard.jsx (Restored)
import React, { useEffect, useState } from "react";
import axios from "axios"; // Using global axios for now as per original structure
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
// import { axiosInstance } from "../services/apiConnector"; // Keep this commented if not immediately using

// Helper function to find the entity with the maximum revenueGenerated
function findHighestRevenue(items) {
  if (!items || items.length === 0) return null;
  return items.reduce((max, current) =>
    current.revenueGenerated > max.revenueGenerated ? current : max
  );
}

// Helper function to find the department with the maximum avgRating
function findHighestRating(items) {
  if (!items || items.length === 0) return null;
  return items.reduce((max, current) =>
    current.avgRating > max.avgRating ? current : max
  );
}

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derived data
  const [highestRevenueClient, setHighestRevenueClient] = useState(null);
  const [highestRevenueDepartment, setHighestRevenueDepartment] = useState(null);
  const [highestRatingDepartment, setHighestRatingDepartment] = useState(null);
  const [monthWithHighestProfit, setMonthWithHighestProfit] = useState(null);
  const [user, setUser] = useState({ name: 'User', role: 'Role' }); // Initialize with defaults

  const navigate = useNavigate(); // Keep for potential future use, though not for auth redirect here

  // Fetch user display name/role from localStorage
  useEffect(() => {
    console.log("Dashboard.jsx: useEffect for user display info running.");
    const userDataString = localStorage.getItem("worksphereUser"); // Using "worksphereUser"
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log("Dashboard.jsx: Found worksphereUser in localStorage:", userData);
        setUser({
          name: userData.name || "User", // Fallback
          role: userData.role || "Role",   // Fallback
        });
      } catch (e) {
        console.error("Dashboard.jsx: Failed to parse user data from localStorage", e);
        // Keep default user state if parsing fails
      }
    } else {
      console.warn("Dashboard.jsx: 'worksphereUser' not found in localStorage. Using default display info.");
      // CRITICAL: DO NOT NAVIGATE TO LOGIN FROM HERE. Protected.jsx handles authentication.
    }
  }, []); // Run once on mount to get user display info

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      console.log("Dashboard.jsx: fetchData useEffect started.");
      try {
        setLoading(true);

        // Consider using axiosInstance if these endpoints require authentication cookies
        // For now, using global axios as per the original structure you provided.
        const clientRes = await axios.get("http://localhost:4000/api/v1clientData/clients");
        const deptRes = await axios.get("http://localhost:4000/api/v1/departmentData/departments");
        const txnRes = await axios.get("http://localhost:4000/api/v1/transactionsDetails/transactions");

        console.log("Dashboard.jsx: Fetched client data:", clientRes.data);
        console.log("Dashboard.jsx: Fetched department data:", deptRes.data);
        console.log("Dashboard.jsx: Fetched transaction data:", txnRes.data);

        const clientsData = clientRes.data || [];
        const departmentsData = deptRes.data || [];
        const transactionsData = txnRes.data?.transactions || []; // Assuming transactions are nested

        setClients(clientsData);
        setDepartments(departmentsData);
        setTransactions(transactionsData);

        const maxClient = findHighestRevenue(clientsData);
        const maxDeptRevenue = findHighestRevenue(departmentsData);
        const maxDeptRating = findHighestRating(departmentsData);

        const profitByMonth = {};
        transactionsData.forEach((txn) => {
          if (txn.profit == null) return;
          const normalizedMonth = String(txn.month).padStart(2, "0");
          const monthKey = `${txn.year}-${normalizedMonth}`;
          profitByMonth[monthKey] = (profitByMonth[monthKey] || 0) + txn.profit;
        });

        let highestMonth = null;
        let highestProfitVal = -Infinity; // Initialize with a very small number
        Object.entries(profitByMonth).forEach(([monthKey, totalProfit]) => {
          if (totalProfit > highestProfitVal) {
            highestProfitVal = totalProfit;
            highestMonth = monthKey;
          }
        });

        setHighestRevenueClient(maxClient);
        setHighestRevenueDepartment(maxDeptRevenue);
        setHighestRatingDepartment(maxDeptRating);
        setMonthWithHighestProfit(highestMonth);

      } catch (error) {
        console.error("Error fetching data for dashboard:", error);
        // Optionally set an error state here to display to the user
      } finally {
        setLoading(false);
        console.log("Dashboard.jsx: fetchData completed, setLoading(false).");
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh", // Adjusted from 50vh for better centering
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Title Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome, {user.name}! 👋
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Here’s an overview of key data points for the day
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Card 1: Client with highest revenue */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Highest Revenue Client
            </Typography>
            {highestRevenueClient ? (
              <>
                <Typography variant="subtitle1">
                  Name: {highestRevenueClient.name}
                </Typography>
                <Typography variant="body2">
                  Revenue: {highestRevenueClient.revenueGenerated != null ? highestRevenueClient.revenueGenerated : "N/A"}
                </Typography>
              </>
            ) : (
              <Typography>No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Card 2: Department with highest revenue */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Highest Revenue Dept
            </Typography>
            {highestRevenueDepartment ? (
              <>
                <Typography variant="subtitle1">
                  Dept Name: {highestRevenueDepartment.name}
                </Typography>
                <Typography variant="body2">
                  Revenue: {highestRevenueDepartment.revenueGenerated != null ? highestRevenueDepartment.revenueGenerated : "N/A"}
                </Typography>
              </>
            ) : (
              <Typography>No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Card 3: Department with highest rating */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Highest Rated Dept
            </Typography>
            {highestRatingDepartment ? (
              <>
                <Typography variant="subtitle1">
                  Dept Name: {highestRatingDepartment.name}
                </Typography>
                <Typography variant="body2">
                  Rating: {highestRatingDepartment.avgRating != null ? highestRatingDepartment.avgRating : "N/A"}
                </Typography>
              </>
            ) : (
              <Typography>No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Card 4: Month with highest profit */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Month with Highest Profit
            </Typography>
            {monthWithHighestProfit ? (
              <Typography variant="subtitle1">
                {monthWithHighestProfit}
              </Typography>
            ) : (
              <Typography>No data available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;