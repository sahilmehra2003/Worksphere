// src/Pages/Leave Management/UserLeavePage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Box, Typography, useTheme, CircularProgress, Alert, Paper, Grid,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';


import LeaveBalanceDisplay from '../../components/Leave/LeaveBalanceDisplay';
import LeaveHistoryTable from '../../components/Leave/LeaveHistoryTable';
import LeaveApplyModal from '../../components/Leave/LeaveApplyModal';

import {
    fetchMyLeaveBalance,
    fetchMyLeaveHistory,
    fetchCompanyCalendarForCountry, // Use thunk from leaveSlice
    applyForLeave,
    cancelLeaveRequest, // Renamed in slice for clarity
    clearLeaveOperationStatus,
} from '../../redux/Slices/leaveSlice'; // Adjust path

import { isNonWorkingDay, calculateWorkingDaysFrontend, isSameDate } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';
import FlexBetween from '../../components/FlexBetween';
const UserLeavePage = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const calendarRef = useRef(null);

    // --- Selectors ---
    const { user: authUser } = useSelector((state) => state.auth);
    const {
        leaveBalance,
        leaveHistory,
        companyCalendar,
        isLoadingBalance,
        isLoadingHistory,
        isLoadingCalendar,
        isApplyingLeave,
        isCancellingLeave,
        cancellingLeaveId,
        errorBalance,
        errorHistory,
        errorCalendar,
        applyLeaveSuccess,
        cancelLeaveSuccess,
        errorApplyingLeave, // For modal to potentially consume
        errorCancellingLeave, // For modal or general display
    } = useSelector((state) => state.leave);

    const employeeId = authUser?._id;
    const userCountry = authUser?.country; // Example: 'IN'

    // --- Local UI State for Modal ---
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectionInfo, setSelectionInfo] = useState(null); // For FullCalendar date selection

    // --- Initial Data Fetch ---
    useEffect(() => {
        if (employeeId) {
            dispatch(fetchMyLeaveBalance());
            dispatch(fetchMyLeaveHistory({ page: 1, limit: 1000 })); // Fetch all history for now, or implement pagination
        }
        if (userCountry && !companyCalendar.countryCode) { // Fetch only if not already fetched or country changed
            dispatch(fetchCompanyCalendarForCountry(userCountry));
        }
    }, [dispatch, employeeId, userCountry, companyCalendar.countryCode]);


    // Effect for handling global operation success/error feedback
    useEffect(() => {
        if (applyLeaveSuccess) {
            toast.success('Leave application submitted successfully!');
            setIsApplyModalOpen(false); // Close modal on success
            dispatch(clearLeaveOperationStatus());
        }
        if (cancelLeaveSuccess) {
            toast.success('Leave request cancelled successfully!');
            dispatch(clearLeaveOperationStatus());
        }
        // Errors from apply/cancel are now in errorApplyingLeave / errorCancellingLeave
        // The modal can display errorApplyingLeave directly.
        // General page errors (errorBalance, errorHistory, errorCalendar) can be shown separately.
        if (errorApplyingLeave) {
            toast.error(`Apply Failed: ${errorApplyingLeave}`);
            dispatch(clearLeaveOperationStatus());
        }
        if (errorCancellingLeave) {
            toast.error(`Cancel Failed: ${errorCancellingLeave}`);
            dispatch(clearLeaveOperationStatus());
        }

    }, [applyLeaveSuccess, cancelLeaveSuccess, errorApplyingLeave, errorCancellingLeave, dispatch]);


    const calendarEvents = useMemo(() => {
        const holidays = companyCalendar?.holidays || [];
        const history = leaveHistory || [];

        const holidayEvents = holidays.map(h => ({
            id: `holiday-${h._id || h.date}`,
            title: h.name, start: h.date, allDay: true, display: 'background',
            color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
            textColor: theme.palette.text.secondary,
            extendedProps: { type: 'holiday', description: h.description }
        }));

        const userLeaveEvents = history
            .filter(l => ['Pending', 'Approved'].includes(l.status))
            .map(l => ({
                id: l._id, title: `${l.leaveType} (${l.status})`, start: l.startDate,
                end: l.endDate ? new Date(new Date(l.endDate).setDate(new Date(l.endDate).getDate() + 1)).toISOString().split('T')[0] : l.startDate,
                allDay: true,
                color: l.status === 'Approved' ? theme.palette.success.light : theme.palette.warning.light,
                borderColor: l.status === 'Approved' ? theme.palette.success.main : theme.palette.warning.main,
                textColor: theme.palette.getContrastText(l.status === 'Approved' ? theme.palette.success.light : theme.palette.warning.light),
                extendedProps: { type: 'user-leave', status: l.status }
            }));
        return [...holidayEvents, ...userLeaveEvents];
    }, [companyCalendar, leaveHistory, theme]);

    const handleDateSelect = useCallback((selectInfo) => {
        const start = selectInfo.start;
        let inclusiveEndDate = new Date(selectInfo.end);
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);

        const weekends = companyCalendar?.weekends || [];
        const holidays = companyCalendar?.holidays || [];

        if (isNonWorkingDay(start, weekends, holidays)) {
            toast.error("Leave cannot start on a weekend or public holiday.");
            selectInfo.view.calendar.unselect(); return;
        }
        if (isNonWorkingDay(inclusiveEndDate, weekends, holidays)) {
            toast.error("Leave cannot end on a weekend or public holiday.");
            selectInfo.view.calendar.unselect(); return;
        }
        if (isSameDate(start, inclusiveEndDate) && isNonWorkingDay(start, weekends, holidays)) {
            toast.error("Cannot select a single non-working day for leave.");
            selectInfo.view.calendar.unselect(); return;
        }
        const days = calculateWorkingDaysFrontend(start, inclusiveEndDate, weekends, holidays);
        if (days <= 0) {
            toast.error("Selected range must contain at least one working day.");
            selectInfo.view.calendar.unselect(); return;
        }

        setSelectionInfo(selectInfo);
        setIsApplyModalOpen(true);
    }, [companyCalendar]);

    const handleDayCellDidMount = useCallback((arg) => {
        const dayOfWeek = arg.date.getDay();
        const weekends = companyCalendar?.weekends || [];
        if (weekends.includes(dayOfWeek)) {
            arg.el.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.action.hover;
        }
    }, [companyCalendar?.weekends, theme.palette.mode, theme.palette.action.hover]);

    const handleApplyLeaveSubmitThunk = useCallback(async (formData) => {
        // This function is passed to the modal. It dispatches the Redux thunk.
        // The modal's try/catch can handle UI updates during submission.
        return dispatch(applyForLeave(formData)).unwrap(); // unwrap to allow modal to catch rejection
    }, [dispatch]);

    const handleCancelLeaveRequest = useCallback(async (leaveId) => {
        if (!leaveId || isCancellingLeave) return; // Prevent multiple clicks if already cancelling
        if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
        dispatch(cancelLeaveRequest(leaveId));
    }, [dispatch, isCancellingLeave]);

    if (!authUser) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography>Authenticating user...</Typography>
                <CircularProgress sx={{ ml: 2 }} />
            </Box>
        );
    }

    const isLoadingAnyData = isLoadingBalance || isLoadingHistory || isLoadingCalendar;

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <FlexBetween mb={3}>
                <Typography variant="h4" gutterBottom component="h1" sx={{ color: theme.palette.text.primary }}>
                    My Leave Dashboard
                </Typography>
               
            </FlexBetween>


            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <LeaveBalanceDisplay
                        balance={leaveBalance}
                        isLoading={isLoadingBalance}
                        error={errorBalance}
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                            My Calendar (Select Dates to Apply or View Leaves)
                        </Typography>
                        {isLoadingCalendar && <CircularProgress size={20} sx={{ mb: 1 }} />}
                        {errorCalendar && <Alert severity="warning" sx={{ mb: 1 }}>Company Calendar for {userCountry}: {errorCalendar}</Alert>}
                        <Box sx={{ position: 'relative', minHeight: '450px' }}>
                            {(companyCalendar && companyCalendar.weekends && !isLoadingCalendar) ? (
                                <FullCalendar
                                    ref={calendarRef}
                                    key={userCountry + JSON.stringify(companyCalendar.weekends)}
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    weekends={true}
                                    events={calendarEvents}
                                    selectable={true}
                                    selectMirror={true}
                                    selectAllow={(selectInfo) => {
                                        let end = new Date(selectInfo.end);
                                        end.setDate(end.getDate() - 1);
                                        return selectInfo.start && end && selectInfo.start <= end; // Basic check, more in handleDateSelect
                                    }}
                                    selectOverlap={false}
                                    eventOverlap={false}
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth'
                                    }}
                                    dayCellDidMount={handleDayCellDidMount}
                                    select={handleDateSelect}
                                    eventClick={null} // Not handling event clicks on calendar for now
                                />
                            ) : (
                                !isLoadingCalendar && <Alert severity="info">Loading company calendar or not available for {userCountry}.</Alert>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <LeaveHistoryTable
                        history={leaveHistory}
                        isLoading={isLoadingHistory}
                        error={errorHistory}
                        onCancel={handleCancelLeaveRequest}
                        cancellingId={cancellingLeaveId}
                    />
                </Grid>
            </Grid>

            <LeaveApplyModal
                open={isApplyModalOpen}
                onClose={() => {
                    setIsApplyModalOpen(false);
                    setSelectionInfo(null); // Clear selection when modal closes
                }}
                onSubmit={handleApplyLeaveSubmitThunk} // Passes the thunk dispatcher
                selectionInfo={selectionInfo}
                balance={leaveBalance}
                companyCalendar={companyCalendar}
                calculateWorkingDays={calculateWorkingDaysFrontend}
                isNonWorkingDay={isNonWorkingDay}
            // Applying leave loading state is now directly from Redux: `isApplyingLeave`
            />
        </Box>
    );
};

export default UserLeavePage;