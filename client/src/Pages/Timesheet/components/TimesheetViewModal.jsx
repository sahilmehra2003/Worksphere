import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Divider,
} from '@mui/material';
import { format } from 'date-fns';
import TimesheetStatusBadge from './TimesheetStatusBadge';
import PropTypes from 'prop-types';

const TimesheetViewModal = ({ open, onClose, timesheet, entries }) => {
    if (!timesheet) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">Timesheet Details</Typography>
                    <TimesheetStatusBadge status={timesheet.status} />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {/* Timesheet Header Information */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Week Starting
                                    </Typography>
                                    <Typography variant="body1">
                                        {format(new Date(timesheet.weekStartDate), 'MMMM dd, yyyy')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Total Hours
                                    </Typography>
                                    <Typography variant="body1">
                                        {timesheet.totalHours} hours
                                    </Typography>
                                </Grid>
                                {timesheet.submittedDate && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Submitted Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {format(new Date(timesheet.submittedDate), 'MMMM dd, yyyy')}
                                        </Typography>
                                    </Grid>
                                )}
                                {timesheet.processedDate && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {timesheet.status === 'Approved' ? 'Approved' : 'Rejected'} Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {format(new Date(timesheet.processedDate), 'MMMM dd, yyyy')}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Timesheet Entries */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Time Entries
                        </Typography>
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Project</TableCell>
                                        <TableCell>Hours</TableCell>
                                        <TableCell>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {entries?.map((entry) => (
                                        <TableRow key={entry._id}>
                                            <TableCell>
                                                {format(new Date(entry.date), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {entry.project?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>{entry.hours}</TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* Comments Section */}
                    {(timesheet.employeeComments || timesheet.managerComments) && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Comments
                            </Typography>
                            {timesheet.employeeComments && (
                                <Box mb={2}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Employee Comments
                                    </Typography>
                                    <Typography variant="body1">
                                        {timesheet.employeeComments}
                                    </Typography>
                                </Box>
                            )}
                            {timesheet.managerComments && (
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Manager Comments
                                    </Typography>
                                    <Typography variant="body1">
                                        {timesheet.managerComments}
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    )}

                    {/* Rejection Reason */}
                    {timesheet.status === 'Rejected' && timesheet.rejectionReason && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Rejection Reason
                            </Typography>
                            <Typography variant="body1" color="error">
                                {timesheet.rejectionReason}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

TimesheetViewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    timesheet: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        weekStartDate: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        totalHours: PropTypes.number.isRequired,
        submittedDate: PropTypes.string,
        processedDate: PropTypes.string,
        employeeComments: PropTypes.string,
        managerComments: PropTypes.string,
        rejectionReason: PropTypes.string,
    }),
    entries: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            hours: PropTypes.number.isRequired,
            description: PropTypes.string.isRequired,
            project: PropTypes.shape({
                name: PropTypes.string,
            }),
        })
    ),
};

export default TimesheetViewModal; 