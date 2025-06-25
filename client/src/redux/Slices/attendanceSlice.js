import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { ATTENDANCE_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    // Data states
    attendanceHistory: [],
    pendingApprovals: [],
    currentAttendanceStatus: null,

    // Status states
    loading: false,
    operationLoading: false,
    error: null,
    operationError: null,
    operationSuccess: false,
};



export const markCheckIn = createAsyncThunk(
    'attendance/markCheckIn',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', ATTENDANCE_ENDPOINTS.CHECK_IN_API);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const markCheckOut = createAsyncThunk(
    'attendance/markCheckOut',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', ATTENDANCE_ENDPOINTS.CHECK_OUT_API);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const flagIssueToHR = createAsyncThunk(
    'attendance/flagIssueToHR',
    async ({ attendanceId, notes }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', ATTENDANCE_ENDPOINTS.FLAG_ISSUE_TO_HR_API(attendanceId), { notes });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const requestHalfDay = createAsyncThunk(
    'attendance/requestHalfDay',
    async ({ date, notes }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', ATTENDANCE_ENDPOINTS.REQUEST_HALF_DAY_API, { date, notes });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const requestCorrection = createAsyncThunk(
    'attendance/requestCorrection',
    async ({ attendanceId, type, reason, checkInTime, checkOutTime }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', ATTENDANCE_ENDPOINTS.REQUEST_CORRECTION_API(attendanceId), {
                type,
                reason,
                checkInTime,
                checkOutTime
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Data Fetching ---

export const fetchAttendanceForEmployee = createAsyncThunk(
    'attendance/fetchForEmployee',
    async ({ employeeId, startDate, endDate }, { rejectWithValue }) => {
        try {
            const params = { startDate, endDate };
            const response = await apiConnector('GET', ATTENDANCE_ENDPOINTS.GET_ATTENDANCE_FOR_EMPLOYEE_API(employeeId), null, null, params);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchCurrentAttendanceStatus = createAsyncThunk(
    'attendance/fetchCurrentStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', ATTENDANCE_ENDPOINTS.GET_CURRENT_ATTENDANCE_STATUS_API);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Manager & HR Actions ---

export const fetchPendingApprovals = createAsyncThunk(
    'attendance/fetchPendingApprovals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', ATTENDANCE_ENDPOINTS.GET_PENDING_APPROVALS_API);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const approveOrRejectShortfall = createAsyncThunk(
    'attendance/approveOrRejectShortfall',
    async ({ attendanceId, status, comment }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', ATTENDANCE_ENDPOINTS.APPROVE_OR_REJECT_SHORTFALL_API(attendanceId), { status, comment });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// --- Admin Actions ---

export const updateAttendanceByAdmin = createAsyncThunk(
    'attendance/updateByAdmin',
    async ({ attendanceId, data }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', ATTENDANCE_ENDPOINTS.UPDATE_ATTENDANCE_BY_ADMIN_API(attendanceId), data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
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
        resetAttendanceState: () => initialState,
    },
    extraReducers: (builder) => {
        const operationPending = (state) => { state.operationLoading = true; state.operationError = null; state.operationSuccess = false; };
        const operationFulfilled = (state) => { state.operationLoading = false; state.operationSuccess = true; };
        const operationRejected = (state, action) => { state.operationLoading = false; state.operationError = action.payload; };
        const listPending = (state) => { state.loading = true; state.error = null; };
        const listRejected = (state, action) => { state.loading = false; state.error = action.payload; };

        builder
            // Employee Actions
            .addCase(markCheckIn.pending, operationPending).addCase(markCheckIn.fulfilled, operationFulfilled).addCase(markCheckIn.rejected, operationRejected)
            .addCase(markCheckOut.pending, operationPending).addCase(markCheckOut.fulfilled, operationFulfilled).addCase(markCheckOut.rejected, operationRejected)
            .addCase(flagIssueToHR.pending, operationPending).addCase(flagIssueToHR.fulfilled, operationFulfilled).addCase(flagIssueToHR.rejected, operationRejected)
            .addCase(requestHalfDay.pending, operationPending).addCase(requestHalfDay.fulfilled, operationFulfilled).addCase(requestHalfDay.rejected, operationRejected)
            .addCase(requestCorrection.pending, operationPending).addCase(requestCorrection.fulfilled, operationFulfilled).addCase(requestCorrection.rejected, operationRejected)

            // Data Fetching
            .addCase(fetchAttendanceForEmployee.pending, listPending)
            .addCase(fetchAttendanceForEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceHistory = action.payload;
            })
            .addCase(fetchAttendanceForEmployee.rejected, listRejected)
            .addCase(fetchCurrentAttendanceStatus.pending, listPending)
            .addCase(fetchCurrentAttendanceStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentAttendanceStatus = action.payload;
            })
            .addCase(fetchCurrentAttendanceStatus.rejected, listRejected)

            // Manager & HR Actions
            .addCase(fetchPendingApprovals.pending, listPending)
            .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingApprovals = action.payload;
            })
            .addCase(fetchPendingApprovals.rejected, listRejected)
            .addCase(approveOrRejectShortfall.pending, operationPending)
            .addCase(approveOrRejectShortfall.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                // Remove the approved/rejected item from the pending list
                state.pendingApprovals = state.pendingApprovals.filter(item => item._id !== action.payload._id);
            })
            .addCase(approveOrRejectShortfall.rejected, operationRejected)

            // Admin Actions
            .addCase(updateAttendanceByAdmin.pending, operationPending)
            .addCase(updateAttendanceByAdmin.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                // Update the item in the history list if it exists
                const index = state.attendanceHistory.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.attendanceHistory[index] = action.payload;
                }
            })
            .addCase(updateAttendanceByAdmin.rejected, operationRejected);
    },
});

export const { clearAttendanceOperationStatus, resetAttendanceState } = attendanceSlice.actions;

export default attendanceSlice.reducer;
