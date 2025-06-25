import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Typography, Box, CircularProgress, Grid, Paper, Button,
    Card, CardContent, CardActions, Chip, Stack, Modal, Alert, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    fetchPendingExpenses,
    fetchPendingRevenues,
    approveExpense,
    approveRevenue,
    clearOperationStatus
} from '../../redux/Slices/transactionSlice';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentHistory from '../../components/PaymentHistory';
import TransactionTags from '../../components/TransactionTags';

// --- Child Components ---

const TransactionDetailModal = ({ transaction, open, onClose }) => {
    if (!transaction) return null;
    return (
        <Modal open={open} onClose={onClose} aria-labelledby="transaction-detail-title">
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: '70%', md: '50%' },
                bgcolor: 'background.paper', border: '2px solid #000',
                boxShadow: 24, p: 4, borderRadius: 2,
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <Typography id="transaction-detail-title" variant="h4" component="h2" gutterBottom>
                    Transaction Details
                </Typography>
                <Stack spacing={3}>
                    <PaymentHistory transaction={transaction} onClose={onClose} />
                    <TransactionTags transaction={transaction} />
                </Stack>
            </Box>
        </Modal>
    );
};

const ApprovalCard = ({ transaction, onApprove, onReject, onView, loading }) => {
    const theme = useTheme();
    const isExpense = transaction.type === 'Expense';

    const formatAmount = (amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: transaction.currency || 'INR'
    }).format(amount);

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }} elevation={3}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h5" component="div" gutterBottom>{formatAmount(transaction.amount)}</Typography>
                        <Chip label={transaction.type} color={isExpense ? "error" : "success"} size="small" />
                    </Stack>
                    <Typography color="text.secondary" gutterBottom>{transaction.category}</Typography>
                    <Typography variant="body2" sx={{ my: 2 }}>{transaction.description}</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" display="block"><b>Project:</b> {transaction.project?.name || 'N/A'}</Typography>
                    <Typography variant="caption" display="block"><b>Department:</b> {transaction.department?.name || 'N/A'}</Typography>
                    <Typography variant="caption" display="block"><b>Submitted By:</b> {transaction.createdBy?.name || 'N/A'}</Typography>
                    <Typography variant="caption" display="block"><b>Date:</b> {new Date(transaction.date).toLocaleDateString()}</Typography>
                </CardContent>
                <CardActions sx={{ p: 2, justifyContent: 'space-around', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button size="small" color="success" startIcon={<ThumbUpIcon />} onClick={onApprove} disabled={loading}>Approve</Button>
                    <Button size="small" color="error" startIcon={<ThumbDownIcon />} onClick={onReject} disabled={loading}>Reject</Button>
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={onView} disabled={loading}>View</Button>
                </CardActions>
            </Card>
        </Grid>
    );
};

// --- Main Approval Page Component ---

const ApprovalPage = () => {
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const {
        pendingExpenses,
        pendingRevenues,
        loading,
        operationLoading,
        operationSuccess,
        error,
        operationError
    } = useSelector((state) => state.transaction);

    useEffect(() => {
        // Dispatch both actions to fetch all pending items
        dispatch(fetchPendingExpenses());
        dispatch(fetchPendingRevenues());

        if (operationSuccess) {
            dispatch(clearOperationStatus());
        }
    }, [dispatch, operationSuccess]);

    // Combine pending expenses and revenues into a single list for rendering
    const pendingTransactions = useMemo(() => {
        const expensesWithType = pendingExpenses?.map(item => ({ ...item, type: 'Expense' })) || [];
        const revenuesWithType = pendingRevenues?.map(item => ({ ...item, type: 'Revenue' })) || [];
        return [...expensesWithType, ...revenuesWithType].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [pendingExpenses, pendingRevenues]);


    const handleApprove = (transaction) => {
        const payload = { status: 'Approved', notes: 'Approved via approvals page' };
        if (transaction.type === 'Expense') {
            dispatch(approveExpense({ expenseId: transaction._id, ...payload }));
        } else {
            dispatch(approveRevenue({ revenueId: transaction._id, status: 'Received', notes: 'Approved via approvals page' }));
        }
    };

    const handleReject = (transaction) => {
        const payload = { status: 'Rejected', notes: 'Rejected via approvals page' };
        if (transaction.type === 'Expense') {
            dispatch(approveExpense({ expenseId: transaction._id, ...payload }));
        } else {
            dispatch(approveRevenue({ revenueId: transaction._id, status: 'Cancelled', notes: 'Rejected via approvals page' }));
        }
    };

    const handleView = (transaction) => {
        setSelectedTransaction(transaction);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTransaction(null);
    };

    return (
        <Box p={{ xs: 1, sm: 2, md: 3 }}>
            <Typography variant="h2" component="h1" gutterBottom>Transaction Approvals</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError.message || 'An error occurred during the operation.'}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : pendingTransactions.length > 0 ? (
                <Grid container spacing={3}>
                    {pendingTransactions.map(transaction => (
                        <ApprovalCard
                            key={transaction._id}
                            transaction={transaction}
                            onApprove={() => handleApprove(transaction)}
                            onReject={() => handleReject(transaction)}
                            onView={() => handleView(transaction)}
                            loading={operationLoading}
                        />
                    ))}
                </Grid>
            ) : (
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6">No transactions are currently pending approval.</Typography>
                </Paper>
            )}

            <TransactionDetailModal
                transaction={selectedTransaction}
                open={modalOpen}
                onClose={handleCloseModal}
            />
        </Box>
    );
};

// --- Prop Types ---
TransactionDetailModal.propTypes = {
    transaction: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

ApprovalCard.propTypes = {
    transaction: PropTypes.object.isRequired,
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

export default ApprovalPage;
