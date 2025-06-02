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
    Box,
    TablePagination,
    Typography,
    useTheme,
    TextField,
    MenuItem,
    Grid2,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
} from '@mui/material';
import { Visibility, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import TimesheetStatusBadge from './TimesheetStatusBadge';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProjects } from '../../../redux/Slices/projectSlice';
import { toast } from 'react-hot-toast';
import { fetchTimesheetById, fetchMyTimesheets } from '../../../redux/Slices/timeSheetSlice';
import TimesheetViewModal from './TimesheetViewModal';
import TimesheetEditModal from './TimesheetEditModal';

const TimesheetList = ({ timesheets, pagination, onPageChange, onDelete, onApprove, onReject }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { projects } = useSelector((state) => state.project);
    const { user } = useSelector((state) => state.auth);
    const { currentTimesheetDetails } = useSelector((state) => state.timesheet);

    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTimesheet, setSelectedTimesheet] = useState(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAllProjects());
    }, [dispatch]);

    // Get unique statuses for filter
    const uniqueStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected'];

    // Filter timesheets based on search term and filters
    const filteredTimesheets = timesheets.filter(timesheet => {
        const matchesSearch =
            timesheet.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            format(new Date(timesheet.weekStartDate), 'MMM dd, yyyy').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = projectFilter === 'all' || timesheet.project?._id === projectFilter;
        const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter;
        return matchesSearch && matchesProject && matchesStatus;
    });

    const handleDeleteClick = (timesheet) => {
        setSelectedTimesheet(timesheet);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (selectedTimesheet) {
                await onDelete(selectedTimesheet._id);
                toast.success('Timesheet deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedTimesheet(null);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete timesheet');
        }
    };

    const handleView = async (timesheet) => {
        try {
            await dispatch(fetchTimesheetById(timesheet._id)).unwrap();
            setSelectedTimesheet(timesheet);
            setViewModalOpen(true);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch timesheet details');
        }
    };

    const handleEdit = async (timesheet) => {
        try {
            await dispatch(fetchTimesheetById(timesheet._id)).unwrap();
            setSelectedTimesheet(timesheet);
            setEditModalOpen(true);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch timesheet details');
        }
    };

    const handleApprove = async (timesheet) => {
        try {
            await onApprove(timesheet._id);
            toast.success('Timesheet approved successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to approve timesheet');
        }
    };

    const handleReject = async () => {
        try {
            if (selectedTimesheet && rejectionReason) {
                await onReject(selectedTimesheet._id, { rejectionReason });
                toast.success('Timesheet rejected successfully');
                setRejectDialogOpen(false);
                setSelectedTimesheet(null);
                setRejectionReason('');
            } else {
                toast.error('Please provide a rejection reason');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reject timesheet');
        }
    };

    const openRejectDialog = (timesheet) => {
        setSelectedTimesheet(timesheet);
        setRejectDialogOpen(true);
    };

    const canApproveReject = (timesheet) => {
        return ['Admin', 'HR', 'Manager'].includes(user?.role) && timesheet.status === 'Submitted';
    };

    return (
        <>
            <Paper sx={{ width: '100%', overflowX: "auto", mb: 2 }}>
                <Box sx={{ p: 2 }}>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Search"
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by project or date..."
                            />
                        </Grid2>
                        <Grid2 item xs={12} md={4}>
                            <TextField
                                fullWidth
                                select
                                label="Project"
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Projects</MenuItem>
                                {projects.map((project) => (
                                    <MenuItem key={project._id} value={project._id}>
                                        {project.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid2>
                        <Grid2 item xs={12} md={4}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                {uniqueStatuses.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid2>
                    </Grid2>
                </Box>
                <TableContainer component={Paper} elevation={0}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: theme.palette.text.light, fontWeight: 'bold', backgroundColor: theme.palette.primary.main, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant='h5'>S No.</Typography>
                                </TableCell>
                                <TableCell sx={{ color: theme.palette.text.light, fontWeight: 'bold', backgroundColor: theme.palette.primary.main, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant='h5'>Date</Typography>
                                </TableCell>
                                <TableCell sx={{ color: theme.palette.text.light, fontWeight: 'bold', backgroundColor: theme.palette.primary.main, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant='h5'>Project</Typography>
                                </TableCell>
                                <TableCell sx={{ color: theme.palette.text.light, fontWeight: 'bold', backgroundColor: theme.palette.primary.main, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant='h5'>Hours</Typography>
                                </TableCell>
                                <TableCell sx={{ color: theme.palette.text.light, fontWeight: 'bold', backgroundColor: theme.palette.primary.main, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant='h5'>Status</Typography>
                                </TableCell>
                                <TableCell sx={{ color: theme.palette.text.light, fontWeight: 'bold', backgroundColor: theme.palette.primary.main, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant='h5'>Actions</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTimesheets.map((timesheet, index) => (
                                <TableRow key={timesheet._id || index}>
                                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant='body1'>{index + 1}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant='body1'>{format(new Date(timesheet.weekStartDate), 'MMM dd, yyyy')}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant='body1'>
                                            {timesheet.entries?.[0]?.project?.name || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant='body1'>{timesheet?.totalHours}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                        <TimesheetStatusBadge status={timesheet.status} />
                                    </TableCell>
                                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleView(timesheet)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>

                                            {timesheet.status === 'Draft' && (
                                                <>
                                                    <Tooltip title="Edit Timesheet">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleEdit(timesheet)}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Timesheet">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteClick(timesheet)}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}

                                            {canApproveReject(timesheet) && (
                                                <>
                                                    <Tooltip title="Approve Timesheet">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleApprove(timesheet)}
                                                        >
                                                            <CheckCircle />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject Timesheet">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => openRejectDialog(timesheet)}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    </Tooltip>
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this timesheet?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Reject Timesheet</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rejection Reason"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        error={!rejectionReason}
                        helperText={!rejectionReason ? "Rejection reason is required" : ""}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleReject}
                        color="error"
                        disabled={!rejectionReason}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Modal */}
            <TimesheetViewModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                timesheet={selectedTimesheet}
                entries={currentTimesheetDetails?.entries}
            />

            {/* Edit Modal */}
            <TimesheetEditModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                timesheet={selectedTimesheet}
                entries={currentTimesheetDetails?.entries}
                onSave={() => {
                    setEditModalOpen(false);
                    // Refresh the timesheet list
                    dispatch(fetchMyTimesheets());
                }}
            />
        </>
    );
};

TimesheetList.propTypes = {
    timesheets: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            weekStartDate: PropTypes.string.isRequired,
            entries: PropTypes.arrayOf(
                PropTypes.shape({
                    _id: PropTypes.string.isRequired,
                    date: PropTypes.string.isRequired,
                    hours: PropTypes.number.isRequired,
                    description: PropTypes.string.isRequired,
                    project: PropTypes.shape({
                        _id: PropTypes.string.isRequired,
                        name: PropTypes.string.isRequired,
                    }),
                })
            ),
            totalHours: PropTypes.number.isRequired,
            status: PropTypes.string.isRequired,
        })
    ).isRequired,
    pagination: PropTypes.shape({
        totalRecords: PropTypes.number,
        currentPage: PropTypes.number,
    }),
    onPageChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
};

export default TimesheetList; 