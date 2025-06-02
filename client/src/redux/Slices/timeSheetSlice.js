import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { TIMESHEET_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    myTimesheets: [],
    allTimesheets: [], // For Admin/HR
    submittedTimesheets: [], // For Approvers
    currentTimesheetDetails: null, // { timesheet: {}, entries: [] }
    loading: false, // General list loading
    detailsLoading: false, // For currentTimesheetDetails
    operationLoading: false, // For add/update/delete entry, submit/approve/reject timesheet
    error: null,
    operationError: null,
    operationSuccess: false,
    shouldCreateTimesheet: false, // New flag for Admin/HR
    pagination: { // Pagination for different lists
        myTimesheets: { currentPage: 1, totalPages: 1, totalRecords: 0 },
        allTimesheets: { currentPage: 1, totalPages: 1, totalRecords: 0 },
        submittedTimesheets: { currentPage: 1, totalPages: 1, totalRecords: 0 },
    },
};

// --- Async Thunks ---

// 1. Fetch My Timesheets
export const fetchMyTimesheets = createAsyncThunk(
    'timesheet/fetchMy',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', TIMESHEET_ENDPOINTS.GET_MY_TIMESHEETS_API, null, null, params);
            // Backend controller returns { success, count, pagination, data: timesheets }
            if (response.data && response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch your timesheets.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch your timesheets.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch All Timesheets (Admin/HR)
export const fetchAllTimesheets = createAsyncThunk(
    'timesheet/fetchAllAdmin',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', TIMESHEET_ENDPOINTS.GET_ALL_TIMESHEETS_API, null, null, params);
            if (response.data && response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch all timesheets.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch all timesheets.';
            return rejectWithValue(message);
        }
    }
);

// 3. Fetch Submitted Timesheets (Approvers)
export const fetchSubmittedTimesheets = createAsyncThunk(
    'timesheet/fetchSubmitted',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', TIMESHEET_ENDPOINTS.GET_SUBMITTED_TIMESHEETS_API, null, null, params);
            if (response.data && response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch submitted timesheets.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch submitted timesheets.';
            return rejectWithValue(message);
        }
    }
);

// 4. Fetch Timesheet By ID (includes entries)
export const fetchTimesheetById = createAsyncThunk(
    'timesheet/fetchById',
    async (timesheetId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TIMESHEET_ENDPOINTS.GET_TIMESHEET_BY_ID_API(timesheetId));
            // Backend controller returns { success: true, timesheet, entries }
            if (response.data && response.data.success) {
                return response.data; // Contains timesheet and entries
            }
            return rejectWithValue(response.data?.message || 'Timesheet not found.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch timesheet details.';
            return rejectWithValue(message);
        }
    }
);

// 5. Add Timesheet Entry
export const addTimesheetEntry = createAsyncThunk(
    'timesheet/addEntry',
    async (entryData, { dispatch, getState, rejectWithValue }) => {
        // entryData = { date, hours, description, project, client, task }
        try {
            const response = await apiConnector('POST', TIMESHEET_ENDPOINTS.ADD_TIMESHEET_ENTRY_API, entryData);
            // Backend returns { success, message, timesheet (updated parent), entry (new) }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to add timesheet entry.');
            }
            // After adding an entry, refresh the current timesheet details if it's being viewed
            const currentTimesheet = getState().timesheet.currentTimesheetDetails?.timesheet;
            if (currentTimesheet && currentTimesheet._id === response.data.timesheet._id) {
                dispatch(fetchTimesheetById(currentTimesheet._id));
            }
            // Also potentially refresh "My Timesheets" list if it's the user's own timesheet
            // dispatch(fetchMyTimesheets()); // Or update totalHours in the list item
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add timesheet entry.';
            return rejectWithValue(message);
        }
    }
);

// 6. Update Timesheet Entry
export const updateTimesheetEntry = createAsyncThunk(
    'timesheet/updateEntry',
    async ({ entryId, updatedData }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TIMESHEET_ENDPOINTS.UPDATE_TIMESHEET_ENTRY_BY_ID_API(entryId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update timesheet entry.');
            }
            const currentTimesheet = getState().timesheet.currentTimesheetDetails?.timesheet;
            if (currentTimesheet && response.data.timesheet._id === currentTimesheet._id) {
                dispatch(fetchTimesheetById(currentTimesheet._id));
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update timesheet entry.';
            return rejectWithValue(message);
        }
    }
);

// 7. Delete Timesheet Entry
export const deleteTimesheetEntry = createAsyncThunk(
    'timesheet/deleteEntry',
    async (entryId, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', TIMESHEET_ENDPOINTS.DELETE_TIMESHEET_ENTRY_API(entryId));
            // Backend returns { success, message, timesheet (updated parent) }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to delete timesheet entry.');
            }
            const currentTimesheet = getState().timesheet.currentTimesheetDetails?.timesheet;
            if (currentTimesheet && response.data.timesheet._id === currentTimesheet._id) {
                dispatch(fetchTimesheetById(currentTimesheet._id));
            }
            return { entryId, ...response.data };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete timesheet entry.';
            return rejectWithValue(message);
        }
    }
);

// 8. Submit Timesheet
export const submitTimesheet = createAsyncThunk(
    'timesheet/submit',
    async (timesheetId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TIMESHEET_ENDPOINTS.SUBMIT_TIMESHEET_API(timesheetId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to submit timesheet.');
            }
            dispatch(fetchMyTimesheets()); // Refresh user's list
            // If current details were for this timesheet, refresh them too
            dispatch(fetchTimesheetById(timesheetId));
            return response.data.data; // updated timesheet
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to submit timesheet.';
            return rejectWithValue(message);
        }
    }
);

// 9. Approve Timesheet
export const approveTimesheet = createAsyncThunk(
    'timesheet/approve',
    async (timesheetId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TIMESHEET_ENDPOINTS.APPROVE_TIMESHEET_API(timesheetId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to approve timesheet.');
            }
            dispatch(fetchSubmittedTimesheets()); // Refresh approver's list
            // If current details were for this timesheet, refresh them too
            dispatch(fetchTimesheetById(timesheetId));
            return response.data.data; // updated timesheet
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to approve timesheet.';
            return rejectWithValue(message);
        }
    }
);

// 10. Reject Timesheet
export const rejectTimesheet = createAsyncThunk(
    'timesheet/reject',
    async ({ timesheetId, rejectionData }, { dispatch, rejectWithValue }) => { // rejectionData = { rejectionReason }
        try {
            const response = await apiConnector('PATCH', TIMESHEET_ENDPOINTS.REJECT_TIMESHEET_API(timesheetId), rejectionData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to reject timesheet.');
            }
            dispatch(fetchSubmittedTimesheets()); // Refresh approver's list
            dispatch(fetchTimesheetById(timesheetId));
            return response.data.data; // updated timesheet
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to reject timesheet.';
            return rejectWithValue(message);
        }
    }
);


export const deleteTimesheet = createAsyncThunk(
    'timesheet/delete',
    async (timesheetId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', TIMESHEET_ENDPOINTS.DELETE_TIMESHEET_API(timesheetId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to delete timesheet.');
            }
            // Optionally refresh lists here
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete timesheet.';
            return rejectWithValue(message);
        }
    }
);

const timesheetSlice = createSlice({
    name: 'timesheet',
    initialState,
    reducers: {
        setCurrentTimesheetDetails: (state, action) => {
            state.currentTimesheetDetails = action.payload; // payload = { timesheet, entries }
        },
        clearTimesheetOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
        resetTimesheetState: (state) => { // For logout or component unmount
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Timesheets
            .addCase(fetchMyTimesheets.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchMyTimesheets.fulfilled, (state, action) => {
                state.loading = false;
                state.myTimesheets = action.payload.data || [];
                state.pagination.myTimesheets = action.payload.pagination || initialState.pagination.myTimesheets;
                state.shouldCreateTimesheet = action.payload.shouldCreateTimesheet || false;
            })
            .addCase(fetchMyTimesheets.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.myTimesheets = []; })

            // Fetch All Timesheets (Admin)
            .addCase(fetchAllTimesheets.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllTimesheets.fulfilled, (state, action) => {
                state.loading = false;
                state.allTimesheets = action.payload.data || [];
                state.pagination.allTimesheets = action.payload.pagination || initialState.pagination.allTimesheets;
            })
            .addCase(fetchAllTimesheets.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.allTimesheets = []; })

            // Fetch Submitted Timesheets (Approver)
            .addCase(fetchSubmittedTimesheets.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSubmittedTimesheets.fulfilled, (state, action) => {
                state.loading = false;
                state.submittedTimesheets = action.payload.data || [];
                state.pagination.submittedTimesheets = action.payload.pagination || initialState.pagination.submittedTimesheets;
            })
            .addCase(fetchSubmittedTimesheets.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.submittedTimesheets = []; })

            // Fetch Timesheet By ID
            .addCase(fetchTimesheetById.pending, (state) => { state.detailsLoading = true; state.error = null; state.currentTimesheetDetails = null; })
            .addCase(fetchTimesheetById.fulfilled, (state, action) => {
                state.detailsLoading = false;
                // Merge entries into the timesheet object for frontend convenience
                if (action.payload?.data?.timesheet && action.payload?.data?.entries) {
                    state.currentTimesheetDetails = {
                        ...action.payload.data.timesheet,
                        entries: action.payload.data.entries
                    };
                } else {
                    state.currentTimesheetDetails = null;
                }
            })
            .addCase(fetchTimesheetById.rejected, (state, action) => { state.detailsLoading = false; state.error = action.payload; state.currentTimesheetDetails = null; })

            // Common for operations on entries and timesheet status changes
            .addMatcher(
                (action) => [
                    addTimesheetEntry.pending.type, updateTimesheetEntry.pending.type, deleteTimesheetEntry.pending.type,
                    submitTimesheet.pending.type, approveTimesheet.pending.type, rejectTimesheet.pending.type
                ].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [
                    addTimesheetEntry.fulfilled.type, updateTimesheetEntry.fulfilled.type, deleteTimesheetEntry.fulfilled.type,
                    submitTimesheet.fulfilled.type, approveTimesheet.fulfilled.type, rejectTimesheet.fulfilled.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    // Lists and current details are re-fetched by the thunks.
                    // If the action payload contains the updated timesheet and it's the current one, update it.
                    if (action.payload?.timesheet && state.currentTimesheetDetails?.timesheet?._id === action.payload.timesheet._id) {
                        // This part is tricky because fetchTimesheetById is usually dispatched.
                        // For now, rely on thunks re-fetching.
                    }
                    if (action.type === deleteTimesheetEntry.fulfilled.type) {
                        // If currentTimesheetDetails exists and an entry was deleted from it
                        // the fetchTimesheetById in the thunk will update it.
                    }
                }
            )
            .addMatcher(
                (action) => [
                    addTimesheetEntry.rejected.type, updateTimesheetEntry.rejected.type, deleteTimesheetEntry.rejected.type,
                    submitTimesheet.rejected.type, approveTimesheet.rejected.type, rejectTimesheet.rejected.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { setCurrentTimesheetDetails, clearTimesheetOperationStatus, resetTimesheetState } = timesheetSlice.actions;

export default timesheetSlice.reducer;