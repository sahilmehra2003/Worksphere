import PropTypes from 'prop-types';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineDot, TimelineContent, TimelineOppositeContent } from '@mui/lab';
import { Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const TimelineCard = ({ month, year, expenses, revenue, profit }) => {
    const theme = useTheme();

    const formatCurrency = (value) => {
        if (value == null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getProfitIcon = (profit) => {
        if (profit > 0) {
            return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
        } else if (profit < 0) {
            return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
        }
        return <MonetizationOnIcon sx={{ color: theme.palette.text.secondary }} />;
    };

    return (
        <TimelineItem>
            <TimelineOppositeContent
                sx={{
                    m: "auto 0",
                    color: theme.palette.text.secondary
                }}
                align="right"
                variant="body2"
            >
                {month} {year}
            </TimelineOppositeContent>
            <TimelineSeparator>
                <TimelineConnector sx={{ bgcolor: theme.palette.divider }} />
                <TimelineDot
                    sx={{
                        backgroundColor: profit >= 0 ? theme.palette.success.main : theme.palette.error.main,
                        boxShadow: 3
                    }}
                >
                    {getProfitIcon(profit)}
                </TimelineDot>
                <TimelineConnector sx={{ bgcolor: theme.palette.divider }} />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 2
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        component="span"
                        sx={{
                            color: theme.palette.success.main,
                            fontWeight: 'medium',
                            mr: 2
                        }}
                    >
                        Revenue: {formatCurrency(revenue)}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        component="span"
                        sx={{
                            color: theme.palette.error.main,
                            fontWeight: 'medium',
                            mr: 2
                        }}
                    >
                        Expenses: {formatCurrency(expenses)}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        component="span"
                        sx={{
                            color: profit >= 0 ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 'bold'
                        }}
                    >
                        Profit: {formatCurrency(profit)}
                    </Typography>
                </Paper>
            </TimelineContent>
        </TimelineItem>
    );
};

// Define PropTypes for TimelineCard
TimelineCard.propTypes = {
    month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    expenses: PropTypes.number.isRequired,
    revenue: PropTypes.number.isRequired,
    profit: PropTypes.number.isRequired
};

const TransactionTimeline = ({ transactions = [] }) => {
    const theme = useTheme();

    if (!transactions || transactions.length === 0) {
        return (
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    m: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    textAlign: 'center'
                }}
            >
                <Typography
                    variant="h6"
                    sx={{ color: theme.palette.text.secondary }}
                >
                    No transaction data available for the timeline.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                m: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2
            }}
        >
            <Typography
                variant="h4"
                component="h2"
                sx={{
                    color: theme.palette.text.primary,
                    textAlign: "center",
                    mb: 3
                }}
            >
                Transaction Timeline
            </Typography>
            <Timeline position="alternate">
                {transactions.map((transaction, index) => (
                    <TimelineCard
                        key={`${transaction.month}-${transaction.year}-${index}`}
                        month={transaction.month}
                        year={transaction.year}
                        expenses={transaction.expenses}
                        revenue={transaction.revenue}
                        profit={transaction.profit}
                        transactionIds={transaction.transactionIds}
                    />
                ))}
            </Timeline>
        </Paper>
    );
};

// Define PropTypes for TransactionTimeline
TransactionTimeline.propTypes = {
    transactions: PropTypes.arrayOf(PropTypes.shape({
        month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        expenses: PropTypes.number.isRequired,
        revenue: PropTypes.number.isRequired,
        profit: PropTypes.number.isRequired,
        transactionIds: PropTypes.arrayOf(PropTypes.string)
    }))
};

export default TransactionTimeline;