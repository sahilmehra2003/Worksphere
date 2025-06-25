import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography, Box, CircularProgress, Button,
    FormControl, InputLabel, Select, MenuItem, Alert,
    Paper, Grid, Tabs, Tab, TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { createProjectExpense, createProjectRevenue, clearOperationStatus } from '../redux/Slices/transactionSlice';
import { fetchAllProjects } from '../redux/Slices/projectSlice';
import { fetchAllDepartments } from '../redux/Slices/departmentSlice';
import toast from 'react-hot-toast';

// Main component for creating transactions
const AddTransactionDetails = () => {
    const dispatch = useDispatch();
    const theme = useTheme();

    const [currentTab, setCurrentTab] = useState(0); 
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        departmentId: '',
        category: '',
        currency: 'INR',
        notes: ''
    });

    // --- Selectors for dropdown data and form status ---
    const { projects } = useSelector((state) => state.project);
    const { departments } = useSelector((state) => state.department);
    const { operationLoading, operationError, operationSuccess } = useSelector((state) => state.transaction);

    // --- Fetch data for dropdowns on component mount ---
    useEffect(() => {
        dispatch(fetchAllProjects());
        dispatch(fetchAllDepartments());
    }, [dispatch]);

 
    useEffect(() => {
        if (operationSuccess) {
            toast.success('Form submitted successfully');
            handleClear();
            dispatch(clearOperationStatus());
        }
    }, [operationSuccess, dispatch]);


    // --- Handlers for UI interactions ---
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        handleClear(); 
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            projectId: '',
            departmentId: '',
            category: '',
            currency: 'INR',
            notes: ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.amount || !formData.projectId || !formData.departmentId || !formData.category) {
            // In a real app, use a proper validation library like Yup
            alert("Please fill all required fields.");
            return;
        }

        const dataToSubmit = {
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date,
            projectId: formData.projectId,
            department: formData.departmentId,
            category: formData.category,
            currency: formData.currency,
            notes: formData.notes
        };

        if (currentTab === 0) { // Expense
            dispatch(createProjectExpense(dataToSubmit));
        } else { // Revenue
            dispatch(createProjectRevenue(dataToSubmit));
        }
    };

    // --- Define categories based on the current tab ---
    const expenseCategories = ["Project Expenses", "Client Expenses", "Salaries", "Software Subscriptions", "Office Supplies", "Marketing", "Miscellaneous"];
    const revenueCategories = ["Project Revenue", "Client Payment", "Service Fees", "Product Sales", "Other Income"];

    return (
        <Box p={{ xs: 1, sm: 2, md: 3 }}>
            <Paper elevation={4} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Create New Transaction
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={currentTab} onChange={handleTabChange} aria-label="expense and revenue form tabs">
                        <Tab label="Add Expense" />
                        <Tab label="Add Revenue" />
                    </Tabs>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Project Dropdown */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Project</InputLabel>
                                <Select name="projectId" value={formData.projectId} label="Project" onChange={handleChange}>
                                    {projects?.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Department Dropdown */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Department</InputLabel>
                                <Select name="departmentId" value={formData.departmentId} label="Department" onChange={handleChange}>
                                    {departments?.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Category Dropdown */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select name="category" value={formData.category} label="Category" onChange={handleChange}>
                                    {(currentTab === 0 ? expenseCategories : revenueCategories).map(cat => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Amount */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="amount"
                                label="Amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </Grid>

                        {/* Date */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="date"
                                label="Date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Currency Dropdown */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Currency</InputLabel>
                                <Select name="currency" value={formData.currency} label="Currency" onChange={handleChange}>
                                    <MenuItem value="INR">INR</MenuItem>
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                    <MenuItem value="GBP">GBP</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Grid>

                        {/* Notes */}
                        <Grid item xs={12}>
                            <TextField
                                name="notes"
                                label="Notes (Optional)"
                                value={formData.notes}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={handleClear} disabled={operationLoading}>
                                    Clear
                                </Button>
                                <Button type="submit" variant="contained" color="primary" disabled={operationLoading}>
                                    {operationLoading ? <CircularProgress size={24} /> : `Create ${currentTab === 0 ? 'Expense' : 'Revenue'}`}
                                </Button>
                            </Box>
                        </Grid>
                        {/* Error Alert */}
                        {operationError && (
                            <Grid item xs={12}>
                                <Alert severity="error" onClose={() => dispatch(clearOperationStatus())}>
                                    {operationError.message || "Failed to create transaction. Please try again."}
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AddTransactionDetails;
