
import {
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Cancel'; // Using Cancel icon

// eslint-disable-next-line react/prop-types
const LeaveHistoryTable = ({ history = [], isLoading, error, onCancel, cancellingId }) => {

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Cancelled': return 'default';
            case 'Rejected':
            case 'Auto-Rejected': return 'error';
            default: return 'primary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(); // Adjust locale/format as needed
        } catch (err) {
            console.log(err.message)
            return 'Invalid Date';
        }
    };


    return (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>My Leave History</Typography>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={30} /></Box>}
            {error && !isLoading && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            {!isLoading && !error && (
                 <TableContainer sx={{ maxHeight: 440 }}> {/* Add max height for scroll */}
                     <Table stickyHeader size="small" aria-label="leave history table">
                         <TableHead>
                             <TableRow>
                                 <TableCell>Type</TableCell>
                                 <TableCell>Dates</TableCell>
                                 <TableCell align="right">Days</TableCell>
                                 <TableCell>Status</TableCell>
                                 <TableCell>Reason</TableCell>
                                 <TableCell>Action</TableCell>
                             </TableRow>
                         </TableHead>
                         <TableBody>
                             {history.length === 0 && (
                                <TableRow><TableCell colSpan={6} align="center">No leave history found.</TableCell></TableRow>
                             )}
                             {history.map((leave) => (
                                 <TableRow hover key={leave._id}>
                                     <TableCell component="th" scope="row">{leave.leaveType}</TableCell>
                                     <TableCell>{`${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}</TableCell>
                                     <TableCell align="right">{leave.numberOfDays}</TableCell>
                                     <TableCell>
                                         <Chip
                                             label={leave.status}
                                             size="small"
                                             color={getStatusColor(leave.status)}
                                         />
                                     </TableCell>
                                     <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                         <Tooltip title={leave.reason || ''}>
                                             <span>{leave.reason || '-'}</span>
                                         </Tooltip>
                                      </TableCell>
                                     <TableCell align="center" padding="checkbox">
                                        {/* Show cancel button only for Pending/Approved */}
                                        {['Pending', 'Approved'].includes(leave.status) && (
                                            <Tooltip title="Cancel Leave Request">
                                                {/* Disable button while cancelling this specific leave */}
                                                <span> {/* Span needed for tooltip when button is disabled */}
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => onCancel(leave._id)}
                                                    disabled={cancellingId === leave._id}
                                                    aria-label="cancel leave"
                                                >
                                                    {cancellingId === leave._id ? <CircularProgress size={18} color="inherit"/> : <DeleteIcon fontSize="small" />}
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

export default LeaveHistoryTable;