import React, { useEffect } from 'react'; // Removed useState
import { useDispatch, useSelector } from 'react-redux'; // Added Redux hooks
import { Paper, Typography, Box, CircularProgress } from '@mui/material'; // Added Box and CircularProgress
import { useTheme } from '@mui/material';
import { fetchAllTransactions } from '../../redux/Slices/transactionSlice'; // Import the thunk
import BarChartComponent from '../../components/Barchart'; // Assuming path is correct
import TransactionTimeline from '../../components/Timeline'; // Assuming path is correct

const TransactionsPage = () => {
    const dispatch = useDispatch();
    const theme = useTheme();

    // Select data from Redux store
    const { transactions, loading, error } = useSelector((state) => state.transaction);

    useEffect(() => {
        // Dispatch the action to fetch transactions when the component mounts
        dispatch(fetchAllTransactions());
    }, [dispatch]); // Dependency array includes dispatch

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper elevation={3} style={{ padding: '20px', margin: '20px', textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Error Fetching Transactions: {typeof error === 'string' ? error : JSON.stringify(error)}
                </Typography>
            </Paper>
        );
    }

    return (
        <Box p={3}> {/* Added padding to the main container for consistency */}
            <Typography variant="h2" textAlign="center" sx={{ color: theme.palette.text.primary, mb: 4 }}> {/* Used theme text color and added margin */}
                Transactions Overview
            </Typography>
            {/* Pass transactions data to BarChartComponent */}
            <BarChartComponent data={transactions} title="Monthly Transactions" />
            {/* TransactionTimeline might also need transactions data or handle its own fetching/state */}
            <TransactionTimeline transactions={transactions} /> {/* Assuming TransactionTimeline can accept transactions data */}
        </Box>
    );
};

export default TransactionsPage;