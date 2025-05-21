// src/components/Leave/LeaveBalanceDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Typography, List, ListItem, ListItemText, Divider,
    CircularProgress, Alert, Paper, Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const LeaveBalanceDisplay = ({ balance, isLoading, error }) => {
    const theme = useTheme();

    const renderBalanceItem = (label, valueObject) => {
        // Check if valueObject and valueObject.current exist and are numbers
        if (valueObject && typeof valueObject.current === 'number') {
            return (
                <React.Fragment key={label}>
                    <ListItem dense sx={{ py: 0.5 }}>
                        <ListItemText
                            primaryTypographyProps={{ variant: 'body1', color: theme.palette.text.primary }}
                            secondaryTypographyProps={{ variant: 'body2', color: theme.palette.text.secondary, fontWeight: 'medium' }}
                            primary={`${label}:`}
                            secondary={`${valueObject.current} Available (Total: ${valueObject.total || valueObject.current})`}
                        />
                    </ListItem>
                    <Divider component="li" light sx={{ borderColor: theme.palette.divider, my: 0.5 }} />
                </React.Fragment>
            );
        }
        return null; // Don't render if data is not in expected format
    };


    return (
        <Paper elevation={2} sx={{ p: 2, height: '100%', backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                My Leave Balances
            </Typography>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={30} /></Box>}
            {error && !isLoading && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            {balance && !isLoading && !error && (
                <List dense>
                    {renderBalanceItem("Casual Leaves", balance.casualLeaves)}
                    {renderBalanceItem("Sick Leaves", balance.sickLeaves)}
                    {renderBalanceItem("Earned Leaves", balance.earnedLeaves)}
                    {renderBalanceItem("Compensatory Offs", balance.compensatoryLeaves)}
                    {renderBalanceItem("Maternity Leave", balance.maternityLeaves)}
                    {renderBalanceItem("Paternity Leave", balance.paternityLeaves)}
                    {renderBalanceItem("Unpaid Leaves Taken", { current: balance.unpaidLeavesTaken || 0 })}
                </List>
            )}
            {!balance && !isLoading && !error && (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    Leave balance data is currently unavailable.
                </Typography>
            )}
        </Paper>
    );
};

LeaveBalanceDisplay.propTypes = {
    balance: PropTypes.shape({
        casualLeaves: PropTypes.shape({ current: PropTypes.number, total: PropTypes.number }),
        sickLeaves: PropTypes.shape({ current: PropTypes.number, total: PropTypes.number }),
        earnedLeaves: PropTypes.shape({ current: PropTypes.number, total: PropTypes.number }),
        compensatoryLeaves: PropTypes.shape({ current: PropTypes.number, total: PropTypes.number }),
        maternityLeaves: PropTypes.shape({ current: PropTypes.number, total: PropTypes.number }),
        paternityLeaves: PropTypes.shape({ current: PropTypes.number, total: PropTypes.number }),
        unpaidLeavesTaken: PropTypes.number,
    }),
    isLoading: PropTypes.bool,
    error: PropTypes.string,
};

export default LeaveBalanceDisplay;