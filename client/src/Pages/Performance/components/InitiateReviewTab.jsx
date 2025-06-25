import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Paper
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { fetchAllReviewCycles } from '../../../redux/Slices/reviewCycleSlice';
import { fetchAllEmployeesInternal } from '../../../redux/Slices/employeeSlice';
import { createPerformanceReview, clearPerformanceReviewOperationStatus } from '../../../redux/Slices/performanceReviewSlice';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const InitiateReviewTab = () => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const reviewCycles = useSelector(state => state.reviewCycle.reviewCycles);
    const cyclesLoading = useSelector(state => state.reviewCycle.loadingList);
    const employees = useSelector(state => state.employee.employees);
    const employeesLoading = useSelector(state => state.employee.loading);
    const { operationLoading, operationError, operationSuccess } = useSelector(state => state.performanceReview);

    const [selectedCycle, setSelectedCycle] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');

    // Load data on component mount
    useEffect(() => {
        if (token) {
            dispatch(fetchAllReviewCycles({ token }));
            dispatch(fetchAllEmployeesInternal({ token }));
        }
    }, [dispatch, token]);

    // Clear operation status when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearPerformanceReviewOperationStatus());
        };
    }, [dispatch]);

    const handleInitiateReview = useCallback(() => {
        if (!selectedCycle || !selectedEmployee) return;

        dispatch(createPerformanceReview({
            reviewData: {
                employeeId: selectedEmployee,
                reviewCycleId: selectedCycle
            },
            token
        }));
    }, [dispatch, selectedCycle, selectedEmployee, token]);

    const handleSuccess = useCallback(() => {
        setSelectedCycle('');
        setSelectedEmployee('');
        dispatch(clearPerformanceReviewOperationStatus());
    }, [dispatch]);

    if (cyclesLoading || employeesLoading) {
        return <LoadingSpinner message="Loading data..." />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Start a New Performance Review
            </Typography>

            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Active Review Cycle</InputLabel>
                            <Select
                                value={selectedCycle}
                                label="Select Active Review Cycle"
                                onChange={(e) => setSelectedCycle(e.target.value)}
                                disabled={cyclesLoading}
                            >
                                {reviewCycles
                                    .filter(cycle => cycle.status === 'Active')
                                    .map(cycle => (
                                        <MenuItem key={cycle._id} value={cycle._id}>
                                            {cycle.name} {cycle.year}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Employee</InputLabel>
                            <Select
                                value={selectedEmployee}
                                label="Select Employee"
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                disabled={employeesLoading}
                            >
                                {employees.map(emp => (
                                    <MenuItem key={emp._id} value={emp._id}>
                                        {emp.name} - {emp.position}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={handleInitiateReview}
                            disabled={!selectedCycle || !selectedEmployee || operationLoading}
                            size="large"
                        >
                            {operationLoading ? 'Initiating...' : 'Initiate Review'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Success Message */}
            {operationSuccess && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={handleSuccess}
                >
                    Review initiated successfully! The employee will be notified to complete their self-assessment.
                </Alert>
            )}

            {/* Error Message */}
            {operationError && (
                <ErrorDisplay message={operationError} />
            )}

            {/* Instructions */}
            <Paper elevation={1} sx={{ p: 3, bgcolor: (theme) => theme.palette.background.paper }}>
                <Typography variant="h6" gutterBottom>
                    Instructions
                </Typography>
                <Typography variant="body2" paragraph>
                    • Select an active review cycle from the dropdown
                </Typography>
                <Typography variant="body2" paragraph>
                    • Choose the employee for whom you want to initiate a performance review
                </Typography>
                <Typography variant="body2" paragraph>
                    • Click &quot;Initiate Review&quot; to start the process
                </Typography>
                <Typography variant="body2" paragraph>
                    • The employee will be notified to complete their self-assessment
                </Typography>
                <Typography variant="body2">
                    • Once self-assessment is submitted, the manager can provide their review
                </Typography>
            </Paper>
        </Box>
    );
};

export default InitiateReviewTab; 