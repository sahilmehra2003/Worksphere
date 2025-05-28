import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { DASHBOARD_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    // Role-specific summaries
    employeeSummary: null,
    managerSummary: null,
    adminSummary: null,
    hrSummary: null,

    // Common dashboard data
    recentActivities: [],
    notifications: [],
    upcomingEvents: [],
    performanceMetrics: {
        tasksCompleted: 0,
        tasksPending: 0,
        attendanceRate: 0,
        projectContribution: 0
    },
    teamStats: {
        totalMembers: 0,
        activeProjects: 0,
        completedProjects: 0,
        upcomingDeadlines: []
    },
    projectMetrics: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        delayedProjects: 0
    },
    leaveStats: {
        availableLeaves: 0,
        takenLeaves: 0,
        pendingRequests: 0
    },
    timesheetStats: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        overtimeHours: 0
    },

    loading: {
        employee: false,
        manager: false,
        admin: false,
        hr: false,
        common: false
    },
    error: {
        employee: null,
        manager: null,
        admin: null,
        hr: null,
        common: null
    },
};

// --- Async Thunks ---

// 1. Fetch Employee Dashboard Summary
export const fetchEmployeeDashboardSummary = createAsyncThunk(
    'dashboard/fetchEmployeeSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_EMPLOYEE_DASHBOARD_API);
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

// 5. Fetch Common Dashboard Data
export const fetchCommonDashboardData = createAsyncThunk(
    'dashboard/fetchCommonData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_COMMON_DASHBOARD_API);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch common dashboard data.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch common dashboard data.';
            return rejectWithValue(message);
        }
    }
);

// 6. Fetch Recent Activities
export const fetchRecentActivities = createAsyncThunk(
    'dashboard/fetchRecentActivities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_RECENT_ACTIVITIES_API);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch recent activities.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch recent activities.';
            return rejectWithValue(message);
        }
    }
);

// 7. Fetch Notifications
export const fetchNotifications = createAsyncThunk(
    'dashboard/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DASHBOARD_ENDPOINTS.GET_NOTIFICATIONS_API);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch notifications.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch notifications.';
            return rejectWithValue(message);
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state, action) => {
            const dashboardType = action.payload;
            if (dashboardType && state.error[dashboardType]) {
                state.error[dashboardType] = null;
            } else {
                state.error = { employee: null, manager: null, admin: null, hr: null, common: null };
            }
        },
        resetDashboardState: (state) => {
            Object.assign(state, initialState);
        },
        markNotificationAsRead: (state, action) => {
            const notificationId = action.payload;
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
            }
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
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
            })

            // Common Dashboard Data
            .addCase(fetchCommonDashboardData.pending, (state) => {
                state.loading.common = true;
                state.error.common = null;
            })
            .addCase(fetchCommonDashboardData.fulfilled, (state, action) => {
                state.loading.common = false;
                const { recentActivities, notifications, upcomingEvents, performanceMetrics, teamStats, projectMetrics, leaveStats, timesheetStats } = action.payload;
                state.recentActivities = recentActivities;
                state.notifications = notifications;
                state.upcomingEvents = upcomingEvents;
                state.performanceMetrics = performanceMetrics;
                state.teamStats = teamStats;
                state.projectMetrics = projectMetrics;
                state.leaveStats = leaveStats;
                state.timesheetStats = timesheetStats;
            })
            .addCase(fetchCommonDashboardData.rejected, (state, action) => {
                state.loading.common = false;
                state.error.common = action.payload;
            })

            // Recent Activities
            .addCase(fetchRecentActivities.pending, (state) => {
                state.loading.common = true;
                state.error.common = null;
            })
            .addCase(fetchRecentActivities.fulfilled, (state, action) => {
                state.loading.common = false;
                state.recentActivities = action.payload;
            })
            .addCase(fetchRecentActivities.rejected, (state, action) => {
                state.loading.common = false;
                state.error.common = action.payload;
            })

            // Notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading.common = true;
                state.error.common = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading.common = false;
                state.notifications = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading.common = false;
                state.error.common = action.payload;
            });
    },
});

export const {
    clearDashboardError,
    resetDashboardState,
    markNotificationAsRead,
    clearAllNotifications
} = dashboardSlice.actions;

export default dashboardSlice.reducer;