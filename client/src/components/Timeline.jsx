// src/components/TransactionTimeline.jsx

import React from 'react'; 
import PropTypes from 'prop-types'; // For prop validation
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineDot, TimelineContent, TimelineOppositeContent } from '@mui/lab';
import { Typography, Paper, Box } from '@mui/material'; 
import { useTheme } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const TimelineCard = ({ month, year, expenses, revenue, profit }) => {
    const theme = useTheme();

    // Format numbers to be more readable, e.g., with commas
    const formatCurrency = (value) => {
        if (value == null) return 'N/A';
        return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };


    return (
        <TimelineItem>
            <TimelineOppositeContent sx={{ m: "auto 0" }} align="right" variant="body2" color={theme.palette.text.secondary}> {/* Changed color for better theme integration */}
                {month} {year}
            </TimelineOppositeContent>
            <TimelineSeparator>
                <TimelineConnector sx={{ bgcolor: 'secondary.main' }} /> {/* Use theme color */}
                <TimelineDot sx={{ backgroundColor: theme.palette.secondary.main }}> {/* Use theme color */}
                    <MonetizationOnIcon sx={{ color: theme.palette.secondary.contrastText }} /> {/* Ensure icon contrasts with dot */}
                </TimelineDot>
                <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}> {/* Added some padding */}
                <Typography variant="subtitle1" component="span" sx={{ color: theme.palette.text.primary, fontWeight: 'medium' }}> {/* Changed variant and color */}
                    Revenue: ${formatCurrency(revenue)}
                </Typography>
                <Typography variant="body2" component="span" sx={{ color: theme.palette.text.secondary, mx: 1 }}>|</Typography> {/* Separator */}
                <Typography variant="subtitle1" component="span" sx={{ color: theme.palette.text.primary, fontWeight: 'medium' }}>
                    Expenses: ${formatCurrency(expenses)}
                </Typography>
                <Typography variant="body2" component="span" sx={{ color: theme.palette.text.secondary, mx: 1 }}>|</Typography>
                <Typography variant="subtitle1" component="span" sx={{ color: profit >= 0 ? theme.palette.success.main : theme.palette.error.main, fontWeight: 'bold' }}> {/* Conditional color for profit */}
                    Profit: ${formatCurrency(profit)}
                </Typography>
            </TimelineContent>
        </TimelineItem>
    );
};

// Define PropTypes for TimelineCard
TimelineCard.propTypes = {
    month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    expenses: PropTypes.number,
    revenue: PropTypes.number,
    profit: PropTypes.number,
};


const TransactionTimeline = ({ transactions = [] }) => { // Receive transactions as a prop, default to empty array
    const theme = useTheme();

    if (!transactions || transactions.length === 0) {
        return (
            <Paper elevation={3} style={{ padding: '20px', margin: '20px', backgroundColor: theme.palette.background.alt, textAlign: 'center' }}>
                <Typography variant="h6" style={{ color: theme.palette.text.secondary }}>
                    No transaction data available for the timeline.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} style={{ padding: '20px', margin: '20px', backgroundColor: theme.palette.background.alt }}>
            <Typography variant="h4" component="h2" style={{ color: theme.palette.text.primary, textAlign: "center", marginBottom: "20px" }}> {/* Adjusted variant and color */}
                Transaction Timeline
            </Typography>
            <Timeline position="alternate">
                {transactions.map(transaction => (
                    // Ensure your transaction object has month, year, expenses, revenue, profit, and _id
                    <TimelineCard
                        key={transaction._id}
                        month={transaction.month} // Assuming month is directly available (e.g., "January", or a number)
                        year={transaction.year}
                        expenses={transaction.expenses}
                        revenue={transaction.revenue}
                        profit={transaction.profit}
                    />
                ))}
            </Timeline>
        </Paper>
    );
};

// Define PropTypes for TransactionTimeline
TransactionTimeline.propTypes = {
    transactions: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        expenses: PropTypes.number,
        revenue: PropTypes.number,
        profit: PropTypes.number,
        // Add other expected fields from your transaction object if needed for validation
    }))
};

export default TransactionTimeline;