import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector'; 
import { REVIEW_CYCLE_ENDPOINTS } from '../../services/apiEndpoints'; 

const initialState = {
    reviewCycles: [], // Array to store the list of all review cycles
    currentReviewCycle: null, // To store details of a single review cycle
    loadingList: false,
    loadingDetails: false,
    operationLoading: false, // For CUD and activate operations
    error: null,
    operationError: null,
    operationSuccess: false,
    // Add pagination if your getAllReviewCycles backend supports it
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
};

// --- Async Thunks ---

// 1. Fetch All Review Cycles
export const fetchAllReviewCycles = createAsyncThunk(
    'reviewCycle/fetchAll',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => { // Added pagination/filters
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', REVIEW_CYCLE_ENDPOINTS.GET_ALL_REVIEW_CYCLES_API, null, null, params);
            // Backend's getAllReviewCycles returns { success, count, pagination, data: cycles }
            if (response.data && response.data.success) {
                return response.data; // Contains data (cycles array) and pagination
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch review cycles.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch review cycles.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch Review Cycle By ID
export const fetchReviewCycleById = createAsyncThunk(
    'reviewCycle/fetchById',
    async (cycleId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', REVIEW_CYCLE_ENDPOINTS.GET_REVIEW_CYCLE_BY_ID_API(cycleId));
            // Backend's getReviewCycleById returns { success, data: cycle }
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Review cycle not found.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch review cycle details.';
            return rejectWithValue(message);
        }
    }
);

// 3. Create Review Cycle
export const createReviewCycle = createAsyncThunk(
    'reviewCycle/create',
    async (cycleData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', REVIEW_CYCLE_ENDPOINTS.CREATE_REVIEW_CYCLE_API, cycleData);
            // Backend's createReviewCycle returns { success, message, data: newCycle }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create review cycle.');
            }
            dispatch(fetchAllReviewCycles()); // Re-fetch all review cycles to update the list
            return response.data.data; // Return the newly created cycle
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create review cycle.';
            return rejectWithValue(message);
        }
    }
);

// 4. Update Review Cycle
export const updateReviewCycle = createAsyncThunk(
    'reviewCycle/update',
    async ({ cycleId, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', REVIEW_CYCLE_ENDPOINTS.UPDATE_REVIEW_CYCLE_API(cycleId), updatedData);
            // Backend returns { success, message, data: updatedCycle }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update review cycle.');
            }
            dispatch(fetchAllReviewCycles()); // Re-fetch list
            return response.data.data; // Return the updated cycle
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update review cycle.';
            return rejectWithValue(message);
        }
    }
);

// 5. Activate Review Cycle
export const activateReviewCycle = createAsyncThunk(
    'reviewCycle/activate',
    async (cycleId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', REVIEW_CYCLE_ENDPOINTS.ACTIVATE_REVIEW_CYCLE_API(cycleId));
            // Backend returns { success, message, data: { cycle, performanceReviewsCreatedCount } }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to activate review cycle.');
            }
            dispatch(fetchAllReviewCycles()); // Re-fetch list to show updated status
            return response.data.data; // Contains updated cycle and count of reviews created
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to activate review cycle.';
            return rejectWithValue(message);
        }
    }
);

// 6. Delete Review Cycle
export const deleteReviewCycle = createAsyncThunk(
    'reviewCycle/delete',
    async (cycleId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', REVIEW_CYCLE_ENDPOINTS.DELETE_REVIEW_CYCLE_API(cycleId));
            // Backend returns { success, message, data: {} } or 200/204
            if (response.status === 200 || response.status === 204 || (response.data && response.data.success)) {
                dispatch(fetchAllReviewCycles()); // Re-fetch list
                return { cycleId }; // Return ID for UI to remove if needed immediately
            }
            return rejectWithValue(response.data?.message || 'Failed to delete review cycle.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete review cycle.';
            return rejectWithValue(message);
        }
    }
);


const reviewCycleSlice = createSlice({
    name: 'reviewCycle',
    initialState,
    reducers: {
        setCurrentReviewCycle: (state, action) => {
            state.currentReviewCycle = action.payload;
        },
        clearReviewCycleOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Review Cycles
            .addCase(fetchAllReviewCycles.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchAllReviewCycles.fulfilled, (state, action) => {
                state.loadingList = false;
                state.reviewCycles = action.payload.data || [];
                state.pagination = action.payload.pagination || initialState.pagination;
            })
            .addCase(fetchAllReviewCycles.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
                state.reviewCycles = [];
            })

            // Fetch Review Cycle By ID
            .addCase(fetchReviewCycleById.pending, (state) => {
                state.loadingDetails = true;
                state.operationError = null; // Or specific detailsError
                state.currentReviewCycle = null;
            })
            .addCase(fetchReviewCycleById.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentReviewCycle = action.payload;
            })
            .addCase(fetchReviewCycleById.rejected, (state, action) => {
                state.loadingDetails = false;
                state.operationError = action.payload; // Or detailsError
                state.currentReviewCycle = null;
            })

            // Common handling for Create, Update, Activate, Delete operations
            .addMatcher(
                (action) => [
                    createReviewCycle.pending.type,
                    updateReviewCycle.pending.type,
                    activateReviewCycle.pending.type,
                    deleteReviewCycle.pending.type,
                ].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [
                    createReviewCycle.fulfilled.type,
                    updateReviewCycle.fulfilled.type,
                    activateReviewCycle.fulfilled.type,
                    deleteReviewCycle.fulfilled.type,
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    // List is re-fetched by the thunks.
                    // Update currentReviewCycle if it was the one affected.
                    if (action.payload && action.payload._id && state.currentReviewCycle?._id === action.payload._id) {
                        state.currentReviewCycle = action.payload; // If the payload is the updated cycle
                    } else if (action.payload?.cycle?._id && state.currentReviewCycle?._id === action.payload.cycle._id) {
                        state.currentReviewCycle = action.payload.cycle; // For activateReviewCycle
                    }

                    if (action.type === deleteReviewCycle.fulfilled.type && state.currentReviewCycle?._id === action.payload.cycleId) {
                        state.currentReviewCycle = null;
                    }
                }
            )
            .addMatcher(
                (action) => [
                    createReviewCycle.rejected.type,
                    updateReviewCycle.rejected.type,
                    activateReviewCycle.rejected.type,
                    deleteReviewCycle.rejected.type,
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { setCurrentReviewCycle, clearReviewCycleOperationStatus } = reviewCycleSlice.actions;

export default reviewCycleSlice.reducer;