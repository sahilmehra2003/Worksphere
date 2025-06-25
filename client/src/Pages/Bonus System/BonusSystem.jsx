import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography, Box, CircularProgress, Alert,
    Paper, Divider, Button, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Tabs, Tab
} from '@mui/material';
import {
    Visibility as ViewIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon
} from '@mui/icons-material';
import {
    createBonusAward,
    fetchMyBonusAwards,
    fetchBonusTypes,
    fetchPendingBonusApprovals,
    approveOrRejectBonus,
    seedBonusTypes,
    clearError,
    clearBonusData,
    clearSuccess
} from '../../redux/Slices/bonusSlice';
import AwardBonusForm from './component/AwardBonusForm';
import BonusDetailsModal from './component/BonusDetailsModal';

const BonusSystemPage = () => {
    const dispatch = useDispatch();
    const { loading, error, myBonusAwards, bonusTypes, pendingApprovals, operationLoading, operationSuccess } = useSelector((state) => state.bonus);
    const { user } = useSelector((state) => state.auth);
    const [showForm, setShowForm] = useState(false);
    const [selectedAward, setSelectedAward] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [approvalDialog, setApprovalDialog] = useState({ open: false, award: null, action: '' });
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const isApprover = ['Admin', 'HR', 'Manager'].includes(user?.role);

    useEffect(() => {
        dispatch(fetchMyBonusAwards());
        dispatch(fetchBonusTypes());

        if (isApprover) {
            dispatch(fetchPendingBonusApprovals());
        }

        return () => {
            dispatch(clearBonusData());
        };
    }, [dispatch, isApprover]);

    const handleAwardBonus = (bonusData) => {
        dispatch(createBonusAward(bonusData)).then((result) => {
            if (!result.error) {
                // The Redux slice will handle adding to the appropriate list
                // We only need to refresh if the user is an approver to get the latest pending approvals
                if (isApprover) {
                    dispatch(fetchPendingBonusApprovals());
                }
            }
        });
        setShowForm(false);
    };

    const handleSeedBonusTypes = () => {
        dispatch(seedBonusTypes());
    };

    const handleViewDetails = (award) => {
        setSelectedAward(award);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAward(null);
    };

    const handleApprovalAction = (award, action) => {
        setApprovalDialog({ open: true, award, action });
        setRejectionReason('');
    };

    const handleCloseApprovalDialog = () => {
        setApprovalDialog({ open: false, award: null, action: '' });
        setRejectionReason('');
    };

    const handleSubmitApproval = () => {
        const { award, action } = approvalDialog;
        dispatch(approveOrRejectBonus({
            awardId: award._id,
            action,
            rejectionReason: action === 'reject' ? rejectionReason : undefined
        }));
        handleCloseApprovalDialog();
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'PendingApproval': return 'warning';
            case 'ProcessingPayment': return 'info';
            case 'PaidOut': return 'success';
            case 'Delivered': return 'success';
            case 'Claimed': return 'success';
            case 'Credited': return 'success';
            case 'Scheduled': return 'info';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount, currency) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR'
        }).format(amount);
    };

    // Tab content components
    const PendingApprovalsTab = () => (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Pending Approvals</Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : pendingApprovals.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography>No pending bonus approvals.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Bonus Type</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Requested By</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingApprovals.map((award) => (
                                <TableRow key={award._id}>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {award.employee?.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {award.employee?.employeeId}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {award.bonusType?.name}
                                        </Typography>
                                        <Chip
                                            label={award.bonusType?.category}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {award.valueCategory === 'Monetary' && (
                                            <Typography variant="body2" fontWeight="bold">
                                                {formatCurrency(award.monetaryAmount, award.currency)}
                                            </Typography>
                                        )}
                                        {award.valueCategory === 'LeaveCredit' && (
                                            <Typography variant="body2" fontWeight="bold">
                                                {award.leaveDaysGranted} days
                                            </Typography>
                                        )}
                                        {award.valueCategory !== 'Monetary' && award.valueCategory !== 'LeaveCredit' && (
                                            <Typography variant="body2" color="text.secondary">
                                                {award.nonMonetaryDetails || 'N/A'}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {award.reason}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {award.awardedBy?.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(award.awardDate)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(award)}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Approve">
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleApprovalAction(award, 'approve')}
                                                    disabled={operationLoading}
                                                >
                                                    <ApproveIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleApprovalAction(award, 'reject')}
                                                    disabled={operationLoading}
                                                >
                                                    <RejectIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );

    const MyBonusAwardsTab = () => (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>My Bonus Awards</Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : myBonusAwards.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography>No bonus awards found.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Bonus Type</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Effective Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {myBonusAwards.map((award) => (
                                <TableRow key={award._id}>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {award.bonusType?.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {award.bonusType?.typeCode}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={award.bonusType?.category}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {award.valueCategory === 'Monetary' && (
                                            <Typography variant="body2" fontWeight="bold">
                                                {formatCurrency(award.monetaryAmount, award.currency)}
                                            </Typography>
                                        )}
                                        {award.valueCategory === 'LeaveCredit' && (
                                            <Typography variant="body2" fontWeight="bold">
                                                {award.leaveDaysGranted} days
                                            </Typography>
                                        )}
                                        {award.valueCategory !== 'Monetary' && award.valueCategory !== 'LeaveCredit' && (
                                            <Typography variant="body2" color="text.secondary">
                                                {award.nonMonetaryDetails || 'N/A'}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(award.effectiveDate)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={award.status}
                                            color={getStatusColor(award.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewDetails(award)}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );

    return (
        <Box p={{ xs: 1, sm: 2, md: 3 }}>
            <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h2" component="h1">
                        Bonus Management
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setShowForm(!showForm);
                            if (operationSuccess) {
                                dispatch(clearSuccess());
                            }
                        }}
                        disabled={loading}
                    >
                        {showForm ? 'Cancel' : 'Award New Bonus'}
                    </Button>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        onClose={() => dispatch(clearError())}
                    >
                        {error}
                    </Alert>
                )}

                {operationSuccess && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        onClose={() => dispatch(clearSuccess())}
                    >
                        {approvalDialog.open ? 'Bonus approval action completed successfully!' : 'Bonus created successfully!'}
                    </Alert>
                )}

                {bonusTypes.length === 0 && !loading && (
                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={handleSeedBonusTypes}
                                disabled={loading}
                            >
                                {loading ? 'Seeding...' : 'Seed Bonus Types'}
                            </Button>
                        }
                    >
                        No bonus types found. Click to seed initial bonus types.
                    </Alert>
                )}

                {showForm && (
                    <Box mb={4}>
                        <AwardBonusForm
                            onSubmit={handleAwardBonus}
                            loading={loading}
                        />
                    </Box>
                )}

                <Divider sx={{ my: 4 }} />

                {/* Tabs Section */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="bonus management tabs">
                        {isApprover && (
                            <Tab
                                label={`Pending Approvals ${pendingApprovals.length > 0 ? `(${pendingApprovals.length})` : ''}`}
                                id="tab-0"
                                aria-controls="tabpanel-0"
                            />
                        )}
                        <Tab
                            label={`My Bonus Awards ${myBonusAwards.length > 0 ? `(${myBonusAwards.length})` : ''}`}
                            id={isApprover ? "tab-1" : "tab-0"}
                            aria-controls={isApprover ? "tabpanel-1" : "tabpanel-0"}
                        />
                    </Tabs>
                </Box>

                {/* Tab Panels */}
                <Box>
                    {activeTab === 0 && isApprover && <PendingApprovalsTab />}
                    {activeTab === (isApprover ? 1 : 0) && <MyBonusAwardsTab />}
                </Box>
            </Paper>

            {/* Bonus Details Modal */}
            <BonusDetailsModal
                open={showModal}
                onClose={handleCloseModal}
                award={selectedAward}
            />

            {/* Approval Dialog */}
            <Dialog open={approvalDialog.open} onClose={handleCloseApprovalDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {approvalDialog.action === 'approve' ? 'Approve Bonus' : 'Reject Bonus'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to {approvalDialog.action === 'approve' ? 'approve' : 'reject'} this bonus award?
                    </Typography>
                    {approvalDialog.action === 'reject' && (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Rejection Reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            sx={{ mt: 2 }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseApprovalDialog} disabled={operationLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitApproval}
                        variant="contained"
                        color={approvalDialog.action === 'approve' ? 'success' : 'error'}
                        disabled={operationLoading || (approvalDialog.action === 'reject' && !rejectionReason.trim())}
                    >
                        {operationLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            approvalDialog.action === 'approve' ? 'Approve' : 'Reject'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BonusSystemPage;
