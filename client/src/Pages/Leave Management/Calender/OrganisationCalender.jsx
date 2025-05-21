// CompanyHolidayCalendar.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Box, Typography, useTheme, CircularProgress, Alert, Paper, Grid,
    FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel,
    Checkbox, TextField, Button, Stack, FormHelperText, Dialog,
    DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllConfiguredCalendars,
    fetchCountryCalendarDetails,
    upsertCountryCalendar,
    addCustomHoliday,
    deleteHoliday,
    clearCalendarOperationStatus,
    // setSelectedCalendarCountry, // We might manage selectedCountry locally for UI control
} from '../../../redux/Slices/calenderSlice'; // Adjust path as needed
import { toast } from 'react-hot-toast';


const CompanyHolidayCalendar = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const currentYear = new Date().getFullYear();
    const calendarRef = useRef(null);

    // --- Selectors for Redux State ---
    const {
        configuredCalendars,
        currentCalendarDetails,
        loadingList, // For fetching the list of configured calendars
        loadingDetails, // For fetching details of a specific calendar
        operationLoading, // For CUD operations (upsert, add/delete holiday)
        error, // General error for list/details fetching
        operationError,
        operationSuccess,
    } = useSelector((state) => state.calendar);

    // === Local State for UI Control ===
    const [selectedCountry, setSelectedCountry] = useState('IN'); // Default or from a saved preference

    // Form state for manual upsert (whole calendar)
    const [formWeekends, setFormWeekends] = useState([0, 6]); // Default: Sun, Sat
    const [formYear, setFormYear] = useState(''); // Optional year for manual upsert form
    const [formCountry, setFormCountry] = useState('IN'); // Country for the form, synced with selectedCountry

    // State for Add Holiday Dialog
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);
    const [addHolidayName, setAddHolidayName] = useState('');
    const [addHolidayDescription, setAddHolidayDescription] = useState('');

    // State for Delete Holiday Dialog
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null);


    // === Effects for Data Fetching & Handling ===

    // Fetch list of configured countries on mount
    useEffect(() => {
        dispatch(fetchAllConfiguredCalendars());
    }, [dispatch]);

    // Fetch details when selectedCountry changes or if configuredCalendars list updates
    // and selectedCountry is valid & present in the list.
    useEffect(() => {
        if (selectedCountry) {
            dispatch(fetchCountryCalendarDetails(selectedCountry));
        }
        // Sync formCountry with selectedCountry from dropdown
        setFormCountry(selectedCountry);
    }, [selectedCountry, dispatch]);

    // Initialize selectedCountry if list is loaded and no country is selected, or if current selection is no longer valid
    useEffect(() => {
        if (!loadingList && configuredCalendars.length > 0) {
            const currentSelectionIsValid = configuredCalendars.some(c => c.country === selectedCountry);
            if (!selectedCountry || !currentSelectionIsValid) {
                setSelectedCountry(configuredCalendars[0].country); // Select the first available one
            }
        } else if (!loadingList && configuredCalendars.length === 0) {
            setSelectedCountry(''); // No calendars configured
        }
    }, [configuredCalendars, loadingList, selectedCountry]);


    // Effect for handling operation success/error feedback
    useEffect(() => {
        if (operationSuccess) {
            toast.success('Operation successful!');
            dispatch(clearCalendarOperationStatus()); // Reset status
        }
        if (operationError) {
            toast.error(operationError);
            dispatch(clearCalendarOperationStatus()); // Reset status
        }
    }, [operationSuccess, operationError, dispatch]);


    // === Event Formatting for FullCalendar ===
    const events = useMemo(() => {
        if (!currentCalendarDetails || !currentCalendarDetails.holidays) return [];
        return currentCalendarDetails.holidays.map((holiday) => ({
            id: holiday._id,
            title: holiday.name,
            start: holiday.date, // Ensure this is a format FullCalendar understands (e.g., YYYY-MM-DD or Date object)
            allDay: true,
            backgroundColor: theme.palette.success.main,
            borderColor: theme.palette.success.dark,
            textColor: theme.palette.common.white,
            extendedProps: { description: holiday.description }
        }));
    }, [currentCalendarDetails, theme]);

    const validRange = {
        start: `${currentYear}-01-01`,
        end: `${currentYear + 1}-01-01`
    };

    // === Click Handlers for Calendar Interaction ===
    const handleDateClick = useCallback((clickInfo) => {
        setSelectedDateForAdd(clickInfo.dateStr);
        setAddHolidayName('');
        setAddHolidayDescription('');
        // setModalError(''); // operationError from Redux slice will be used
        setIsAddModalOpen(true);
    }, []);

    const handleEventClick = useCallback((clickInfo) => {
        clickInfo.jsEvent.preventDefault();
        setHolidayToDelete({
            id: clickInfo.event.id,
            name: clickInfo.event.title,
            dateStr: clickInfo.event.startStr
        });
        // setModalError(''); // operationError from Redux slice
        setIsDeleteModalOpen(true);
    }, []);

    // === Form Handlers ===
    const handleWeekendChange = (event) => {
        const { value, checked } = event.target;
        const dayIndex = parseInt(value, 10);
        setFormWeekends(prev =>
            checked
                ? [...prev, dayIndex].sort((a, b) => a - b)
                : prev.filter(day => day !== dayIndex)
        );
    };

    const handleUpsertSubmit = async (event) => {
        event.preventDefault();
        if (!formCountry || formWeekends.length === 0) {
            toast.error('Country code and at least one weekend day are required.');
            return;
        }
        const yearToUpsert = formYear ? parseInt(formYear, 10) : currentYear;
        const payload = {
            country: formCountry.toUpperCase(),
            weekends: formWeekends,
            year: yearToUpsert
        };
        dispatch(upsertCountryCalendar(payload));
        // Success/error handled by useEffect watching operationStatus
        // Optionally reset formYear if desired after submit
        // setFormYear('');
    };

    // === Modal Action Handlers ===
    const handleAddHolidaySubmit = async () => {
        if (!addHolidayName || !selectedDateForAdd || !selectedCountry) {
            toast.error("Holiday name and date are required.");
            return;
        }
        const payload = {
            countryCode: selectedCountry,
            holidayData: {
                name: addHolidayName,
                date: selectedDateForAdd,
                description: addHolidayDescription || undefined,
            }
        };
        dispatch(addCustomHoliday(payload));
        setIsAddModalOpen(false); // Close modal optimistically or on success
    };

    const handleDeleteHolidayConfirm = async () => {
        if (!holidayToDelete || !selectedCountry) return;
        dispatch(deleteHoliday({ countryCode: selectedCountry, holidayId: holidayToDelete.id }));
        setIsDeleteModalOpen(false); // Close modal optimistically or on success
    };

    const handleDayCellDidMount = useCallback((arg) => {
        const dayOfWeek = arg.date.getDay();
        const weekends = currentCalendarDetails?.weekends || [];
        if (weekends.includes(dayOfWeek)) {
            arg.el.style.backgroundColor = theme.palette.action.hover;
        }
    }, [currentCalendarDetails?.weekends, theme.palette.action.hover]);

    const daysOfWeek = [
        { label: 'Sun', value: 0 }, { label: 'Mon', value: 1 }, { label: 'Tue', value: 2 },
        { label: 'Wed', value: 3 }, { label: 'Thu', value: 4 }, { label: 'Fri', value: 5 },
        { label: 'Sat', value: 6 },
    ];

    // === Render ===
    if (loadingList && configuredCalendars.length === 0) { // Initial full page load for country list
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
    }

    return (
        <Grid container spacing={3} p={2}> {/* Added padding to main container */}
            {/* Upsert Form Section (Left Panel) */}
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ padding: theme.spacing(3), height: '100%' }}>
                    <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main }}>
                        Manage Calendar
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Create/Update country calendar, fetch holidays, and set weekends.
                    </Typography>
                    <Box component="form" onSubmit={handleUpsertSubmit} noValidate sx={{ mt: 2 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="Country Code (2 Letters)"
                                variant="outlined"
                                value={formCountry}
                                onChange={(e) => setFormCountry(e.target.value.toUpperCase())}
                                required
                                inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                                error={!formCountry && operationLoading} // Example error state
                                helperText={!formCountry && operationLoading ? 'Country code is required' : ''}
                            />
                            <FormControl component="fieldset" variant="standard">
                                <Typography variant="subtitle1" gutterBottom>Weekend Days</Typography>
                                <FormGroup row>
                                    {daysOfWeek.map(day => (
                                        <FormControlLabel
                                            key={day.value}
                                            control={<Checkbox checked={formWeekends.includes(day.value)} onChange={handleWeekendChange} value={day.value} size="small" />}
                                            label={day.label}
                                        // sx={{ color: 'text.primary' }} // Ensure checkbox label is visible
                                        />
                                    ))}
                                </FormGroup>
                                {formWeekends.length === 0 && <FormHelperText error>Select at least one weekend day</FormHelperText>}
                            </FormControl>
                            <TextField
                                label={`Year (Default: ${currentYear})`}
                                variant="outlined"
                                type="number"
                                value={formYear}
                                onChange={(e) => setFormYear(e.target.value)}
                                placeholder={`${currentYear}`}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={operationLoading || !formCountry || formWeekends.length === 0}
                            >
                                {operationLoading ? <CircularProgress size={24} color="inherit" /> : 'Save / Fetch Calendar'}
                            </Button>
                            {/* General operation error from Redux can be shown here or via toast */}
                        </Stack>
                    </Box>
                </Paper>
            </Grid>

            {/* Calendar Display Section (Right Panel) */}
            <Grid item xs={12} md={8}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: theme.spacing(2), // Adjusted padding
                        backgroundColor: theme.palette.background.paper,
                        '& .fc-daygrid-day-number': { color: theme.palette.text.primary, '& a': { color: theme.palette.text.primary } },
                        '& .fc-col-header-cell-cushion': { color: theme.palette.text.secondary, '& a': { color: theme.palette.text.secondary } },
                        '& .fc-button.fc-button-disabled': { opacity: 0.5, cursor: 'not-allowed' },
                        '& .fc-event': { cursor: 'pointer' },
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
                            Holiday Calendar ({selectedCountry || 'N/A'})
                        </Typography>
                        {loadingList ? <CircularProgress size={24} /> : (configuredCalendars.length > 0 &&
                            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                <InputLabel id="country-select-label">View Country</InputLabel>
                                <Select
                                    labelId="country-select-label"
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                    label="View Country"
                                >
                                    {configuredCalendars.map((c) => (
                                        <MenuItem key={c._id || c.country} value={c.country}>
                                            {c.country}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>

                    {loadingDetails && <Box textAlign="center" p={5}><CircularProgress /></Box>}
                    {error && !loadingDetails && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!loadingDetails && !error && currentCalendarDetails && (
                        <FullCalendar
                            ref={calendarRef}
                            key={selectedCountry}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            height="auto" // Or a fixed height like "650px"
                            events={events}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth'
                            }}
                            validRange={validRange}
                            dayCellDidMount={handleDayCellDidMount}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            eventDidMount={(info) => {
                                if (info.event.extendedProps.description) {
                                    info.el.setAttribute('title', info.event.extendedProps.description);
                                }
                            }}
                        />
                    )}
                    {!loadingDetails && !error && !currentCalendarDetails && selectedCountry && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No detailed calendar data found for {selectedCountry}. Use the form to create/fetch it.
                        </Alert>
                    )}
                    {!loadingDetails && !selectedCountry && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Select a country to view its calendar or create a new one.
                        </Alert>
                    )}
                </Paper>
            </Grid>

            {/* --- Add Holiday Dialog --- */}
            <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Add New Holiday</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" gutterBottom>
                        For Country: <strong>{selectedCountry}</strong> on Date: <strong>{selectedDateForAdd}</strong>
                    </Typography>
                    <TextField
                        autoFocus margin="dense" id="name" label="Holiday Name" type="text"
                        fullWidth variant="standard" required value={addHolidayName}
                        onChange={(e) => setAddHolidayName(e.target.value)}
                        error={operationLoading && !addHolidayName} // Basic error if submitting without name
                    />
                    <TextField
                        margin="dense" id="description" label="Description (Optional)" type="text"
                        fullWidth variant="standard" value={addHolidayDescription}
                        onChange={(e) => setAddHolidayDescription(e.target.value)}
                    />
                    {/* operationError for modal will be shown via toast from main useEffect */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddModalOpen(false)} disabled={operationLoading}>Cancel</Button>
                    <Button
                        onClick={handleAddHolidaySubmit}
                        disabled={operationLoading || !addHolidayName}
                        variant="contained"
                    >
                        {operationLoading ? <CircularProgress size={20} color="inherit" /> : "Add Holiday"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- Confirm Delete Holiday Dialog --- */}
            <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the holiday:
                        <br />
                        <strong>{holidayToDelete?.name}</strong> on {holidayToDelete?.dateStr}?
                    </Typography>
                    {/* operationError for modal will be shown via toast from main useEffect */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteModalOpen(false)} disabled={operationLoading}>Cancel</Button>
                    <Button
                        onClick={handleDeleteHolidayConfirm}
                        color="error"
                        variant="contained"
                        disabled={operationLoading}
                    >
                        {operationLoading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default CompanyHolidayCalendar;