// src/redux/Slices/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { LEAVE_ENDPOINTS, CALENDAR_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    leaveBalance: null,
    leaveHistory: [],
    companyCalendar: { // Store fetched calendar data relevant for leave calculations
        countryCode: null,
        holidays: [],
        weekends: [0, 6], // Default, can be updated
    },
    // Loading states
    isLoadingBalance: false,
    isLoadingHistory: false,
    isLoadingCalendar: false, // For fetching company calendar (holidays/weekends)
    isApplyingLeave: false,
    isCancellingLeave: false, // General flag for cancellation operation
    cancellingLeaveId: null, // Specific ID for UI feedback during cancellation
    // Error states
    errorBalance: null,
    errorHistory: null,
    errorCalendar: null,
    errorApplyingLeave: null,
    errorCancellingLeave: null,
    // Success flags for operations
    applyLeaveSuccess: false,
    cancelLeaveSuccess: false,
    // Pagination for leave history
    historyPagination: {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
};

// --- Async Thunks ---

// 1. Fetch Own Leave Balance
export const fetchMyLeaveBalance = createAsyncThunk(
    'leave/fetchMyBalance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', LEAVE_ENDPOINTS.GET_MY_LEAVE_BALANCE_API);
            // Assuming backend directly returns the balance object or { success: true, balance: {...} }
            if (response.data?.success === false) { // Check for explicit failure
                return rejectWithValue(response.data.message || 'Failed to fetch leave balance.');
            }
            return response.data.balance || response.data; // Prioritize nested, fallback to direct
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch leave balance.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch Own Leave History with Pagination
export const fetchMyLeaveHistory = createAsyncThunk(
    'leave/fetchMyHistory',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', LEAVE_ENDPOINTS.GET_LEAVE_HISTORY_API, null, null, params);
            // Assuming backend returns { success: true, count: X, pagination: {...}, leaves: [...] }
            if (response.data && response.data.success) {
                return response.data; // Contains leaves array and pagination info
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch leave history.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch leave history.';
            return rejectWithValue(message);
        }
    }
);

// 3. Fetch Company Calendar (Holidays & Weekends for a specific country)
export const fetchCompanyCalendarForCountry = createAsyncThunk(
    'leave/fetchCompanyCalendar', // Keep under 'leave' if primarily for leave page context
    async (countryCode, { rejectWithValue }) => {
        if (!countryCode) {
            return rejectWithValue('Country code is required to fetch company calendar.');
        }
        try {
            const response = await apiConnector('GET', CALENDAR_ENDPOINTS.GET_COUNTRY_CALENDAR_DETAILS_API(countryCode));
            // Backend directly returns the calendar object { _id, country, year, holidays, weekends }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || `Failed to fetch calendar for ${countryCode}.`;
            return rejectWithValue(message);
        }
    }
);

// 4. Apply for Leave
export const applyForLeave = createAsyncThunk(
    'leave/apply',
    async (leaveData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', LEAVE_ENDPOINTS.APPLY_LEAVE_API, leaveData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to apply for leave.');
            }
            dispatch(fetchMyLeaveHistory({ page: 1 })); // Refresh history to page 1
            dispatch(fetchMyLeaveBalance());
            return response.data; // Returns { success, message, leave }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to apply for leave.';
            return rejectWithValue(message);
        }
    }
);

// 5. Cancel Leave Request
export const cancelLeaveRequest = createAsyncThunk(
    'leave/cancel',
    async (leaveId, { dispatch, rejectWithValue }) => {
        try {
            // Assuming backend uses PUT for cancel and returns { success: true, message: '...', leave: updatedLeave }
            const response = await apiConnector('PUT', LEAVE_ENDPOINTS.CANCEL_LEAVE_API(leaveId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to cancel leave request.');
            }
            dispatch(fetchMyLeaveHistory({ page: 1 })); // Refresh history
            dispatch(fetchMyLeaveBalance()); // Refresh balance as cancellation might affect it
            return { leaveId, ...response.data }; // Include leaveId for potential UI updates
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to cancel leave request.';
            return rejectWithValue(message);
        }
    }
);

const leaveSlice = createSlice({
    name: 'leave',
    initialState,
    reducers: {
        clearLeaveOperationStatus: (state) => {
            state.isApplyingLeave = false;
            state.isCancellingLeave = false;
            state.cancellingLeaveId = null;
            state.errorApplyingLeave = null;
            state.errorCancellingLeave = null;
            state.applyLeaveSuccess = false;
            state.cancelLeaveSuccess = false;
        },
        // If pagination is handled by UserLeavePage local state, this might not be needed
        // setLeaveHistoryPage: (state, action) => {
        //     state.historyPagination.currentPage = action.payload;
        // }
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Leave Balance
            .addCase(fetchMyLeaveBalance.pending, (state) => {
                state.isLoadingBalance = true;
                state.errorBalance = null;
            })
            .addCase(fetchMyLeaveBalance.fulfilled, (state, action) => {
                state.isLoadingBalance = false;
                state.leaveBalance = action.payload;
            })
            .addCase(fetchMyLeaveBalance.rejected, (state, action) => {
                state.isLoadingBalance = false;
                state.errorBalance = action.payload;
                state.leaveBalance = null;
            })

            // Fetch My Leave History
            .addCase(fetchMyLeaveHistory.pending, (state) => {
                state.isLoadingHistory = true;
                state.errorHistory = null;
            })
            .addCase(fetchMyLeaveHistory.fulfilled, (state, action) => {
                state.isLoadingHistory = false;
                state.leaveHistory = action.payload.leaves || [];
                state.historyPagination = action.payload.pagination || initialState.historyPagination;
            })
            .addCase(fetchMyLeaveHistory.rejected, (state, action) => {
                state.isLoadingHistory = false;
                state.errorHistory = action.payload;
                state.leaveHistory = [];
            })

            // Fetch Company Calendar
            .addCase(fetchCompanyCalendarForCountry.pending, (state) => {
                state.isLoadingCalendar = true;
                state.errorCalendar = null;
            })
            .addCase(fetchCompanyCalendarForCountry.fulfilled, (state, action) => {
                state.isLoadingCalendar = false;
                state.companyCalendar = {
                    countryCode: action.payload.country, // Assuming payload.country is the code
                    holidays: action.payload.holidays || [],
                    weekends: action.payload.weekends || [0, 6], // Default if not provided
                };
            })
            .addCase(fetchCompanyCalendarForCountry.rejected, (state, action) => {
                state.isLoadingCalendar = false;
                state.errorCalendar = action.payload;
                state.companyCalendar = initialState.companyCalendar; // Reset to default
            })

            // Apply for Leave
            .addCase(applyForLeave.pending, (state) => {
                state.isApplyingLeave = true;
                state.errorApplyingLeave = null;
                state.applyLeaveSuccess = false;
            })
            .addCase(applyForLeave.fulfilled, (state) => {
                state.isApplyingLeave = false;
                state.applyLeaveSuccess = true;
            })
            .addCase(applyForLeave.rejected, (state, action) => {
                state.isApplyingLeave = false;
                state.errorApplyingLeave = action.payload;
            })

            // Cancel Leave Request
            .addCase(cancelLeaveRequest.pending, (state, action) => {
                state.isCancellingLeave = true;
                state.cancellingLeaveId = action.meta.arg; // The leaveId passed to the thunk
                state.errorCancellingLeave = null;
                state.cancelLeaveSuccess = false;
            })
            .addCase(cancelLeaveRequest.fulfilled, (state) => {
                state.isCancellingLeave = false;
                state.cancellingLeaveId = null;
                state.cancelLeaveSuccess = true;
            })
            .addCase(cancelLeaveRequest.rejected, (state, action) => {
                state.isCancellingLeave = false;
                state.cancellingLeaveId = null;
                state.errorCancellingLeave = action.payload;
            });
    },
});

export const { clearLeaveOperationStatus } = leaveSlice.actions;
export default leaveSlice.reducer;