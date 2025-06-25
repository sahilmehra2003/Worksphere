import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button,  CircularProgress, Alert } from '@mui/material';
import WeekNavigator from './Timesheets/WeekNavigator';
import WeeklyTimesheetGrid from './Timesheets/WeeklyTimesheetGrid';
import TimeSheetForm from './Timesheets/TimesheetForm';
import {
    fetchWeeklyLogs,
    submitWeeklyTimesheet,
    createTimeLog,
    clearTimesheetOperationStatus
} from '../../../redux/Slices/timeSheetSlice';

// Helper function to get the start of the week (Monday)
const getStartOfWeekISO = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0]; // Return as YYYY-MM-DD string
};


const TimesheetTab = () => {
    const dispatch = useDispatch();
    const { weeklyLogs, loading, operationLoading, operationSuccess, operationError } = useSelector((state) => state.timesheet);

    const [currentWeekStartDate, setCurrentWeekStartDate] = useState(getStartOfWeekISO());
    const [isLogModalOpen, setLogModalOpen] = useState(false);

    useEffect(() => {
        // Fetch weekly logs whenever the component mounts or the week changes
        if (currentWeekStartDate) {
            dispatch(fetchWeeklyLogs(currentWeekStartDate));
        }
    }, [dispatch, currentWeekStartDate]);

    // Refetch data after a successful operation
    useEffect(() => {
        if (operationSuccess) {
            dispatch(fetchWeeklyLogs(currentWeekStartDate));
            dispatch(clearTimesheetOperationStatus());
        }
    }, [operationSuccess, dispatch, currentWeekStartDate]);


    const handlePreviousWeek = () => {
        const newDate = new Date(currentWeekStartDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStartDate(getStartOfWeekISO(newDate));
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentWeekStartDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStartDate(getStartOfWeekISO(newDate));
    };

    const handleAddEntry = (logData) => {
        dispatch(createTimeLog(logData));
        setLogModalOpen(false);
    };

    const handleSubmitWeek = () => {
        if (window.confirm("Are you sure you want to submit this week's timesheet? You will not be able to make changes after submitting.")) {
            dispatch(submitWeeklyTimesheet(currentWeekStartDate));
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h2" gutterBottom>
                My Weekly Timesheet
            </Typography>

            <WeekNavigator
                currentDate={new Date(currentWeekStartDate)}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
            />

            <Box my={3}>
                <Button variant="contained" onClick={() => setLogModalOpen(true)} disabled={operationLoading}>
                    Add Time Entry
                </Button>
            </Box>

            {operationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {operationError.error || 'An operation failed. Please try again.'}
                </Alert>
            )}

            <WeeklyTimesheetGrid
                logs={weeklyLogs || []}
                loading={loading}
                currentDate={new Date(currentWeekStartDate)}
            />

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmitWeek}
                    disabled={operationLoading || loading}
                >
                    {operationLoading ? <CircularProgress size={24} /> : 'Submit Week for Approval'}
                </Button>
            </Box>

            <TimeSheetForm
                open={isLogModalOpen}
                onClose={() => setLogModalOpen(false)}
                onSubmit={handleAddEntry}
                operationLoading={operationLoading}
            />
        </Box>
    );
};

export default TimesheetTab;
