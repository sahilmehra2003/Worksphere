/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    // eslint-disable-next-line no-unused-vars
    Chip,
    Box,
    TablePagination,
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import TimesheetStatusBadge from './TimesheetStatusBadge';

const TimesheetList = ({ timesheets, pagination, onPageChange }) => {
    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timesheets.map((timesheet) => (
                            <TableRow key={timesheet._id}>
                                <TableCell>
                                    {format(new Date(timesheet.weekStartDate), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>{timesheet.project?.name || 'N/A'}</TableCell>
                                <TableCell>{timesheet?.totalHours}</TableCell>
                                <TableCell>
                                    <TimesheetStatusBadge status={timesheet.status} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => {/* Handle view */ }}
                                        >
                                            <Visibility />
                                        </IconButton>
                                        {timesheet.status === 'draft' && (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {/* Handle edit */ }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {/* Handle delete */ }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={pagination?.totalRecords || 0}
                page={pagination?.currentPage - 1 || 0}
                onPageChange={(event, newPage) => onPageChange(newPage + 1)}
                rowsPerPage={10}
                rowsPerPageOptions={[10]}
            />
        </Paper>
    );
};

TimesheetList.propTypes = {
    timesheets: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            project: PropTypes.shape({
                name: PropTypes.string,
            }),
            totalHours: PropTypes.number.isRequired,
            status: PropTypes.string.isRequired,
        })
    ).isRequired,
    pagination: PropTypes.shape({
        totalRecords: PropTypes.number,
        currentPage: PropTypes.number,
    }),
    onPageChange: PropTypes.func.isRequired,
};

export default TimesheetList; 