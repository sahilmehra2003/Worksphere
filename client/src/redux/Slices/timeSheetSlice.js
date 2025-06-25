import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { TIMESHEET_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    weeklyLogs: [], 
    pendingApprovals: [], 
    loading: false, 
    operationLoading: false, 
    error: null,
    operationError: null,
    operationSuccess: false,
};

// --- Employee Thunks ---

export const createTimeLog = createAsyncThunk(
    'timesheet/createLog',
    async (logData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', TIMESHEET_ENDPOINTS.CREATE_TIME_LOG_API, logData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchWeeklyLogs = createAsyncThunk(
    'timesheet/fetchWeeklyLogs',
    async (weekStartDate, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TIMESHEET_ENDPOINTS.GET_WEEKLY_LOGS_API(weekStartDate));
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const submitWeeklyTimesheet = createAsyncThunk(
    'timesheet/submitWeek',
    async (weekStartDate, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TIMESHEET_ENDPOINTS.SUBMIT_WEEKLY_TIMESHEET_API, { weekStartDate });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// --- Manager & HR Thunks ---

export const fetchPendingApprovals = createAsyncThunk(
    'timesheet/fetchPendingApprovals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TIMESHEET_ENDPOINTS.GET_PENDING_APPROVALS_API);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const approveOrRejectLog = createAsyncThunk(
    'timesheet/approveOrRejectLog',
    async ({ logId, status, rejectionReason }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TIMESHEET_ENDPOINTS.APPROVE_OR_REJECT_LOG_API(logId), { status, rejectionReason });
            return { logId, ...response.data.data }; // Return ID to remove from pending list
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


const timesheetSlice = createSlice({
    name: 'timesheet',
    initialState,
    reducers: {
        clearTimesheetOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
        resetTimesheetState: () => initialState,
    },
    extraReducers: (builder) => {
        const operationPending = (state) => { state.operationLoading = true; state.operationError = null; state.operationSuccess = false; };
        const operationFulfilled = (state) => { state.operationLoading = false; state.operationSuccess = true; };
        const operationRejected = (state, action) => { state.operationLoading = false; state.operationError = action.payload; };
        const listPending = (state) => { state.loading = true; state.error = null; };
        const listRejected = (state, action) => { state.loading = false; state.error = action.payload; };

        builder
            // Employee Actions
            .addCase(createTimeLog.pending, operationPending)
            .addCase(createTimeLog.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.weeklyLogs.push(action.payload); // Add new log to the current week's view
            })
            .addCase(createTimeLog.rejected, operationRejected)
            .addCase(fetchWeeklyLogs.pending, listPending)
            .addCase(fetchWeeklyLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.weeklyLogs = action.payload;
            })
            .addCase(fetchWeeklyLogs.rejected, listRejected)
            .addCase(submitWeeklyTimesheet.pending, operationPending)
            .addCase(submitWeeklyTimesheet.fulfilled, operationFulfilled)
            .addCase(submitWeeklyTimesheet.rejected, operationRejected)

            // Manager Actions
            .addCase(fetchPendingApprovals.pending, listPending)
            .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingApprovals = action.payload;
            })
            .addCase(fetchPendingApprovals.rejected, listRejected)
            .addCase(approveOrRejectLog.pending, operationPending)
            .addCase(approveOrRejectLog.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                // Remove the handled log from the pending approvals list
                state.pendingApprovals = state.pendingApprovals.filter(log => log._id !== action.payload.logId);
            })
            .addCase(approveOrRejectLog.rejected, operationRejected);
    },
});

export const { clearTimesheetOperationStatus, resetTimesheetState } = timesheetSlice.actions;

export default timesheetSlice.reducer;
