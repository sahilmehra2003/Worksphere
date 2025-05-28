// src/redux/Slices/calenderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { CALENDAR_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    configuredCalendars: [],    // Stores { _id, country }
    currentCalendarDetails: null, // Stores { _id, country, year, holidays: [], weekends: [] }
    loadingList: false,
    loadingDetails: false,
    operationLoading: false,
    error: null, // For fetchAllConfigured and fetchDetails errors
    operationError: null, // For CUD operations errors
    operationSuccess: false,
};

// 1. Fetch All Configured Calendars (List of countries)
export const fetchAllConfiguredCalendars = createAsyncThunk(
    'calendar/fetchAllConfigured',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', CALENDAR_ENDPOINTS.GET_ALL_CONFIGURED_CALENDARS_API);
            // Controller getAllCountryCalendars returns { success, message, data: calendars_array }
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                return response.data.data; // Return the array of { _id, country }
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch configured calendars: Unexpected response.');
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
            // Controller getCountryCalendar returns { success, message, data: calendarObject }
            if (response.data && response.data.success && response.data.data) {
                return response.data.data; // Return the full calendar object
            }
            // Handle case where calendar might not be found (404) but success might be false
            if (response.data && response.data.success === false) {
                return rejectWithValue(response.data.message || `Calendar not found for ${countryCode}.`);
            }
            return rejectWithValue(`Failed to fetch calendar details for ${countryCode}: Unexpected response.`);
        } catch (error) {
            const message = error.response?.data?.message || error.message || `Failed to fetch calendar details for ${countryCode}.`;
            // If API call itself fails (e.g. 404 not caught as success:false), this will handle it
            if (error.response?.status === 404) {
                return rejectWithValue(`Calendar for ${countryCode} not found.`);
            }
            return rejectWithValue(message);
        }
    }
);

// 3. Upsert (Create or Update) a Country Calendar
export const upsertCountryCalendar = createAsyncThunk(
    'calendar/upsert',
    async (calendarData, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', CALENDAR_ENDPOINTS.UPSERT_COUNTRY_CALENDAR_API, calendarData);
            // Controller returns { success, message, data: updatedCalendar }
            if (!response.data.success || !response.data.data) {
                return rejectWithValue(response.data.message || 'Failed to upsert calendar.');
            }
            dispatch(fetchAllConfiguredCalendars()); // Refresh list
            const state = getState().calendar;
            // Use country from response.data.data (the updated calendar object)
            if (state.currentCalendarDetails?.country === response.data.data.country) {
                dispatch(fetchCountryCalendarDetails(response.data.data.country));
            }
            return response.data; // { success, message, data: updatedCalendar }
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
            // Controller returns { success: true, message: ... }
            if (response.data && response.data.success) {
                dispatch(fetchAllConfiguredCalendars());
                const state = getState().calendar;
                if (state.currentCalendarDetails?.country === countryCode) {
                    // Handled by matcher to set currentCalendarDetails to null
                }
                return { countryCode, message: response.data.message }; // Pass countryCode for matcher
            }
            return rejectWithValue(response.data?.message || 'Failed to delete country calendar.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete country calendar.';
            return rejectWithValue(message);
        }
    }
);

// 5. Add a Custom Holiday
export const addCustomHoliday = createAsyncThunk(
    'calendar/addHoliday',
    async ({ countryCode, holidayData }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', CALENDAR_ENDPOINTS.ADD_CUSTOM_HOLIDAY_API(countryCode), holidayData);
            // Controller returns { success, message, data: updatedCalendar }
            if (!response.data.success || !response.data.data) {
                return rejectWithValue(response.data.message || 'Failed to add holiday.');
            }
            const state = getState().calendar;
            if (state.currentCalendarDetails?.country === countryCode) {
                dispatch(fetchCountryCalendarDetails(countryCode)); // Refresh details
            }
            return response.data; // { success, message, data: updatedCalendar }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add holiday.';
            return rejectWithValue(message);
        }
    }
);

// 6. Delete a Holiday
export const deleteHoliday = createAsyncThunk(
    'calendar/deleteHoliday',
    async ({ countryCode, holidayId }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', CALENDAR_ENDPOINTS.DELETE_HOLIDAY_API(countryCode, holidayId));
            // Controller returns { success, message } (does not return updated calendar)
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to delete holiday.');
            }
            const state = getState().calendar;
            if (state.currentCalendarDetails?.country === countryCode) {
                dispatch(fetchCountryCalendarDetails(countryCode)); // Refresh details
            }
            // Return what the backend sent, plus holidayId for potential UI updates
            return { ...response.data, holidayId, countryCode };
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
        // This reducer is intended for the component to manage its local 'selectedCountry'
        // and then trigger fetchCountryCalendarDetails. The slice doesn't need to store
        // a 'selectedCountry' if currentCalendarDetails.country serves that purpose.
        // For now, we'll keep it simple, component handles its own selectedCountry state.
        // setSelectedCalendarCountry: (state, action) => {
        // state.currentCalendarDetails = null; // Clear details when selection changes, before new fetch
        // },
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
                state.configuredCalendars = action.payload || []; // Payload is the array of calendars { _id, country }
            })
            .addCase(fetchAllConfiguredCalendars.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
                state.configuredCalendars = [];
            })

            // Fetch Country Calendar Details
            .addCase(fetchCountryCalendarDetails.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
                state.currentCalendarDetails = null; // Clear previous details while loading new ones
            })
            .addCase(fetchCountryCalendarDetails.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentCalendarDetails = action.payload; // Payload is the calendar object
            })
            .addCase(fetchCountryCalendarDetails.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
                state.currentCalendarDetails = null;
            })

            // Matchers for CUD operations
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
                    // Re-fetching logic is now primarily inside the thunks.
                    // Specific logic for deleteCountryCalendar to clear current view if it was the one deleted:
                    if (action.type === deleteCountryCalendar.fulfilled.type) {
                        if (state.currentCalendarDetails?.country === action.payload.countryCode) {
                            state.currentCalendarDetails = null;
                        }
                    }
                    // If upsert updated the current calendar, it's re-fetched by the thunk.
                    // If add/delete holiday affected current calendar, it's re-fetched by the thunk.
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
                    state.operationError = action.payload; // This is the error message from rejectWithValue
                    state.operationSuccess = false;
                }
            );
    },
});


export const { clearCalendarOperationStatus } = calendarSlice.actions;

export default calendarSlice.reducer;