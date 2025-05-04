// src/components/TransactionTimeline.jsx

import React, { useEffect, useState } from 'react';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineDot, TimelineContent, TimelineOppositeContent } from '@mui/lab';
import { Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const TimelineCard = ({ month, year, expenses, revenue, profit }) => {
    const theme = useTheme();

    return (
        <TimelineItem>
            <TimelineOppositeContent sx={{ m: "auto 0" }} align="right" variant="body2" color='yellow'>
                {month} {year}
            </TimelineOppositeContent>
            <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot style={{ backgroundColor: theme.palette.primary.main }}>
                    <MonetizationOnIcon />
                </TimelineDot>
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
                <Typography variant="h6" style={{ color:theme.palette.neutral.main }}>
                    Revenue: ${revenue} | Expenses: ${expenses} | Profit: ${profit}
                </Typography>
            </TimelineContent>
        </TimelineItem>
    );
};

const TransactionTimeline = () => {
    const theme=useTheme()
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            const response = await fetch("http://localhost:4000/transactionsDetails/transactions");
            const data = await response.json();
            if (data.success) {
                setTransactions(data.transactions);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <Paper elevation={3} style={{ padding: '20px', margin: '20px', backgroundColor: theme.palette.background.alt }}>
            <Typography variant="h3" style={{ color:'whitesmoke',textAlign:"center", margin:"auto" }}>Transaction Timeline</Typography>
            <Timeline position="alternate">
                {transactions.map(transaction => (
                    <TimelineCard key={transaction._id} {...transaction} />
                ))}
            </Timeline>
        </Paper>
    );
};

export default TransactionTimeline;