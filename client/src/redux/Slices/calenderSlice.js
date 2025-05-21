import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { CALENDAR_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    configuredCalendars: [],
    currentCalendarDetails: null, 
    loadingList: false, 
    loadingDetails: false, 
    operationLoading: false, 
    error: null,
    operationError: null,
    operationSuccess: false,
};



// 1. Fetch All Configured Calendars (List of countries)
export const fetchAllConfiguredCalendars = createAsyncThunk(
    'calendar/fetchAllConfigured',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', CALENDAR_ENDPOINTS.GET_ALL_CONFIGURED_CALENDARS_API);
            // Your controller returns an array of { _id, country } directly
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch configured calendars.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch Details of a Specific Country Calendar
export const fetchCountryCalendarDetails = createAsyncThunk(
    'calendar/fetchDetails',
    async (countryCode, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', CALENDAR_ENDPOINTS.GET_COUNTRY_CALENDAR_DETAILS_API(countryCode));
            // Your controller returns the full calendar object directly if found
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch calendar details.';
            return rejectWithValue(message);
        }
    }
);

// 3. Upsert (Create or Update) a Country Calendar
// This involves fetching holidays from Calendarific and saving/updating in DB.
export const upsertCountryCalendar = createAsyncThunk(
    'calendar/upsert',
    async (calendarData, { dispatch, getState, rejectWithValue }) => { // calendarData = { country, year (optional), weekends (optional) }
        try {
            const response = await apiConnector('POST', CALENDAR_ENDPOINTS.UPSERT_COUNTRY_CALENDAR_API, calendarData);
            // Controller returns { success, message, calendar }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to upsert calendar.');
            }
            // After upserting, refresh the list of configured calendars and potentially the current details
            dispatch(fetchAllConfiguredCalendars());
            const state = getState().calendar;
            if (state.currentCalendarDetails?.country === response.data.calendar.country) { // If current was updated
                dispatch(fetchCountryCalendarDetails(response.data.calendar.country));
            }
            return response.data; // { success, message, calendar }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to upsert calendar.';
            return rejectWithValue(message);
        }
    }
);

// 4. Delete an Entire Country's Calendar
export const deleteCountryCalendar = createAsyncThunk(
    'calendar/deleteCountry',
    async (countryCode, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', CALENDAR_ENDPOINTS.DELETE_COUNTRY_CALENDAR_API(countryCode));
            // Controller returns { message } on success
            if (response.status === 200 || response.data?.message) { // Check status or message for success
                dispatch(fetchAllConfiguredCalendars()); // Refresh list
                // If the deleted calendar was the current one, clear its details
                // This needs access to current state, best handled in extraReducer or by component logic
                const state = getState().calendar;
                if (state.currentCalendarDetails?.country === countryCode) {
                    // This will be handled in the fulfilled matcher
                }
                return { countryCode, message: response.data.message };
            }
            return rejectWithValue(response.data?.message || 'Failed to delete country calendar.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete country calendar.';
            return rejectWithValue(message);
        }
    }
);

// 5. Add a Custom Holiday to a Country's Calendar
export const addCustomHoliday = createAsyncThunk(
    'calendar/addHoliday',
    async ({ countryCode, holidayData }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', CALENDAR_ENDPOINTS.ADD_CUSTOM_HOLIDAY_API(countryCode), holidayData);
            // Controller returns { success, message, calendar (updated) }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to add holiday.');
            }
            // Refresh the details of the current calendar if it matches
            const state = getState().calendar;
            if (state.currentCalendarDetails?.country === countryCode) { // Access state carefully in thunk
                dispatch(fetchCountryCalendarDetails(countryCode));
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add holiday.';
            return rejectWithValue(message);
        }
    }
);

// 6. Delete a Holiday from a Country's Calendar
export const deleteHoliday = createAsyncThunk(
    'calendar/deleteHoliday',
    async ({ countryCode, holidayId }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', CALENDAR_ENDPOINTS.DELETE_HOLIDAY_API(countryCode, holidayId));
            // Controller returns { success, message, calendar (updated) }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to delete holiday.');
            }
            // Refresh the details of the current calendar if it matches
            const state = getState().calendar;
            if (state.currentCalendarDetails?.country === countryCode) { // Access state carefully in thunk
                dispatch(fetchCountryCalendarDetails(countryCode));
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete holiday.';
            return rejectWithValue(message);
        }
    }
);

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setSelectedCalendarCountry: (state, action) => { // To trigger detail fetch from component
            const countryCode = action.payload;
            const found = state.configuredCalendars.find(cal => cal.country === countryCode);
            if (found) {
                // Component should dispatch fetchCountryCalendarDetails(countryCode)
            }
            // For now, just clear details if country changes or not found, let thunk populate
            state.currentCalendarDetails = null;
        },
        clearCalendarOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Configured Calendars
            .addCase(fetchAllConfiguredCalendars.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchAllConfiguredCalendars.fulfilled, (state, action) => {
                state.loadingList = false;
                state.configuredCalendars = action.payload || [];
                // Optionally set the first calendar as current if list is not empty and no current one selected
                if (state.configuredCalendars.length > 0 && !state.currentCalendarDetails) {
                    // This logic is better handled by the component:
                    // component dispatches fetchCountryCalendarDetails(state.configuredCalendars[0].country)
                }
            })
            .addCase(fetchAllConfiguredCalendars.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
                state.configuredCalendars = [];
            })

            // Fetch Country Calendar Details
            .addCase(fetchCountryCalendarDetails.pending, (state) => {
                state.loadingDetails = true;
                state.error = null; // Or operationError
            })
            .addCase(fetchCountryCalendarDetails.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentCalendarDetails = action.payload;
            })
            .addCase(fetchCountryCalendarDetails.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload; // Or operationError
                state.currentCalendarDetails = null;
            })

            // Common handling for operations (Upsert, Delete Country, Add Holiday, Delete Holiday)
            .addMatcher(
                (action) => [
                    upsertCountryCalendar.pending.type,
                    deleteCountryCalendar.pending.type,
                    addCustomHoliday.pending.type,
                    deleteHoliday.pending.type
                ].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [
                    upsertCountryCalendar.fulfilled.type,
                    deleteCountryCalendar.fulfilled.type,
                    addCustomHoliday.fulfilled.type,
                    deleteHoliday.fulfilled.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    // List/details re-fetching is handled within the thunks by dispatching other actions
                    if (action.type === deleteCountryCalendar.fulfilled.type) {
                        if (state.currentCalendarDetails?.country === action.payload.countryCode) {
                            state.currentCalendarDetails = null; // Clear if current was deleted
                        }
                    }
                }
            )
            .addMatcher(
                (action) => [
                    upsertCountryCalendar.rejected.type,
                    deleteCountryCalendar.rejected.type,
                    addCustomHoliday.rejected.type,
                    deleteHoliday.rejected.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { setSelectedCalendarCountry, clearCalendarOperationStatus } = calendarSlice.actions;

export default calendarSlice.reducer;