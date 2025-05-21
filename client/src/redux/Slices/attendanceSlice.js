import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector'; 
import { ATTENDANCE_ENDPOINTS } from '../../services/apiEndpoints'; 

const initialState = {
    currentStatus: null, 
    attendanceHistory: [],
    historyPagination: { 
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
    loadingStatus: false,
    loadingHistory: false,
    operationLoading: false, // For clockIn/clockOut
    error: null, // General error for the slice
    operationError: null,
    operationSuccess: false, // For clockIn/clockOut success
};



// 1. Get Current Attendance Status
export const fetchCurrentAttendanceStatus = createAsyncThunk(
    'attendance/fetchCurrentStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', ATTENDANCE_ENDPOINTS.GET_CURRENT_ATTENDANCE_STATUS_API);
            
            if (response.data && response.data.success) {
                return response.data; // Contains status and relevant times/logId
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch current attendance status.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch current status.';
            return rejectWithValue(message);
        }
    }
);

// 2. Get Attendance History
export const fetchAttendanceHistory = createAsyncThunk(
    'attendance/fetchHistory',
    async ({ page = 1, limit = 15, filters = {} } = {}, { rejectWithValue }) => { 
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', ATTENDANCE_ENDPOINTS.GET_ATTENDANCE_HISTORY_API, null, null, params);
            
            if (response.data && response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch attendance history.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch attendance history.';
            return rejectWithValue(message);
        }
    }
);

// 3. Clock In
export const clockIn = createAsyncThunk(
    'attendance/clockIn',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', ATTENDANCE_ENDPOINTS.CLOCK_IN_API);
            
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Clock-in failed.');
            }
            dispatch(fetchCurrentAttendanceStatus()); // Refresh current status after clock-in
            dispatch(fetchAttendanceHistory({ page: 1, limit: 15 })); // Refresh history (optional, if needed immediately)
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Clock-in failed.';
            return rejectWithValue(message);
        }
    }
);

// 4. Clock Out
export const clockOut = createAsyncThunk(
    'attendance/clockOut',
    async (notesData, { dispatch, rejectWithValue }) => { 
        try {
            const response = await apiConnector('POST', ATTENDANCE_ENDPOINTS.CLOCK_OUT_API, notesData);
            // Backend returns { success: true, message, data: updatedLog }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Clock-out failed.');
            }
            dispatch(fetchCurrentAttendanceStatus()); // Refresh current status after clock-out
            dispatch(fetchAttendanceHistory({ page: 1, limit: 15 })); // Refresh history
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Clock-out failed.';
            return rejectWithValue(message);
        }
    }
);

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        clearAttendanceOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
        // If a user logs out, you might want to reset the attendance state
        resetAttendanceState: (state) => {
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Current Attendance Status
            .addCase(fetchCurrentAttendanceStatus.pending, (state) => {
                state.loadingStatus = true;
                state.error = null;
            })
            .addCase(fetchCurrentAttendanceStatus.fulfilled, (state, action) => {
                state.loadingStatus = false;
                state.currentStatus = action.payload; // { success, status, clockInTime?, logId?, lastClockOutTime? }
            })
            .addCase(fetchCurrentAttendanceStatus.rejected, (state, action) => {
                state.loadingStatus = false;
                state.error = action.payload;
                state.currentStatus = null;
            })

            // Fetch Attendance History
            .addCase(fetchAttendanceHistory.pending, (state) => {
                state.loadingHistory = true;
                state.error = null;
            })
            .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
                state.loadingHistory = false;
                state.attendanceHistory = action.payload.data || [];
                state.historyPagination = action.payload.pagination || initialState.historyPagination;
            })
            .addCase(fetchAttendanceHistory.rejected, (state, action) => {
                state.loadingHistory = false;
                state.error = action.payload;
                state.attendanceHistory = [];
            })

            // Clock In
            .addCase(clockIn.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(clockIn.fulfilled, (state) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                // currentStatus and history are updated by dispatched thunks
            })
            .addCase(clockIn.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Clock Out
            .addCase(clockOut.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(clockOut.fulfilled, (state) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                // currentStatus and history are updated by dispatched thunks
            })
            .addCase(clockOut.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            });
    },
});

export const { clearAttendanceOperationStatus, resetAttendanceState } = attendanceSlice.actions;

export default attendanceSlice.reducer;