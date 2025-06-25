import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography, Box, CircularProgress, Button,
    FormControl, InputLabel, Select, MenuItem, Alert,
    Paper, Grid, Divider, TextField, Chip, Autocomplete
} from '@mui/material';
import {
    createRecurringExpense,
    fetchRecurringExpenses,
    clearOperationStatus
} from '../../redux/Slices/transactionSlice';
import { fetchAllDepartments } from '../../redux/Slices/departmentSlice';

// --- Main Page Component ---
const RecurringTransactions = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        frequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        departmentId: '',
        currency: 'INR',
        notes: '',
        tags: [],
        paymentMethod: 'Bank Transfer'
    });

    const { departments } = useSelector((state) => state.department);
    const { recurringTransactions, loading, operationLoading, operationError, operationSuccess } = useSelector((state) => state.transaction);

    useEffect(() => {
        dispatch(fetchAllDepartments());
        dispatch(fetchRecurringExpenses());
    }, [dispatch]);

    useEffect(() => {
        if (operationSuccess) {
            alert('Recurring transaction entry created successfully!');
            handleClear();
            dispatch(clearOperationStatus());
            dispatch(fetchRecurringExpenses()); // Refresh the list after creation
        }
    }, [operationSuccess, dispatch]);

    const handleClear = () => {
        setFormData({
            description: '', amount: '', category: '',
            frequency: 'Monthly', startDate: new Date().toISOString().split('T')[0], endDate: '',
            departmentId: '', currency: 'INR', notes: '', tags: [], paymentMethod: 'Bank Transfer'
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createRecurringExpense(formData));
    };

    const expenseCategories = ["Salaries", "Software Subscriptions", "Office Supplies", "Marketing", "Miscellaneous"];

    return (
        <Box p={{ xs: 1, sm: 2, md: 3 }}>
            <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography variant="h2" component="h1" gutterBottom>Manage Recurring Transactions</Typography>

                <form onSubmit={handleSubmit}>
                    <Typography variant="h5" sx={{ mb: 2 }}>Create New Recurring Expense</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Category</InputLabel><Select name="category" value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>{expenseCategories.map(cat => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Department</InputLabel><Select name="departmentId" value={formData.departmentId} label="Department" onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>{departments?.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth required name="amount" label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Frequency</InputLabel><Select name="frequency" value={formData.frequency} label="Frequency" onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}><MenuItem value="Monthly">Monthly</MenuItem><MenuItem value="Quarterly">Quarterly</MenuItem><MenuItem value="Yearly">Yearly</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth required name="startDate" label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth name="endDate" label="End Date (Optional)" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Currency</InputLabel><Select name="currency" value={formData.currency} label="Currency" onChange={(e) => setFormData({ ...formData, currency: e.target.value })}><MenuItem value="INR">INR</MenuItem><MenuItem value="USD">USD</MenuItem><MenuItem value="EUR">EUR</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Payment Method</InputLabel><Select name="paymentMethod" value={formData.paymentMethod} label="Payment Method" onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}><MenuItem value="Bank Transfer">Bank Transfer</MenuItem><MenuItem value="Credit Card">Credit Card</MenuItem><MenuItem value="Cash">Cash</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12}><TextField fullWidth name="description" label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></Grid>
                        <Grid item xs={12}><Autocomplete multiple options={[]} value={formData.tags} onChange={(event, newValue) => { setFormData({ ...formData, tags: newValue }); }} freeSolo renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" label={option} {...getTagProps({ index })} />))} renderInput={(params) => (<TextField {...params} variant="outlined" label="Tags (Optional)" placeholder="Add tags" />)} /></Grid>
                        <Grid item xs={12}><TextField fullWidth name="notes" label="Notes (Optional)" multiline rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={handleClear} disabled={operationLoading}>Clear</Button>
                            <Button type="submit" variant="contained" disabled={operationLoading}>
                                {operationLoading ? <CircularProgress size={24} /> : "Create Recurring Rule"}
                            </Button>
                        </Grid>
                        {operationError && <Grid item xs={12}><Alert severity="error">{operationError.message || "Failed to create entry."}</Alert></Grid>}
                    </Grid>
                </form>

                <Divider sx={{ my: 4 }} />

                <Box mt={2}>
                    <Typography variant="h5" sx={{ mb: 2 }}>Existing Recurring Transactions</Typography>
                    {loading ? <CircularProgress /> :
                        recurringTransactions.length > 0 ? (
                            <Grid container spacing={2}>
                                {recurringTransactions.map(item => (
                                    <Grid item xs={12} md={6} key={item._id}>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="h6">{item.category}</Typography>
                                            <Typography color="text.secondary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: item.currency || 'INR' }).format(item.amount)} / {item.recurring.frequency}</Typography>
                                            <Typography variant="body2">{item.description}</Typography>
                                            <Typography variant="caption" color="text.secondary">Starts: {new Date(item.recurring.startDate).toLocaleDateString()}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography>No recurring transactions have been set up yet.</Typography>
                            </Paper>
                        )}
                </Box>
            </Paper>
        </Box>
    );
};

export default RecurringTransactions;
