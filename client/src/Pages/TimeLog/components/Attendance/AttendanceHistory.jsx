import PropTypes from 'prop-types';
import {
    Button, Paper, Chip,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';

const AttendanceHistory = ({ history, onRaiseIssue, onCorrectRequest }) => {
    const getStatusChip = (status) => {
        const colorMap = {
            Present: 'success',
            Shortfall: 'warning',
            Rejected: 'error',
            Disputed: 'secondary',
            'Pending Approval': 'info',
            'Escalated to HR': 'primary'
        };
        return <Chip label={status} color={colorMap[status] || 'default'} size="small" />;
    };

    return (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
            <Table aria-label="attendance history table">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Check-In</TableCell>
                        <TableCell>Check-Out</TableCell>
                        <TableCell>Total Hours</TableCell>
                        <TableCell>Half Day</TableCell>
                        <TableCell>Manager Approval</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                            <TableCell>{row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString() : '-'}</TableCell>
                            <TableCell>{row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString() : '-'}</TableCell>
                            <TableCell>{row.totalHours || '-'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={row.isHalfDay ? 'Yes' : 'No'}
                                    color={row.isHalfDay ? 'warning' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={row.managerApproval?.status === 'Pending' ? 'Required' : 'Not Required'}
                                    color={row.managerApproval?.status === 'Pending' ? 'error' : 'success'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{getStatusChip(row.status)}</TableCell>
                            <TableCell align="center">
                                <Button size="small" onClick={() => onCorrectRequest(row)}>Request Correction</Button>
                                {row.status === 'Rejected' && (
                                    <Button size="small" variant="outlined" color="secondary" onClick={() => onRaiseIssue(row)} sx={{ ml: 1 }}>Raise Issue</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

AttendanceHistory.propTypes = {
    history: PropTypes.array.isRequired,
    onRaiseIssue: PropTypes.func.isRequired,
    onCorrectRequest: PropTypes.func.isRequired
};

export default AttendanceHistory;
