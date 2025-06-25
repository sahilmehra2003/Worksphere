// src/redux/Slices/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { LEAVE_ENDPOINTS, CALENDAR_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    leaveBalance: null,
    leaveHistory: [],
    pendingLeaveRequests: [], // For admin/HR/manager to view pending requests
    companyCalendar: { // Store fetched calendar data relevant for leave calculations
        countryCode: null,
        holidays: [],
        weekends: [0, 6], // Default, can be updated
    },
    // Loading states
    isLoadingBalance: false,
    isLoadingHistory: false,
    isLoadingPendingRequests: false, // For fetching pending leave requests
    isLoadingCalendar: false, // For fetching company calendar (holidays/weekends)
    isApplyingLeave: false,
    isCancellingLeave: false, // General flag for cancellation operation
    cancellingLeaveId: null, // Specific ID for UI feedback during cancellation
    isCreatingLeaveBalances: false, // For creating leave balances for all employees
    isApprovingLeave: false, // For approving leave requests
    isRejectingLeave: false, // For rejecting leave requests
    approvingLeaveId: null, // Specific ID for UI feedback during approval
    rejectingLeaveId: null, // Specific ID for UI feedback during rejection
    // Error states
    errorBalance: null,
    errorHistory: null,
    errorPendingRequests: null, // For pending leave requests
    errorCalendar: null,
    errorApplyingLeave: null,
    errorCancellingLeave: null,
    errorCreatingLeaveBalances: null, // For creating leave balances for all employees
    errorApprovingLeave: null, // For approving leave requests
    errorRejectingLeave: null, // For rejecting leave requests
    // Success flags for operations
    applyLeaveSuccess: false,
    cancelLeaveSuccess: false,
    createLeaveBalancesSuccess: false, // For creating leave balances for all employees
    approveLeaveSuccess: false, // For approving leave requests
    rejectLeaveSuccess: false, // For rejecting leave requests
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

// 6. Create Leave Balances for All Employees (Admin/HR only)
export const createLeaveBalancesForAllEmployees = createAsyncThunk(
    'leave/createBalancesForAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', LEAVE_ENDPOINTS.CREATE_LEAVE_BALANCES_FOR_ALL_EMPLOYEES_API);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create leave balances for all employees.');
            }
            return response.data; // Returns { success, message, created: [...] }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create leave balances for all employees.';
            return rejectWithValue(message);
        }
    }
);

// 7. Fetch Pending Leave Requests (Admin/HR/Manager only)
export const fetchPendingLeaveRequests = createAsyncThunk(
    'leave/fetchPendingRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', LEAVE_ENDPOINTS.GET_PENDING_LEAVE_REQUESTS_API);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to fetch pending leave requests.');
            }
            return response.data.leaves || []; // Returns array of pending leave requests
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch pending leave requests.';
            return rejectWithValue(message);
        }
    }
);

// 8. Approve Leave Request (Admin/HR/Manager only)
export const approveLeaveRequest = createAsyncThunk(
    'leave/approve',
    async (leaveId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', LEAVE_ENDPOINTS.APPROVE_LEAVE_API(leaveId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to approve leave request.');
            }
            return { leaveId, ...response.data }; // Include leaveId for potential UI updates
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to approve leave request.';
            return rejectWithValue(message);
        }
    }
);

// 9. Reject Leave Request (Admin/HR/Manager only)
export const rejectLeaveRequest = createAsyncThunk(
    'leave/reject',
    async ({ leaveId, rejectionReason }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', LEAVE_ENDPOINTS.REJECT_LEAVE_API(leaveId), { rejectionReason });
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to reject leave request.');
            }
            return { leaveId, ...response.data }; // Include leaveId for potential UI updates
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to reject leave request.';
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
            state.isCreatingLeaveBalances = false;
            state.errorCreatingLeaveBalances = null;
            state.createLeaveBalancesSuccess = false;
            state.isApprovingLeave = false;
            state.isRejectingLeave = false;
            state.approvingLeaveId = null;
            state.rejectingLeaveId = null;
            state.errorApprovingLeave = null;
            state.errorRejectingLeave = null;
            state.approveLeaveSuccess = false;
            state.rejectLeaveSuccess = false;
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
            })

            // Create Leave Balances for All Employees
            .addCase(createLeaveBalancesForAllEmployees.pending, (state) => {
                state.isCreatingLeaveBalances = true;
                state.errorCreatingLeaveBalances = null;
            })
            .addCase(createLeaveBalancesForAllEmployees.fulfilled, (state) => {
                state.isCreatingLeaveBalances = false;
                state.createLeaveBalancesSuccess = true;
            })
            .addCase(createLeaveBalancesForAllEmployees.rejected, (state, action) => {
                state.isCreatingLeaveBalances = false;
                state.errorCreatingLeaveBalances = action.payload;
            })

            // Fetch Pending Leave Requests
            .addCase(fetchPendingLeaveRequests.pending, (state) => {
                state.isLoadingPendingRequests = true;
                state.errorPendingRequests = null;
            })
            .addCase(fetchPendingLeaveRequests.fulfilled, (state, action) => {
                state.isLoadingPendingRequests = false;
                state.pendingLeaveRequests = action.payload;
            })
            .addCase(fetchPendingLeaveRequests.rejected, (state, action) => {
                state.isLoadingPendingRequests = false;
                state.errorPendingRequests = action.payload;
                state.pendingLeaveRequests = [];
            })

            // Approve Leave Request
            .addCase(approveLeaveRequest.pending, (state) => {
                state.isApprovingLeave = true;
                state.errorApprovingLeave = null;
                state.approveLeaveSuccess = false;
            })
            .addCase(approveLeaveRequest.fulfilled, (state) => {
                state.isApprovingLeave = false;
                state.approveLeaveSuccess = true;
            })
            .addCase(approveLeaveRequest.rejected, (state, action) => {
                state.isApprovingLeave = false;
                state.errorApprovingLeave = action.payload;
            })

            // Reject Leave Request
            .addCase(rejectLeaveRequest.pending, (state) => {
                state.isRejectingLeave = true;
                state.errorRejectingLeave = null;
                state.rejectLeaveSuccess = false;
            })
            .addCase(rejectLeaveRequest.fulfilled, (state) => {
                state.isRejectingLeave = false;
                state.rejectLeaveSuccess = true;
            })
            .addCase(rejectLeaveRequest.rejected, (state, action) => {
                state.isRejectingLeave = false;
                state.errorRejectingLeave = action.payload;
            });
    },
});

export const { clearLeaveOperationStatus } = leaveSlice.actions;
export default leaveSlice.reducer;