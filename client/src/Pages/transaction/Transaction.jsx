import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarChartComponent from '../../components/Barchart';
import { Paper, Typography } from '@mui/material';
import TransactionTimeline from '../../components/Timeline';
import {useTheme} from '@mui/material';
const TransactionsPage = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const theme=useTheme()
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:4000/transactionsDetails/transactions');
                setData(response.data.transactions);
            } catch (error) {
                setError("Error fetching data");
                console.error("Error fetching the data", error);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
                <Typography variant="h6">Error Fetching Data</Typography>
            </Paper>
        );
    }

    return (
        <div>
            <Typography variant="h2" textAlign="center"  sx={{color:theme.palette.neutral.main}}>Transactions Overview</Typography>
            <BarChartComponent  data={data} title="Monthly Transactions"  />
            <TransactionTimeline/>
        </div>
    );
};

export default TransactionsPage;