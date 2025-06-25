import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, useTheme, CircularProgress, Alert, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    DialogContentText, TextField, Grid, Card, CardContent
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import {
    fetchPendingLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    clearLeaveOperationStatus,
} from '../../redux/Slices/leaveSlice';

import FlexBetween from '../../components/FlexBetween';

const LeaveApproval = () => {
    const theme = useTheme();
    const dispatch = useDispatch();

    // --- Selectors ---
    const { user: authUser } = useSelector((state) => state.auth);
    const {
        pendingLeaveRequests,
        isLoadingPendingRequests,
        errorPendingRequests,
        isApprovingLeave,
        isRejectingLeave,
        approvingLeaveId,
        rejectingLeaveId,
        errorApprovingLeave,
        errorRejectingLeave,
        approveLeaveSuccess,
        rejectLeaveSuccess,
    } = useSelector((state) => state.leave);

    const userRole = authUser?.role;

    // --- Local State ---
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // --- Initial Data Fetch ---
    useEffect(() => {
        if (['Admin', 'HR', 'Manager'].includes(userRole)) {
            dispatch(fetchPendingLeaveRequests());
        }
    }, [dispatch, userRole]);

    // --- Effect for handling operation feedback ---
    useEffect(() => {
        if (approveLeaveSuccess) {
            toast.success('Leave request approved successfully!');
            dispatch(clearLeaveOperationStatus());
            dispatch(fetchPendingLeaveRequests()); // Refresh the list
        }
        if (rejectLeaveSuccess) {
            toast.success('Leave request rejected successfully!');
            dispatch(clearLeaveOperationStatus());
            dispatch(fetchPendingLeaveRequests()); // Refresh the list
            setIsRejectDialogOpen(false);
            setRejectionReason('');
        }
        if (errorApprovingLeave) {
            toast.error(`Approval Failed: ${errorApprovingLeave}`);
            dispatch(clearLeaveOperationStatus());
        }
        if (errorRejectingLeave) {
            toast.error(`Rejection Failed: ${errorRejectingLeave}`);
            dispatch(clearLeaveOperationStatus());
        }
    }, [approveLeaveSuccess, rejectLeaveSuccess, errorApprovingLeave, errorRejectingLeave, dispatch]);

    // --- Handler Functions ---
    const handleViewLeave = useCallback((leave) => {
        setSelectedLeave(leave);
        setIsViewDialogOpen(true);
    }, []);

    const handleApproveLeave = useCallback((leave) => {
        setSelectedLeave(leave);
        setIsApproveDialogOpen(true);
    }, []);

    const handleConfirmApprove = useCallback(() => {
        setIsApproveDialogOpen(false);
        dispatch(approveLeaveRequest(selectedLeave._id));
    }, [dispatch, selectedLeave]);

    const handleCancelApprove = useCallback(() => {
        setIsApproveDialogOpen(false);
        setSelectedLeave(null);
    }, []);

    const handleRejectLeave = useCallback((leave) => {
        setSelectedLeave(leave);
        setIsRejectDialogOpen(true);
    }, []);

    const handleConfirmReject = useCallback(() => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        dispatch(rejectLeaveRequest({ leaveId: selectedLeave._id, rejectionReason }));
    }, [dispatch, selectedLeave, rejectionReason]);

    const handleCancelReject = useCallback(() => {
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedLeave(null);
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Cancelled': return 'default';
            default: return 'default';
        }
    };

    // --- Access Control ---
    if (!['Admin', 'HR', 'Manager'].includes(userRole)) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Alert severity="error" sx={{ maxWidth: 400 }}>
                    You don&apos;t have permission to access this page. Only Admin, HR, and Manager roles can approve leave requests.
                </Alert>
            </Box>
        );
    }

    if (!authUser) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography>Authenticating user...</Typography>
                <CircularProgress sx={{ ml: 2 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <FlexBetween mb={3}>
                <Typography variant="h4" gutterBottom component="h1" sx={{ color: theme.palette.text.primary }}>
                    Leave Approval Dashboard
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => dispatch(fetchPendingLeaveRequests())}
                    disabled={isLoadingPendingRequests}
                >
                    {isLoadingPendingRequests ? <CircularProgress size={20} /> : 'Refresh'}
                </Button>
            </FlexBetween>

            {/* Summary Cards */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Pending
                            </Typography>
                            <Typography variant="h4">
                                {pendingLeaveRequests?.length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                This Week
                            </Typography>
                            <Typography variant="h4">
                                {pendingLeaveRequests?.filter(leave => {
                                    const leaveDate = new Date(leave.startDate);
                                    const now = new Date();
                                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                    return leaveDate >= weekAgo;
                                }).length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Pending Leave Requests Table */}
            <Paper elevation={2}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                        Pending Leave Requests
                    </Typography>

                    {isLoadingPendingRequests && (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    )}

                    {errorPendingRequests && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorPendingRequests}
                        </Alert>
                    )}

                    {!isLoadingPendingRequests && (!pendingLeaveRequests || pendingLeaveRequests.length === 0) && (
                        <Alert severity="info">
                            No pending leave requests found.
                        </Alert>
                    )}

                    {!isLoadingPendingRequests && pendingLeaveRequests && pendingLeaveRequests.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Employee</TableCell>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Leave Type</TableCell>
                                        <TableCell>Start Date</TableCell>
                                        <TableCell>End Date</TableCell>
                                        <TableCell>Days</TableCell>
                                        <TableCell>Applied On</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingLeaveRequests.map((leave) => (
                                        <TableRow key={leave._id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {leave.employee?.name || 'Unknown'}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {leave.employee?.email || 'No email'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {leave.employee?.department?.name || 'No Department'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={leave.leaveType}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(leave.startDate)}</TableCell>
                                            <TableCell>{formatDate(leave.endDate)}</TableCell>
                                            <TableCell>{leave.numberOfDays}</TableCell>
                                            <TableCell>{formatDate(leave.createdAt)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={leave.status}
                                                    size="small"
                                                    color={getStatusColor(leave.status)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        startIcon={<ViewIcon />}
                                                        onClick={() => handleViewLeave(leave)}
                                                        variant="outlined"
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        startIcon={<ApproveIcon />}
                                                        onClick={() => handleApproveLeave(leave)}
                                                        disabled={isApprovingLeave && approvingLeaveId === leave._id}
                                                        variant="contained"
                                                        color="success"
                                                    >
                                                        {isApprovingLeave && approvingLeaveId === leave._id ? (
                                                            <CircularProgress size={16} />
                                                        ) : (
                                                            'Approve'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        startIcon={<RejectIcon />}
                                                        onClick={() => handleRejectLeave(leave)}
                                                        disabled={isRejectingLeave && rejectingLeaveId === leave._id}
                                                        variant="contained"
                                                        color="error"
                                                    >
                                                        {isRejectingLeave && rejectingLeaveId === leave._id ? (
                                                            <CircularProgress size={16} />
                                                        ) : (
                                                            'Reject'
                                                        )}
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Paper>

            {/* View Leave Details Dialog */}
            <Dialog
                open={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Leave Request Details</DialogTitle>
                <DialogContent>
                    {selectedLeave && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                                <Typography variant="body1">{selectedLeave.employee?.name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <Typography variant="body1">{selectedLeave.employee?.email}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                                <Typography variant="body1">{selectedLeave.employee?.department?.name || 'No Department'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Position</Typography>
                                <Typography variant="body1">{selectedLeave.employee?.position || 'No Position'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Leave Type</Typography>
                                <Typography variant="body1">{selectedLeave.leaveType}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Number of Days</Typography>
                                <Typography variant="body1">{selectedLeave.numberOfDays}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                                <Typography variant="body1">{formatDate(selectedLeave.startDate)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                                <Typography variant="body1">{formatDate(selectedLeave.endDate)}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                                <Typography variant="body1">{selectedLeave.reason}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Applied On</Typography>
                                <Typography variant="body1">{formatDate(selectedLeave.createdAt)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                <Chip
                                    label={selectedLeave.status}
                                    color={getStatusColor(selectedLeave.status)}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Reject Leave Dialog */}
            <Dialog
                open={isRejectDialogOpen}
                onClose={handleCancelReject}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Reject Leave Request</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please provide a reason for rejecting this leave request:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rejection Reason"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter the reason for rejection..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelReject}>Cancel</Button>
                    <Button
                        onClick={handleConfirmReject}
                        color="error"
                        variant="contained"
                        disabled={!rejectionReason.trim()}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Leave Dialog */}
            <Dialog
                open={isApproveDialogOpen}
                onClose={handleCancelApprove}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Approve Leave Request</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Are you sure you want to approve this leave request?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelApprove}>Cancel</Button>
                    <Button
                        onClick={handleConfirmApprove}
                        color="success"
                        variant="contained"
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeaveApproval; 