// src/pages/UserLeavePage.jsx (Example Path)

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Box, Typography, useTheme, CircularProgress, Alert, Paper, Grid,
    // Ensure all needed MUI components are imported
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select,
    MenuItem, FormControl, InputLabel, Button, Stack, FormHelperText
} from '@mui/material';
// Import the sub-components
import LeaveBalanceDisplay from '../../components/Leave/LeaveBalanceDisplay'; // Adjust path
import LeaveHistoryTable from '../../components/Leave/LeaveHistoryTable'; // Adjust path
import LeaveApplyModal from '../../components/Leave/LeaveApplyModal'; // Adjust path

import axiosInstance from '../../utils/apis'; // Adjust path
// *** Import helper functions from utility file ***
import { isNonWorkingDay, calculateWorkingDaysFrontend, isSameDate } from '../../utils/dateUtils'; // Adjust path


const UserLeavePage = () => {
    const theme = useTheme();
    // --- Placeholder for Auth Context ---
    // !!! REPLACE THIS with your actual user data retrieval mechanism !!!
    const user = JSON.parse(localStorage.getItem('user'))
    console.log(user);
    const employeeId = user?._id; // Make sure this is valid!
    const userCountry = user?.country; // Make sure this is valid!
    // --- End Placeholder ---

    const currentYear = new Date().getFullYear();
    // Define validRange for ONLY the current year if you want to restrict navigation (optional now)
    // const validRange = { start: `${currentYear}-01-01`, end: `${currentYear + 1}-01-01` };
    const calendarRef = useRef(null);

    // === State Variables ===
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [companyCalendar, setCompanyCalendar] = useState({ holidays: [], weekends: [0, 6] }); // Default weekends

    // Loading/Error States
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
    const [errorBalance, setErrorBalance] = useState('');
    const [errorHistory, setErrorHistory] = useState('');
    const [errorCalendar, setErrorCalendar] = useState('');

    // State for the Country dropdown (if needed, otherwise uses user.country)
    // const [availableCountries, setAvailableCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(userCountry || 'IN'); // *** Ensure selectedCountry state exists if you use a dropdown ***

    // Combined Calendar Events State
    const [calendarEvents, setCalendarEvents] = useState([]);

    // Application Modal State
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectionInfo, setSelectionInfo] = useState(null); // Holds { startStr, endStr, start, end }

    // Leave Cancellation State
    const [cancellingId, setCancellingId] = useState(null);


    // === Data Fetching Functions (with full implementation) ===
    const fetchBalance = useCallback(async () => {
        if (!employeeId) return;
        setIsLoadingBalance(true); setErrorBalance('');
        try {
            // Using route confirmed by user (adjust if needed)
            const res = await axiosInstance.get(`http://localhost:4000/leaveSystem/balance`);
            setLeaveBalance(res.data);
        } catch (error) {
            console.error("Error fetching leave balance:", error);
            setErrorBalance(`Failed to load balance: ${error?.response?.data?.message || error.message}`);
        } finally {
            setIsLoadingBalance(false);
        }
    }, [employeeId]);

    const fetchHistory = useCallback(async () => {
        if (!employeeId) return;
        setIsLoadingHistory(true); setErrorHistory('');
        try {
            // Using route confirmed by user (adjust if needed)
            const res = await axiosInstance.get(`http://localhost:4000/leaveSystem/leaves`);
            setLeaveHistory(res.data.leaves || []); // Assuming pagination structure
        } catch (error) {
             console.error("Error fetching leave history:", error);
            setErrorHistory(`Failed to load history: ${error?.response?.data?.message || error.message}`);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [employeeId]);

    const fetchCompanyCalendar = useCallback(async () => {
        // Use user's country directly
        if (!userCountry) {
            setErrorCalendar("User country not available to fetch calendar.");
            return;
        };
        setIsLoadingCalendar(true); setErrorCalendar('');
        try {
            // Using route confirmed by user
            const res = await axiosInstance.get(`http://localhost:4000/calendar/fetchcountrycalender/${userCountry}`);
            setCompanyCalendar({
                holidays: res.data?.holidays || [],
                weekends: res.data?.weekends || [0, 6] // Sensible default
            });
        } catch (error) {
             console.error("Error fetching company calendar:", error);
             setErrorCalendar(`Failed to load company calendar (${userCountry}): ${error?.response?.data?.message || error.message}`);
             setCompanyCalendar({ holidays: [], weekends: [0, 6] }); // Set defaults on error
        } finally {
            setIsLoadingCalendar(false);
        }
    }, [userCountry]); // Depends only on user's country

    // === Initial Data Fetch ===
    useEffect(() => {
        // Ensure we have the necessary user info before fetching
        if (employeeId) {
            fetchBalance();
            fetchHistory();
        }
        if (userCountry) {
            fetchCompanyCalendar();
        }
        // These functions have their own dependency arrays (usually employeeId/userCountry)
        // This effect should run when employeeId or userCountry potentially changes (e.g., on login)
    }, [employeeId, userCountry, fetchBalance, fetchHistory, fetchCompanyCalendar]);

    // === Combine Holidays and Leaves for Calendar Events ===
     useEffect(() => {
         // Ensure companyCalendar and leaveHistory are arrays before mapping
         const holidays = companyCalendar?.holidays || [];
         const history = leaveHistory || [];

         const holidayEvents = holidays.map(h => ({
             // id: `holiday-${h._id}`, // Unique ID if needed
             title: h.name, start: h.date, allDay: true, display: 'background',
             color: theme.palette.action.selected,
             extendedProps: { type: 'holiday' }
         }));

         const userLeaveEvents = history
             .filter(l => ['Pending', 'Approved'].includes(l.status))
             .map(l => ({
                 id: l._id, title: `${l.leaveType} (${l.status})`, start: l.startDate,
                 // Calculate exclusive end date for FullCalendar rendering
                 end: l.endDate ? new Date(new Date(l.endDate).setDate(new Date(l.endDate).getDate() + 1)).toISOString().split('T')[0] : l.startDate,
                 allDay: true,
                 color: l.status === 'Approved' ? theme.palette.primary.light : theme.palette.warning.light,
                 borderColor: l.status === 'Approved' ? theme.palette.primary.main : theme.palette.warning.main,
                 textColor: theme.palette.getContrastText(l.status === 'Approved' ? theme.palette.primary.light : theme.palette.warning.light),
                 extendedProps: { type: 'user-leave', status: l.status }
             }));

         setCalendarEvents([...holidayEvents, ...userLeaveEvents]);
     }, [companyCalendar, leaveHistory, theme]); // Re-run when source data changes

    // === Calendar Interaction Handlers ===
    const handleDateSelect = useCallback((selectInfo) => {
        const start = selectInfo.start;
        let inclusiveEndDate = new Date(selectInfo.end);
        // FullCalendar's 'end' in selection is exclusive, so subtract one day for inclusive range
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);

        // Validate start/end are not non-working days
        if (isNonWorkingDay(start, companyCalendar.weekends, companyCalendar.holidays)) {
            alert("Leave cannot start on a weekend or public holiday.");
            selectInfo.view.calendar.unselect(); // Clear selection visually
            return;
        }
        if (isNonWorkingDay(inclusiveEndDate, companyCalendar.weekends, companyCalendar.holidays)) {
            alert("Leave cannot end on a weekend or public holiday.");
             selectInfo.view.calendar.unselect();
            return;
        }
        // Validate single day selection is not non-working day
        if(isSameDate(start, inclusiveEndDate) && isNonWorkingDay(start, companyCalendar.weekends, companyCalendar.holidays)){
             alert("Cannot select a single non-working day for leave.");
              selectInfo.view.calendar.unselect();
            return;
        }
        // Validate entire range has at least one working day
        const days = calculateWorkingDaysFrontend(start, inclusiveEndDate, companyCalendar.weekends, companyCalendar.holidays);
        if (days <= 0) {
            alert("Selected range must contain at least one working day.");
            selectInfo.view.calendar.unselect();
            return;
        }

        setSelectionInfo(selectInfo); // Store the raw selectInfo
        setIsApplyModalOpen(true);
    }, [companyCalendar]);

    // --- Define handleDayCellDidMount within the component ---
    const handleDayCellDidMount = useCallback((arg) => {
        const dayOfWeek = arg.date.getDay();
        const weekends = companyCalendar?.weekends || [];
        if (weekends.includes(dayOfWeek)) {
             arg.el.style.backgroundColor = theme.palette.action.hover;
        }
        // Optionally, visually indicate holidays differently if not using background events
        // const holidays = companyCalendar?.holidays || [];
        // if (isNonWorkingDay(arg.date, [], holidays)) { // Check only holidays
        //     arg.el.style.border = `1px dashed ${theme.palette.error.light}`;
        // }
     }, [companyCalendar?.weekends, companyCalendar?.holidays, theme.palette.action.hover]); // Update dependencies


    // === API Action Handlers ===
    const handleApplyLeaveSubmit = useCallback(async (formData) => {
        try {
            // Using route confirmed by user
            await axiosInstance.post(`http://localhost:4000/leaveSystem/apply`, formData);
            setIsApplyModalOpen(false);
            await fetchHistory();
            await fetchBalance();
            // Use a more subtle notification (Snackbar) in production
            alert("Leave application submitted successfully!");
        } catch (error) {
            console.error("Error applying for leave:", error);
            // Rethrow the error message for the modal to display
            throw new Error(error?.response?.data?.message || error.message || "Failed to apply leave.");
        }
    }, [fetchHistory, fetchBalance]); // Dependencies

    const handleCancelLeave = useCallback(async (leaveId) => {
        if (!leaveId || cancellingId) return;
        if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
        setCancellingId(leaveId);
        try {
            // Using route confirmed by user (ensure method is PUT/PATCH/DELETE as per backend)
            // Assuming PUT based on previous controller example structure
             await axiosInstance.put(`http://localhost:4000/leaveSystem/leaves/${leaveId}/cancel`); // Adjust URL/method if needed
            await fetchHistory();
            await fetchBalance();
            alert("Leave request cancelled."); // Use Snackbar
        } catch (error) {
            console.error(`Error cancelling leave ${leaveId}:`, error);
            alert(`Failed to cancel leave. ${error?.response?.data?.message || error.message}`);
        } finally {
            setCancellingId(null);
        }
    }, [cancellingId, fetchHistory, fetchBalance]);


    // === Render ===
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom component="h1">My Leave Dashboard</Typography>

            <Grid container spacing={3}>
                {/* Leave Balances */}
                <Grid item xs={12} lg={4}> {/* Adjusted grid size */}
                    <LeaveBalanceDisplay
                        balance={leaveBalance}
                        isLoading={isLoadingBalance}
                        error={errorBalance}
                    />
                </Grid>

                {/* Calendar View */}
                <Grid item xs={12} lg={8}> {/* Adjusted grid size */}
                    <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, /* Styles for FC internals */ }}>
                        <Typography variant="h6" gutterBottom>Calendar (Select Dates to Apply)</Typography>
                        {(isLoadingCalendar || isLoadingHistory || isLoadingBalance) && <CircularProgress size={20} sx={{ mb: 1 }} />}
                        {errorCalendar && <Alert severity="warning" sx={{ mb: 1 }}>{errorCalendar}</Alert>}
                        <Box sx={{ position: 'relative', minHeight: '450px' }}>
                             {/* Render calendar only when required data (weekends/holidays) is available */}
                            {companyCalendar && (
                                <FullCalendar
                                    ref={calendarRef}
                                    key={userCountry + JSON.stringify(companyCalendar.weekends)}
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    weekends={true}
                                    events={calendarEvents}
                                    selectable={true}
                                    selectMirror={true}
                                    selectConstraint = {{ // Example: Prevent selecting non-working days directly (optional)
                                        // dow: [1, 2, 3, 4, 5] // Allow Mon-Fri
                                    }}
                                    selectAllow={(selectInfo) => {
                                        // More fine-grained control: prevent selection ending on non-working day
                                        let end = new Date(selectInfo.end);
                                        end.setDate(end.getDate() - 1); // Make inclusive
                                        return !isNonWorkingDay(end, companyCalendar.weekends, companyCalendar.holidays);
                                      }}
                                    selectOverlap={false}
                                    eventOverlap={false}
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth'
                                    }}
                                    // validRange={validRange} // Keep commented unless needed
                                    dayCellDidMount={handleDayCellDidMount} // Use locally defined handler
                                    select={handleDateSelect}
                                    eventClick={null} // Keep event click disabled for now
                                    // eventDidMount prop can be used for tooltips etc.
                                />
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Leave History */}
                <Grid item xs={12}>
                   <LeaveHistoryTable
                        history={leaveHistory}
                        isLoading={isLoadingHistory}
                        error={errorHistory}
                        onCancel={handleCancelLeave}
                        cancellingId={cancellingId}
                   />
                </Grid>
            </Grid>

            {/* Application Modal */}
             <LeaveApplyModal
                 open={isApplyModalOpen}
                 onClose={() => setIsApplyModalOpen(false)}
                 onSubmit={handleApplyLeaveSubmit}
                 selectionInfo={selectionInfo}
                 balance={leaveBalance}
                 companyCalendar={companyCalendar}
                 calculateWorkingDays={calculateWorkingDaysFrontend} // Pass helper
                 isNonWorkingDay={isNonWorkingDay} // Pass helper
             />

        </Box>
    );
};

export default UserLeavePage;