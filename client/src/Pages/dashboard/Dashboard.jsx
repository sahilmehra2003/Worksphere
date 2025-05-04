import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * A small helper to find the entity with the maximum revenueGenerated.
 * @param {Array} items - array of items, each having a revenueGenerated field
 * @returns the item with the highest revenue (or null if empty)
 */
function findHighestRevenue(items) {
  if (!items || items.length === 0) return null;
  return items.reduce((max, current) =>
    current.revenueGenerated > max.revenueGenerated ? current : max
  );
}

/**
 * A small helper to find the department with the maximum avgRating.
 */
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
  const [user, setUser] = useState({ name: '', role: '' });

  const navigate = useNavigate();

  // Fetch user data from localStorage and handle redirection if not authenticated
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({
        name: userData.name || "Default Name",
        role: userData.role || "Default Role",
      });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Fetch all clients
        const clientRes = await axios.get("http://localhost:4000/clientData/clients");

        // 2) Fetch all departments
        const deptRes = await axios.get("http://localhost:4000/departmentData/departments");

        // 3) Fetch all transactions
        const txnRes = await axios.get("http://localhost:4000/transactionsDetails/transactions");

        setClients(clientRes.data || []);
        setDepartments(deptRes.data || []);
        setTransactions(txnRes.data.transactions || []);

        const maxClient = findHighestRevenue(clientRes.data);
        const maxDeptRevenue = findHighestRevenue(deptRes.data);
        const maxDeptRating = findHighestRating(deptRes.data);

        const profitByMonth = {};
        txnRes.data.transactions.forEach((txn) => {
          if (txn.profit == null) return;

          const normalizedMonth = String(txn.month).padStart(2, "0");
          const monthKey = `${txn.year}-${normalizedMonth}`;
          profitByMonth[monthKey] = (profitByMonth[monthKey] || 0) + txn.profit;
        });

        let highestMonth = null;
        let highestProfitVal = 0;
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
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
                  Revenue: {highestRevenueClient.revenueGenerated || "150000"}
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
                  Revenue: {highestRevenueDepartment.revenueGenerated}
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
                  Rating: {highestRatingDepartment.avgRating}
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
