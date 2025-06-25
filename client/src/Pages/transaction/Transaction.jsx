import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Typography, Box, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Alert,
    Paper, Grid, Tabs, Tab, Grow, Stack, IconButton, Button,
    Modal, TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    fetchAnnualReport,
    fetchAvailableYears,
    deleteExpense,
    deleteRevenue,
    updateExpense,
    updateRevenue,
    clearOperationStatus
} from '../../redux/Slices/transactionSlice';
import FlexBetween from '../../components/FlexBetween';
import PaymentHistory from '../../components/PaymentHistory';
import TransactionTags from '../../components/TransactionTags';

// --- Child Components ---

const SummaryCard = ({ title, value, color }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', color, borderRadius: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
        </Typography>
    </Paper>
);

const TransactionList = ({ transactions, type, onTransactionClick, onEdit, onDelete, selectedId }) => {
    const theme = useTheme();
    if (!transactions || transactions.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>No {type} found for this year.</Alert>;
    }
    return (
        <Paper elevation={2} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>{type.charAt(0).toUpperCase() + type.slice(1)}</Typography>
            {transactions.map(t => (
                <Box
                    key={t._id}
                    sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`, p: 1.5, mb: 1.5, borderRadius: 1,
                        backgroundColor: selectedId === t._id ? theme.palette.action.selected : 'transparent',
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                        '&:last-child': { borderBottom: 'none', mb: 0, }
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ cursor: 'pointer', flexGrow: 1 }} onClick={() => onTransactionClick(t)}>
                            <Typography variant="body1" component="p" >{t.description}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(t.date).toLocaleDateString()} | {t.category} | {t.status}
                            </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center">
                            <Typography variant="h6" sx={{ mr: 2, color: type === 'expenses' ? theme.palette.error.main : theme.palette.success.main, fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.amount)}
                            </Typography>
                            <IconButton size="small" onClick={() => onEdit(t)} aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => onDelete(t)} aria-label="delete" sx={{ color: theme.palette.error.light }}><DeleteIcon fontSize="small" /></IconButton>
                        </Stack>
                    </Stack>
                </Box>
            ))}
        </Paper>
    );
};

const TransactionEditModal = ({ open, onClose, transaction, onSave, operationLoading }) => {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (transaction) {
            setFormData({
                ...transaction,
                date: new Date(transaction.date).toISOString().split('T')[0]
            });
        }
    }, [transaction]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const { amount, ...rest } = formData;
        onSave({ ...rest, amount: parseFloat(amount) });
    };

    if (!formData) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: { xs: '90%', md: '600px' }, bgcolor: 'background.paper',
                borderRadius: 2, boxShadow: 24, p: 4,
            }}>
                <Typography variant="h4" component="h2" gutterBottom>Edit Transaction</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Category" name="category" value={formData.category} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button variant="outlined" onClick={onClose} disabled={operationLoading}>Cancel</Button>
                        <Button variant="contained" onClick={handleSave} disabled={operationLoading}>
                            {operationLoading ? <CircularProgress size={24} /> : "Save Changes"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};


// --- Main Page Component ---

const TransactionsPage = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const [selectedYear, setSelectedYear] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState(null);

    const { annualReport, availableYears, reportLoading, reportError, operationSuccess, operationLoading } = useSelector((state) => state.transaction);

    useEffect(() => { dispatch(fetchAvailableYears()); }, [dispatch]);

    useEffect(() => {
        if (availableYears?.length > 0 && !selectedYear) {
            setSelectedYear([...availableYears].sort((a, b) => b - a)[0]);
        }
    }, [availableYears, selectedYear]);

    useEffect(() => {
        if (selectedYear && (operationSuccess || !annualReport)) {
            dispatch(fetchAnnualReport({ year: selectedYear }));
            if (operationSuccess) dispatch(clearOperationStatus());
            setSelectedTransaction(null);
        }
    }, [dispatch, selectedYear, operationSuccess, annualReport]);

    const handleYearChange = (event) => setSelectedYear(parseInt(event.target.value, 10));
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setSelectedTransaction(null);
    };
    const handleTransactionClick = (transaction) => setSelectedTransaction(transaction);
    const handleClosePaymentHistory = () => setSelectedTransaction(null);

    const handleEditTransaction = (transaction) => {
        setTransactionToEdit({ ...transaction, type: currentTab === 0 ? 'Expense' : 'Revenue' });
        setEditModalOpen(true);
    };

    const handleUpdateTransaction = (updatedData) => {
        const { _id, type, ...dataToUpdate } = updatedData;
        if (type === 'Expense') {
            dispatch(updateExpense({ expenseId: _id, data: dataToUpdate }));
        } else {
            dispatch(updateRevenue({ revenueId: _id, data: dataToUpdate }));
        }
        setEditModalOpen(false);
    };

    const handleDeleteTransaction = (transaction) => {
        const type = currentTab === 0 ? 'expense' : 'revenue';
        if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
            if (type === 'expense') {
                dispatch(deleteExpense(transaction._id));
            } else {
                dispatch(deleteRevenue(transaction._id));
            }
        }
    };

    const { summary, expenses, revenues } = annualReport || {};

    return (
        <Box p={{ xs: 1, sm: 2, md: 3 }}>
            <FlexBetween mb={3} flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <Typography variant="h2" component="h1">Annual Financial Report</Typography>
                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <InputLabel>Year</InputLabel>
                    <Select value={selectedYear || ''} onChange={handleYearChange} label="Year" disabled={!availableYears?.length}>
                        {availableYears?.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                    </Select>
                </FormControl>
            </FlexBetween>

            {reportLoading && !annualReport ? <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box> :
                reportError ? <Alert severity="error" sx={{ my: 2 }}>Failed to load report: {reportError.message || 'An unknown error occurred.'}</Alert> :
                    annualReport ? (
                        <>
                            <Grid container spacing={3} mb={4}>
                                <Grid item xs={12} md={4}><SummaryCard title="Total Revenue" value={summary?.totalAnnualRevenues || 0} color={theme.palette.success.dark} /></Grid>
                                <Grid item xs={12} md={4}><SummaryCard title="Total Expenses" value={summary?.totalAnnualExpenses || 0} color={theme.palette.error.dark} /></Grid>
                                <Grid item xs={12} md={4}><SummaryCard title="Net Profit / Loss" value={summary?.annualNetProfit || 0} color={(summary?.annualNetProfit || 0) >= 0 ? theme.palette.primary.dark : theme.palette.warning.dark} /></Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={selectedTransaction ? 6 : 12} sx={{ transition: 'all 0.3s ease-in-out' }}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}><Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth"><Tab label={`Expenses (${expenses?.length || 0})`} /><Tab label={`Revenues (${revenues?.length || 0})`} /></Tabs></Box>
                                    <Box mt={2}>
                                        {currentTab === 0 && <TransactionList transactions={expenses} type="expenses" onTransactionClick={handleTransactionClick} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} selectedId={selectedTransaction?._id} />}
                                        {currentTab === 1 && <TransactionList transactions={revenues} type="revenues" onTransactionClick={handleTransactionClick} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} selectedId={selectedTransaction?._id} />}
                                    </Box>
                                </Grid>
                                {selectedTransaction && (
                                    <Grid item xs={12} md={6}>
                                        <Grow in={!!selectedTransaction}>
                                            <Stack spacing={3}>
                                                <PaymentHistory transaction={selectedTransaction} onClose={handleClosePaymentHistory} />
                                                <TransactionTags transaction={selectedTransaction} />
                                            </Stack>
                                        </Grow>
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    ) : null}
            <TransactionEditModal open={isEditModalOpen} onClose={() => setEditModalOpen(false)} transaction={transactionToEdit} onSave={handleUpdateTransaction} operationLoading={operationLoading} />
        </Box>
    );
};

// --- Prop Types ---
TransactionsPage.propTypes = {};
TransactionList.propTypes = { transactions: PropTypes.array, type: PropTypes.string, onTransactionClick: PropTypes.func, onEdit: PropTypes.func, onDelete: PropTypes.func, selectedId: PropTypes.string };
SummaryCard.propTypes = { title: PropTypes.string, value: PropTypes.number, color: PropTypes.string };
TransactionEditModal.propTypes = { open: PropTypes.bool, onClose: PropTypes.func, transaction: PropTypes.object, onSave: PropTypes.func, operationLoading: PropTypes.bool };

export default TransactionsPage;
