/* eslint-disable react/prop-types */
// components/leave/LeaveBalanceDisplay.jsx
import React from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Alert,
    Paper,
    Box
} from '@mui/material';

const LeaveBalanceDisplay = ({ balance, isLoading, error }) => {
    const renderBalanceItem = (label, value) => (
        value !== undefined && value !== null && (
            <React.Fragment key={label}>
                <ListItem dense>
                    <ListItemText primary={`${label}:`} secondary={`${value} Available`} />
                </ListItem>
                <Divider component="li" light />
            </React.Fragment>
        )
    );

    return (
        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>My Leave Balances</Typography>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={30} /></Box>}
            {error && !isLoading && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            {balance && !isLoading && !error && (
                <List dense>
                    {renderBalanceItem("Casual Leave", balance.casualLeaves?.current)}
                    {renderBalanceItem("Sick Leave", balance.sickLeaves?.current)}
                    {renderBalanceItem("Earned Leave", balance.earnedLeaves?.current)}
                    {renderBalanceItem("Compensatory Off", balance.compensatoryLeaves?.current)}
                    {/* Conditionally render others if they might be relevant */}
                    {balance.maternityLeaves?.current > 0 && renderBalanceItem("Maternity Leave", balance.maternityLeaves.current)}
                    {balance.paternityLeaves?.current > 0 && renderBalanceItem("Paternity Leave", balance.paternityLeaves.current)}
                </List>
            )}
            {!balance && !isLoading && !error && <Typography variant="body2">No balance data found.</Typography>}
        </Paper>
    );
};

export default LeaveBalanceDisplay;