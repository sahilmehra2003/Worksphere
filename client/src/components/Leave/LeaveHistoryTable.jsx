// src/components/Leave/LeaveHistoryTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Typography, CircularProgress, Alert, Paper, Box, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';

const LeaveHistoryTable = ({ history = [], isLoading, error, onCancel, cancellingId }) => {
    const theme = useTheme();

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Cancelled': return 'default'; // Grey
            case 'Rejected':
            case 'Auto-Rejected': return 'error';
            default: return 'info'; // A general color for other statuses
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // Using toLocaleDateString for a more user-friendly date format.
            // You can customize options if needed, e.g., { year: 'numeric', month: 'short', day: 'numeric' }
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (err) {
            console.error("Error formatting date:", dateString, err);
            return 'Invalid Date';
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 2, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                My Leave History
            </Typography>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={30} /></Box>}
            {error && !isLoading && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            {!isLoading && !error && (
                <TableContainer sx={{ maxHeight: 440 }}> {/* Add max height for scroll */}
                    <Table stickyHeader size="small" aria-label="leave history table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>Dates</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>Days</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>Reason</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(!history || history.length === 0) && ( // Check for undefined or empty
                                <TableRow><TableCell colSpan={6} align="center" sx={{ color: theme.palette.text.secondary }}>No leave history found.</TableCell></TableRow>
                            )}
                            {history && history.map((leave) => ( // Check for history before mapping
                                <TableRow hover key={leave._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row" sx={{ color: theme.palette.text.primary }}>{leave.leaveType}</TableCell>
                                    <TableCell sx={{ color: theme.palette.text.secondary }}>{`${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}</TableCell>
                                    <TableCell align="right" sx={{ color: theme.palette.text.primary }}>{leave.numberOfDays}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={leave.status}
                                            size="small"
                                            color={getStatusColor(leave.status)}
                                            sx={{ fontWeight: 'medium' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.palette.text.secondary }}>
                                        <Tooltip title={leave.reason || ''}>
                                            <span>{leave.reason || 'N/A'}</span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center" padding="none"> {/* Adjusted padding */}
                                        {/* Show cancel button only for Pending or Approved leaves */}
                                        {['Pending', 'Approved'].includes(leave.status) && (
                                            <Tooltip title="Cancel Leave Request">
                                                {/* Span needed for tooltip when button is disabled */}
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onCancel(leave._id)}
                                                        disabled={cancellingId === leave._id} // Disable if this specific leave is being cancelled
                                                        aria-label="cancel leave"
                                                    >
                                                        {/* Show spinner if this specific leave is being cancelled */}
                                                        {cancellingId === leave._id ? <CircularProgress size={18} color="inherit" /> : <CancelIcon fontSize="small" />}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

LeaveHistoryTable.propTypes = {
    history: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        leaveType: PropTypes.string,
        startDate: PropTypes.string, // Or Date
        endDate: PropTypes.string,   // Or Date
        numberOfDays: PropTypes.number,
        status: PropTypes.string,
        reason: PropTypes.string,
    })),
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    cancellingId: PropTypes.string, // ID of the leave currently being cancelled
};

export default LeaveHistoryTable;