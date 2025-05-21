import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector'; 
import { ANNOUNCEMENT_ENDPOINTS } from '../../services/apiEndpoints'; 

const initialState = {
    activeAnnouncements: [], // For user dashboards
    allAnnouncementsForManagement: [], // For Admin/HR management view
    currentAnnouncementDetails: null, // For viewing/editing a single announcement
    loadingActive: false,
    loadingManagementList: false,
    loadingDetails: false,
    operationLoading: false, // For CUD, publish, archive
    error: null,
    operationError: null,
    operationSuccess: false,
    paginationManagement: { // For getAllAnnouncementsForManagement
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
};

// --- Async Thunks ---

// 1. Fetch Active Announcements for User (e.g., for Dashboard)
export const fetchActiveAnnouncementsForUser = createAsyncThunk(
    'announcement/fetchActiveForUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', ANNOUNCEMENT_ENDPOINTS.GET_ACTIVE_ANNOUNCEMENTS_USER_API);
            // Backend's getActiveAnnouncementsForUser returns { success, count, data: [announcements] }
            if (response.data && response.data.success) {
                return response.data.data; // Array of active announcements
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch active announcements.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch active announcements.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch All Announcements for Management (Admin/HR)
export const fetchAllAnnouncementsForManagement = createAsyncThunk(
    'announcement/fetchAllForManagement',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', ANNOUNCEMENT_ENDPOINTS.GET_ALL_ANNOUNCEMENTS_MANAGEMENT_API, null, null, params);
            // Backend returns { success, count, pagination, data: [announcements] }
            if (response.data && response.data.success) {
                return response.data; // Contains data (announcements array) and pagination
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch announcements for management.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch announcements for management.';
            return rejectWithValue(message);
        }
    }
);

// 3. Fetch Announcement by ID for Management
export const fetchAnnouncementByIdForManagement = createAsyncThunk(
    'announcement/fetchByIdForManagement',
    async (announcementId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', ANNOUNCEMENT_ENDPOINTS.GET_ANNOUNCEMENT_BY_ID_MANAGEMENT_API(announcementId));
            // Backend returns { success, data: announcement }
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Announcement not found.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch announcement details.';
            return rejectWithValue(message);
        }
    }
);

// 4. Create Announcement (Admin/HR)
export const createAnnouncement = createAsyncThunk(
    'announcement/create',
    async (announcementData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', ANNOUNCEMENT_ENDPOINTS.CREATE_ANNOUNCEMENT_API, announcementData);
            // Backend returns { success, message, data: newAnnouncement }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create announcement.');
            }
            dispatch(fetchAllAnnouncementsForManagement()); // Refresh management list
            // Optionally refresh active list if it might immediately show there
            // dispatch(fetchActiveAnnouncementsForUser());
            return response.data.data; // Return the newly created announcement
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create announcement.';
            return rejectWithValue(message);
        }
    }
);

// 5. Update Announcement (Admin/HR)
export const updateAnnouncement = createAsyncThunk(
    'announcement/update',
    async ({ announcementId, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', ANNOUNCEMENT_ENDPOINTS.UPDATE_ANNOUNCEMENT_API(announcementId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update announcement.');
            }
            dispatch(fetchAllAnnouncementsForManagement());
            dispatch(fetchActiveAnnouncementsForUser()); // Refresh active list as status/dates might change
            return response.data.data; // Return the updated announcement
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update announcement.';
            return rejectWithValue(message);
        }
    }
);

// 6. Delete Announcement (Admin/HR)
export const deleteAnnouncement = createAsyncThunk(
    'announcement/delete',
    async (announcementId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', ANNOUNCEMENT_ENDPOINTS.DELETE_ANNOUNCEMENT_API(announcementId));
            // Backend returns { success, message } or 200/204 on success
            if (response.status === 200 || response.status === 204 || (response.data && response.data.success)) {
                dispatch(fetchAllAnnouncementsForManagement());
                dispatch(fetchActiveAnnouncementsForUser());
                return { announcementId }; // Return ID for UI to remove if needed
            }
            return rejectWithValue(response.data?.message || 'Failed to delete announcement.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete announcement.';
            return rejectWithValue(message);
        }
    }
);

// 7. Publish Announcement (Admin/HR)
export const publishAnnouncement = createAsyncThunk(
    'announcement/publish',
    async (announcementId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', ANNOUNCEMENT_ENDPOINTS.PUBLISH_ANNOUNCEMENT_API(announcementId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to publish announcement.');
            }
            dispatch(fetchAllAnnouncementsForManagement());
            dispatch(fetchActiveAnnouncementsForUser());
            return response.data.data; // Return updated announcement
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to publish announcement.';
            return rejectWithValue(message);
        }
    }
);

// 8. Archive Announcement (Admin/HR)
export const archiveAnnouncement = createAsyncThunk(
    'announcement/archive',
    async (announcementId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', ANNOUNCEMENT_ENDPOINTS.ARCHIVE_ANNOUNCEMENT_API(announcementId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to archive announcement.');
            }
            dispatch(fetchAllAnnouncementsForManagement());
            dispatch(fetchActiveAnnouncementsForUser());
            return response.data.data; // Return updated announcement
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to archive announcement.';
            return rejectWithValue(message);
        }
    }
);


const announcementSlice = createSlice({
    name: 'announcement',
    initialState,
    reducers: {
        setCurrentAnnouncementDetails: (state, action) => {
            state.currentAnnouncementDetails = action.payload;
        },
        clearAnnouncementOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Active Announcements for User
            .addCase(fetchActiveAnnouncementsForUser.pending, (state) => {
                state.loadingActive = true;
                state.error = null;
            })
            .addCase(fetchActiveAnnouncementsForUser.fulfilled, (state, action) => {
                state.loadingActive = false;
                state.activeAnnouncements = action.payload || [];
            })
            .addCase(fetchActiveAnnouncementsForUser.rejected, (state, action) => {
                state.loadingActive = false;
                state.error = action.payload;
                state.activeAnnouncements = [];
            })

            // Fetch All Announcements for Management
            .addCase(fetchAllAnnouncementsForManagement.pending, (state) => {
                state.loadingManagementList = true;
                state.error = null;
            })
            .addCase(fetchAllAnnouncementsForManagement.fulfilled, (state, action) => {
                state.loadingManagementList = false;
                state.allAnnouncementsForManagement = action.payload.data || [];
                state.paginationManagement = action.payload.pagination || initialState.paginationManagement;
            })
            .addCase(fetchAllAnnouncementsForManagement.rejected, (state, action) => {
                state.loadingManagementList = false;
                state.error = action.payload;
                state.allAnnouncementsForManagement = [];
            })

            // Fetch Announcement by ID for Management
            .addCase(fetchAnnouncementByIdForManagement.pending, (state) => {
                state.loadingDetails = true;
                state.operationError = null; // Use operationError for specific detail fetch
                state.currentAnnouncementDetails = null;
            })
            .addCase(fetchAnnouncementByIdForManagement.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentAnnouncementDetails = action.payload;
            })
            .addCase(fetchAnnouncementByIdForManagement.rejected, (state, action) => {
                state.loadingDetails = false;
                state.operationError = action.payload;
                state.currentAnnouncementDetails = null;
            })

            // Common handling for Create, Update, Delete, Publish, Archive operations
            .addMatcher(
                (action) => [
                    createAnnouncement.pending.type,
                    updateAnnouncement.pending.type,
                    deleteAnnouncement.pending.type,
                    publishAnnouncement.pending.type,
                    archiveAnnouncement.pending.type,
                ].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [
                    createAnnouncement.fulfilled.type,
                    updateAnnouncement.fulfilled.type,
                    deleteAnnouncement.fulfilled.type,
                    publishAnnouncement.fulfilled.type,
                    archiveAnnouncement.fulfilled.type,
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    // Lists are re-fetched by the thunks.
                    // Update currentAnnouncementDetails if it was the one affected.
                    if (action.payload && action.payload._id && state.currentAnnouncementDetails?._id === action.payload._id) {
                        state.currentAnnouncementDetails = action.payload;
                    }
                    if (action.type === deleteAnnouncement.fulfilled.type && state.currentAnnouncementDetails?._id === action.payload.announcementId) {
                        state.currentAnnouncementDetails = null;
                    }
                }
            )
            .addMatcher(
                (action) => [
                    createAnnouncement.rejected.type,
                    updateAnnouncement.rejected.type,
                    deleteAnnouncement.rejected.type,
                    publishAnnouncement.rejected.type,
                    archiveAnnouncement.rejected.type,
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { setCurrentAnnouncementDetails, clearAnnouncementOperationStatus } = announcementSlice.actions;

export default announcementSlice.reducer;