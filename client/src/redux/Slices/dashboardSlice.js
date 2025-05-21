import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector'; 
import { DASHBOARD_ENDPOINTS } from '../../services/apiEndpoints'; 

const initialState = {
    employeeSummary: null,
    managerSummary: null,
    adminSummary: null,
    hrSummary: null,
    loading: {
    // Separate loading flags for each dashboard type
        employee: false,
        manager: false,
        admin: false,
        hr: false,
    },
    error: {
    // Separate error flags/messages
        employee: null,
        manager: null,
        admin: null,
        hr: null,
    },
};

// --- Async Thunks ---

// 1. Fetch Employee Dashboard Summary
export const fetchEmployeeDashboardSummary = createAsyncThunk(
    'dashboard/fetchEmployeeSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_EMPLOYEE_DASHBOARD_API);
            // Backend returns { success: true, data: dashboardData }
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch employee dashboard summary.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch employee dashboard summary.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch Manager Dashboard Summary
export const fetchManagerDashboardSummary = createAsyncThunk(
    'dashboard/fetchManagerSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_MANAGER_DASHBOARD_API);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch manager dashboard summary.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch manager dashboard summary.';
            return rejectWithValue(message);
        }
    }
);

// 3. Fetch Admin Dashboard Summary
export const fetchAdminDashboardSummary = createAsyncThunk(
    'dashboard/fetchAdminSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_ADMIN_DASHBOARD_API);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch admin dashboard summary.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch admin dashboard summary.';
            return rejectWithValue(message);
        }
    }
);

// 4. Fetch HR Dashboard Summary
export const fetchHrDashboardSummary = createAsyncThunk(
    'dashboard/fetchHrSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_HR_DASHBOARD_API);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch HR dashboard summary.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch HR dashboard summary.';
            return rejectWithValue(message);
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state, action) => { // action.payload could be 'employee', 'manager', etc.
            const dashboardType = action.payload;
            if (dashboardType && state.error[dashboardType]) {
                state.error[dashboardType] = null;
            } else { // Clear all if no type specified
                state.error = { employee: null, manager: null, admin: null, hr: null };
            }
        },
        resetDashboardState: (state) => { // For logout or re-initialization
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        builder
            // Employee Dashboard
            .addCase(fetchEmployeeDashboardSummary.pending, (state) => {
                state.loading.employee = true;
                state.error.employee = null;
            })
            .addCase(fetchEmployeeDashboardSummary.fulfilled, (state, action) => {
                state.loading.employee = false;
                state.employeeSummary = action.payload;
            })
            .addCase(fetchEmployeeDashboardSummary.rejected, (state, action) => {
                state.loading.employee = false;
                state.error.employee = action.payload;
                state.employeeSummary = null;
            })

            // Manager Dashboard
            .addCase(fetchManagerDashboardSummary.pending, (state) => {
                state.loading.manager = true;
                state.error.manager = null;
            })
            .addCase(fetchManagerDashboardSummary.fulfilled, (state, action) => {
                state.loading.manager = false;
                state.managerSummary = action.payload;
            })
            .addCase(fetchManagerDashboardSummary.rejected, (state, action) => {
                state.loading.manager = false;
                state.error.manager = action.payload;
                state.managerSummary = null;
            })

            // Admin Dashboard
            .addCase(fetchAdminDashboardSummary.pending, (state) => {
                state.loading.admin = true;
                state.error.admin = null;
            })
            .addCase(fetchAdminDashboardSummary.fulfilled, (state, action) => {
                state.loading.admin = false;
                state.adminSummary = action.payload;
            })
            .addCase(fetchAdminDashboardSummary.rejected, (state, action) => {
                state.loading.admin = false;
                state.error.admin = action.payload;
                state.adminSummary = null;
            })

            // HR Dashboard
            .addCase(fetchHrDashboardSummary.pending, (state) => {
                state.loading.hr = true;
                state.error.hr = null;
            })
            .addCase(fetchHrDashboardSummary.fulfilled, (state, action) => {
                state.loading.hr = false;
                state.hrSummary = action.payload;
            })
            .addCase(fetchHrDashboardSummary.rejected, (state, action) => {
                state.loading.hr = false;
                state.error.hr = action.payload;
                state.hrSummary = null;
            });
    },
});

export const { clearDashboardError, resetDashboardState } = dashboardSlice.actions;

export default dashboardSlice.reducer;