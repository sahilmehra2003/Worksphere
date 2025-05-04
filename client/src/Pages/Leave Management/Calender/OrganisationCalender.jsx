// CompanyHolidayCalendar.jsx
import  { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // <--- Import interaction plugin
import {
    Box,
    Typography,
    useTheme,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    Button,
    Stack,
    FormHelperText,
    // Dialog related imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import axiosInstance from '../../../utils/apis'; // Adjust path as needed

const CompanyHolidayCalendar = () => {
    const theme = useTheme();
    const currentYear = new Date().getFullYear(); // e.g., 2025

    // Define validRange for ONLY the current year to restrict navigation
    const validRange = {
        start: `${currentYear}-01-01`,
        end: `${currentYear + 1}-01-01` // End is exclusive
    };

    // Ref for FullCalendar API access if needed later
    const calendarRef = useRef(null);

    // === State Variables ===
    const [calendarData, setCalendarData] = useState(null); // Holds { holidays: [], weekends: [] }
    const [isLoading, setIsLoading] = useState(false); // Loading main calendar data
    const [fetchError, setFetchError] = useState(''); // Error fetching main calendar data
    const [availableCountries, setAvailableCountries] = useState([]); // List for dropdown
    const [selectedCountry, setSelectedCountry] = useState('IN'); // Currently viewed country

    // Form state for manual upsert (whole calendar)
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for the main form submission
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' }); // Feedback for main form
    const [formWeekends, setFormWeekends] = useState([0, 6]); // Weekends for the form
    const [formYear, setFormYear] = useState(''); // Optional year for manual upsert form
    const [formCountry, setFormCountry] = useState('IN'); // Country for the form

    // State for Add Holiday Dialog
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDateForAdd, setSelectedDateForAdd] = useState(null); // Clicked date 'YYYY-MM-DD'
    const [addHolidayName, setAddHolidayName] = useState(''); // Name input in Add Dialog
    const [addHolidayDescription, setAddHolidayDescription] = useState(''); // Description input in Add Dialog

    // State for Delete Holiday Dialog
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null); // { id: '...', name: '...', dateStr: '...' }

    // State for API calls within modals
    const [isModalSubmitting, setIsModalSubmitting] = useState(false); // Loading state for dialog actions
    const [modalError, setModalError] = useState(''); // Error message inside dialogs

    // === Data Fetching & Handling ===
    const fetchAvailableCountries = useCallback(async () => {
        // Fetches list of countries that have calendars saved
        try {
            const res = await axiosInstance.get('http://localhost:4000/calendar/fetchAll'); // User confirmed route
            if (res.data && Array.isArray(res.data)) {
                setAvailableCountries(res.data);
                // Sync form/selection state if needed
                if (res.data.length > 0 && !res.data.some(c => c.country === selectedCountry)) {
                    const firstCountry = res.data[0].country;
                    setSelectedCountry(firstCountry);
                    setFormCountry(firstCountry);
                } else if (res.data.length === 0) {
                    setSelectedCountry('');
                    setFormCountry('');
                } else {
                    setFormCountry(selectedCountry); // Sync form country with selected
                }
            }
        } catch (error) {
            console.error('Failed to fetch available countries:', error);
            setFetchError('Could not load list of countries.');
        }
    }, [selectedCountry]); // Dependency needed? Maybe only on mount.

    const fetchCalendarData = useCallback(async (countryCode) => {
        // Fetches the full calendar data (holidays, weekends) for the selected country
        if (!countryCode) {
            setCalendarData(null);
            return;
        }
        setIsLoading(true);
        setFetchError('');
        setCalendarData(null);
        try {
            const res = await axiosInstance.get(`http://localhost:4000/calendar/fetchcountrycalender/${countryCode}`); // User confirmed route
            console.log('Fetched Calendar Data:', res.data);
            if (res.data && Array.isArray(res.data.holidays) && Array.isArray(res.data.weekends)) {
                setCalendarData(res.data); // Expecting { holidays: [...], weekends: [...] }
            } else {
                // Handle valid response but missing data
                setCalendarData({ holidays: [], weekends: res.data?.weekends || [] });
                console.warn("Received data structure missing holidays/weekends for:", countryCode);
                // Optionally set a specific fetch error if data is incomplete but response was 200
                // setFetchError(`Incomplete calendar data for ${countryCode}.`);
            }
        } catch (error) {
            console.error(`Failed to fetch calendar for ${countryCode}:`, error);
            if (error.response?.status === 404) {
                 setFetchError(`Calendar data not found for ${countryCode}. Use the form to create it.`);
            } else {
                setFetchError(`Failed to load calendar for ${countryCode}. ${error?.response?.data?.message || error.message}`);
            }
            setCalendarData(null); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies needed if it's only called with explicit countryCode

    // === Effects ===
    useEffect(() => {
        fetchAvailableCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Fetch countries only once on mount

    useEffect(() => {
        // Fetch main calendar data when the selected country changes
        fetchCalendarData(selectedCountry);
    }, [selectedCountry, fetchCalendarData]);

    // === Event Formatting for FullCalendar ===
    const events = useMemo(() => {
        if (!calendarData || !calendarData.holidays) return [];
        return calendarData.holidays.map((holiday) => ({
            id: holiday._id, // *** Store the database ID ***
            title: holiday.name,
            start: holiday.date, // Expecting Date object from backend transformation
            allDay: true,
            backgroundColor: theme.palette.success.main,
            borderColor: theme.palette.success.dark,
            textColor: theme.palette.common.white,
            extendedProps: { description: holiday.description }
        }));
    }, [calendarData, theme]);

    // === Click Handlers for Calendar Interaction ===
    const handleDateClick = useCallback((clickInfo) => {
        // Opens the Add Holiday modal
        console.log('Date clicked:', clickInfo.dateStr);
        setSelectedDateForAdd(clickInfo.dateStr);
        setAddHolidayName(''); // Clear previous input
        setAddHolidayDescription(''); // Clear previous input
        setModalError('');
        setIsAddModalOpen(true);
    }, []);

    const handleEventClick = useCallback((clickInfo) => {
        // Opens the Delete Holiday confirmation modal
        clickInfo.jsEvent.preventDefault(); // Prevent default action (like link navigation)
        console.log('Event clicked:', clickInfo.event);
        setHolidayToDelete({
            id: clickInfo.event.id, // The holiday._id
            name: clickInfo.event.title,
            dateStr: clickInfo.event.startStr // YYYY-MM-DD string
        });
        setModalError('');
        setIsDeleteModalOpen(true);
    }, []);

    // === Form Handlers ===
    const handleWeekendChange = (event) => {
        // Updates weekend selection for the main upsert form
        const { value, checked } = event.target;
        const dayIndex = parseInt(value, 10);
        setFormWeekends(prev =>
            checked
                ? [...prev, dayIndex].sort((a, b) => a - b)
                : prev.filter(day => day !== dayIndex)
        );
    };

    const handleUpsertSubmit = async (event) => {
        // Handles submission of the main form to create/update whole calendar
        event.preventDefault();
        if (!formCountry || formWeekends.length === 0) {
             setSubmitStatus({ type: 'error', message: 'Country code and at least one weekend day are required.' });
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });
        const yearToUpsert = formYear ? parseInt(formYear, 10) : currentYear;
        const payload = {
            country: formCountry.toUpperCase(),
            weekends: formWeekends,
            year: yearToUpsert
        };
        console.log("payload:",payload)
        try {
            const res = await axiosInstance.post('http://localhost:4000/calendar/create', payload); // User confirmed route
            setSubmitStatus({ type: 'success', message: `Calendar for ${res.data.country} (Year ${yearToUpsert}) processed successfully!` });
            await fetchAvailableCountries(); // Refresh country list
             if (payload.country === selectedCountry) {
                 await fetchCalendarData(selectedCountry); // Refresh view if current country updated
             } else {
                 // Optionally switch view to the updated country
                 // setSelectedCountry(payload.country);
             }
            setFormYear('');
        } catch (error) {
            console.error('Failed to upsert calendar:', error);
            setSubmitStatus({ type: 'error', message: `Failed to save calendar. ${error?.response?.data?.message || error.message}` });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus({ type: '', message: '' }), 7000);
        }
    };

    // === Modal Action Handlers ===
    const handleAddHoliday = async () => {
        // Triggered by the 'Add Holiday' button in the Add Dialog
        if (!addHolidayName || !selectedDateForAdd || !selectedCountry) {
            setModalError("Holiday name is required.");
            return;
        }
        setIsModalSubmitting(true);
        setModalError('');
        try {
            const payload = {
                name: addHolidayName,
                date: selectedDateForAdd, // Send YYYY-MM-DD string
                description: addHolidayDescription || undefined,
            };
            // Using user's confirmed route structure
            await axiosInstance.post(`http://localhost:4000/calendar/${selectedCountry}/holidays`, payload);

            setIsAddModalOpen(false); // Close modal on success
            await fetchCalendarData(selectedCountry); // Refresh calendar data
            setSubmitStatus({ type: 'success', message: `Holiday '${addHolidayName}' added.` }); // Show feedback on main page
            setTimeout(() => setSubmitStatus({ type: '', message: '' }), 5000);

        } catch (error) {
            console.error("Error adding holiday:", error);
            setModalError(`Failed to add holiday. ${error?.response?.data?.message || error.message}`);
        } finally {
            setIsModalSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        // Triggered by the 'Delete' button in the Delete Dialog
        if (!holidayToDelete || !selectedCountry) return;
        setIsModalSubmitting(true);
        setModalError('');
        try {
            // Using user's confirmed route structure
            await axiosInstance.delete(`http://localhost:4000/calendar/${selectedCountry}/holidays/${holidayToDelete.id}`);

            setIsDeleteModalOpen(false); // Close modal
            await fetchCalendarData(selectedCountry); // Refresh calendar data
            setSubmitStatus({ type: 'success', message: `Holiday '${holidayToDelete.name}' deleted.` }); // Show feedback on main page
            setHolidayToDelete(null); // Clear selected holiday
            setTimeout(() => setSubmitStatus({ type: '', message: '' }), 5000);

        } catch (error) {
            console.error("Error deleting holiday:", error);
            setModalError(`Failed to delete holiday. ${error?.response?.data?.message || error.message}`);
        } finally {
            setIsModalSubmitting(false);
        }
    };

    // === Styling Callbacks ===
    const handleDayCellDidMount = useCallback((arg) => {
        // Applies background style to weekend cells
        const dayOfWeek = arg.date.getDay();
        const weekends = calendarData?.weekends || [];
        if (weekends.includes(dayOfWeek)) {
             arg.el.style.backgroundColor = theme.palette.action.hover;
        }
     }, [calendarData?.weekends, theme.palette.action.hover]);

    // Weekend Checkbox Data (for the form)
    const daysOfWeek = [
        { label: 'Sun', value: 0 }, { label: 'Mon', value: 1 }, { label: 'Tue', value: 2 },
        { label: 'Wed', value: 3 }, { label: 'Thu', value: 4 }, { label: 'Fri', value: 5 },
        { label: 'Sat', value: 6 },
    ];

    // === Render ===
    return (
        <Grid container spacing={4}>
            {/* Upsert Form Section (Left Panel) */}
            <Grid item xs={12} md={4}>
                 <Paper elevation={3} sx={{ padding: theme.spacing(3), height: '100%' }}>
                     <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main }}>
                         Create / Update Calendar
                     </Typography>
                     <Typography variant="body2" color="textSecondary" gutterBottom>
                         Fetch holidays for a country/year and set weekends.
                     </Typography>
                     <Box component="form" onSubmit={handleUpsertSubmit} noValidate sx={{ mt: 2 }}>
                         <Stack spacing={3}>
                             <TextField /* Country Code Input */
                                 label="Country Code (2 Letters)"
                                 variant="outlined"
                                 value={formCountry}
                                 onChange={(e) => setFormCountry(e.target.value)}
                                 required
                                 inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                                 error={!formCountry}
                                 helperText={!formCountry ? 'Country code is required' : ''}
                             />
                             <FormControl component="fieldset" variant="standard">
                                 <Typography variant="subtitle1" gutterBottom>Weekend Days</Typography>
                                 <FormGroup row>
                                     {daysOfWeek.map(day => (
                                         <FormControlLabel /* Weekend Checkbox */
                                             key={day.value}
                                             control={ <Checkbox checked={formWeekends.includes(day.value)} onChange={handleWeekendChange} value={day.value} size="small" /> }
                                             label={day.label}
                                             sx={{ color: 'black' }}
                                         />
                                     ))}
                                 </FormGroup>
                                 {formWeekends.length === 0 && <FormHelperText error>Select at least one day</FormHelperText>}
                             </FormControl>
                             <TextField /* Year Input */
                                 label={`Year (Default: ${currentYear})`}
                                 variant="outlined"
                                 type="number"
                                 value={formYear}
                                 onChange={(e) => setFormYear(e.target.value)}
                                 placeholder={`${currentYear}`}
                             />
                             <Button /* Submit Button */
                                 type="submit"
                                 variant="contained"
                                 color="primary"
                                 disabled={isSubmitting || !formCountry || formWeekends.length === 0}
                             >
                                 {isSubmitting ? <CircularProgress size={24} /> : 'Save / Fetch Holidays'}
                             </Button>
                             {submitStatus.message && !modalError && ( // Show submit status only if no modal error is active
                                 <Alert severity={submitStatus.type || 'info'} sx={{ mt: 1 }} onClose={() => setSubmitStatus({ type: '', message: '' })}>
                                     {submitStatus.message}
                                 </Alert>
                             )}
                         </Stack>
                     </Box>
                 </Paper>
            </Grid>

            {/* Calendar Display Section (Right Panel) */}
            <Grid item xs={12} md={8}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: theme.spacing(3),
                        backgroundColor: theme.palette.background.paper,
                        // Style overrides for FullCalendar elements
                        '& .fc-daygrid-day-number': { color: 'white', '& a': { color: 'white' } }, // Day numbers white
                        '& .fc-col-header-cell-cushion': { color: 'black', '& a': { color: 'black' } }, // Day headers black
                        '& .fc-button.fc-button-disabled': { opacity: 0.5, cursor: 'not-allowed' }, // Disabled nav buttons
                        '& .fc-event': { cursor: 'pointer' }, // Make events look clickable
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                         <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
                             Holiday Calendar Viewer ({selectedCountry || 'N/A'})
                         </Typography>
                         {availableCountries.length > 0 && (
                             <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                 <InputLabel id="country-select-label">View Country</InputLabel>
                                 <Select /* Country Dropdown */
                                     labelId="country-select-label"
                                     value={selectedCountry}
                                     onChange={(e) => setSelectedCountry(e.target.value)}
                                     label="View Country"
                                 >
                                     {availableCountries.map((c) => (
                                         <MenuItem key={c._id || c.country} value={c.country}>
                                             {c.country}
                                         </MenuItem>
                                     ))}
                                 </Select>
                             </FormControl>
                         )}
                    </Stack>

                    {/* Loading/Error States for Main Calendar View */}
                    {isLoading && <Box textAlign="center" p={5}><CircularProgress /></Box>}
                    {fetchError && !isLoading && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

                    {/* Render Calendar only when not loading, no fetch error, and data is available */}
                    {!isLoading && !fetchError && calendarData && (
                        <FullCalendar
                            ref={calendarRef}
                            key={selectedCountry} // Re-mounts calendar when country changes
                            plugins={[dayGridPlugin, interactionPlugin]} // Ensure interaction plugin is included
                            initialView="dayGridMonth"
                            height="auto"
                            events={events} // Use the memoized events array
                            headerToolbar={{ // Include month navigation, lock year via validRange
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth'
                            }}
                            validRange={validRange} // Restrict view to current year
                            dayCellDidMount={handleDayCellDidMount} // Style weekends
                            dateClick={handleDateClick} // Handle click on empty date cell
                            eventClick={handleEventClick} // Handle click on holiday event
                            eventDidMount={(info) => { // Add tooltips
                                if (info.event.extendedProps.description) {
                                    info.el.setAttribute( 'title', info.event.extendedProps.description );
                                }
                            }}
                        />
                    )}

                    {/* Info message if calendar data is missing/empty */}
                    {!isLoading && !fetchError && (!calendarData || calendarData.holidays?.length === 0) && selectedCountry && (
                         <Alert severity="warning" sx={{ mt: 2 }}>
                             No holidays found for {selectedCountry} in the database for the current view. Use the form to create/update or add individual holidays by clicking dates.
                         </Alert>
                     )}
                     {/* Info message if no country selected */}
                    {!isLoading && !fetchError && !selectedCountry && (
                         <Alert severity="info" sx={{ mt: 2 }}>
                             Select a country to view its calendar or create a new one using the form.
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
                         autoFocus
                         margin="dense"
                         id="name" // Keep ID for potential label association
                         label="Holiday Name"
                         type="text"
                         fullWidth
                         variant="standard"
                         required
                         value={addHolidayName}
                         onChange={(e) => setAddHolidayName(e.target.value)}
                         error={modalError.includes("name is required")} // Basic error check
                      />
                      <TextField
                         margin="dense"
                         id="description"
                         label="Description (Optional)"
                         type="text"
                         fullWidth
                         variant="standard"
                         value={addHolidayDescription}
                         onChange={(e) => setAddHolidayDescription(e.target.value)}
                      />
                      {/* Display errors within the modal */}
                      {modalError && <Alert severity="error" sx={{ mt: 2 }}>{modalError}</Alert>}
                 </DialogContent>
                 <DialogActions>
                      <Button onClick={() => setIsAddModalOpen(false)} disabled={isModalSubmitting}>Cancel</Button>
                      <Button
                          onClick={handleAddHoliday} // Call the handler
                          disabled={isModalSubmitting || !addHolidayName} // Disable if no name or submitting
                          variant="contained"
                      >
                          {isModalSubmitting ? <CircularProgress size={20} /> : "Add Holiday"}
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
                      {/* Display errors within the modal */}
                      {modalError && <Alert severity="error" sx={{ mt: 2 }}>{modalError}</Alert>}
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={() => setIsDeleteModalOpen(false)} disabled={isModalSubmitting}>Cancel</Button>
                      <Button
                          onClick={handleDeleteConfirm} // Call the handler
                          color="error"
                          variant="contained"
                          disabled={isModalSubmitting}
                      >
                          {isModalSubmitting ? <CircularProgress size={20} /> : "Delete"}
                      </Button>
                  </DialogActions>
              </Dialog>

        </Grid> // End Main Grid container
    );
};

export default CompanyHolidayCalendar;