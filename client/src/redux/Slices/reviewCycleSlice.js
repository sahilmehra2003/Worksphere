import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { REVIEW_CYCLE_ENDPOINTS } from '../../services/apiEndpoints';
import { toast } from 'react-hot-toast';

const initialState = {
    reviewCycles: [],
    currentReviewCycle: null,
    loadingList: false,
    loadingDetails: false,
    operationLoading: false,
    error: null,
    operationError: null,
    operationSuccess: false,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
};

// --- Async Thunks ---

// 1. Fetch All Review Cycles (with pagination)
export const fetchAllReviewCycles = createAsyncThunk(
    'reviewCycle/fetchAll',
    async ({ page = 1, limit = 10, filters = {}, token }, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', REVIEW_CYCLE_ENDPOINTS.GET_ALL_REVIEW_CYCLES_API, null, { Authorization: `Bearer ${token}` }, params);
            if (response.data?.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch review cycles.');
        } catch (error) {
            const message = error.response?.data?.message || 'Could not fetch review cycles.';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch a single Review Cycle By ID
export const fetchReviewCycleById = createAsyncThunk(
    'reviewCycle/fetchById',
    async ({ cycleId, token }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', REVIEW_CYCLE_ENDPOINTS.GET_REVIEW_CYCLE_BY_ID_API(cycleId), null, { Authorization: `Bearer ${token}` });
            if (response.data?.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Review cycle not found.');
        } catch (error) {
            const message = error.response?.data?.message || 'Could not fetch review cycle details.';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// 3. Create a new Review Cycle
export const createReviewCycle = createAsyncThunk(
    'reviewCycle/create',
    async ({ cycleData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Creating cycle...");
        try {
            const response = await apiConnector('POST', REVIEW_CYCLE_ENDPOINTS.CREATE_REVIEW_CYCLE_API, cycleData, { Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success("Review Cycle created successfully!");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create review cycle.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// 4. Update a Review Cycle
export const updateReviewCycle = createAsyncThunk(
    'reviewCycle/update',
    async ({ cycleId, updatedData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Updating...");
        try {
            const response = await apiConnector('PUT', REVIEW_CYCLE_ENDPOINTS.UPDATE_REVIEW_CYCLE_API(cycleId), updatedData, { Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success("Review Cycle updated.");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update review cycle.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// 5. Activate a Review Cycle
export const activateReviewCycle = createAsyncThunk(
    'reviewCycle/activate',
    async ({ cycleId, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Activating cycle...");
        try {
            const response = await apiConnector('PUT', REVIEW_CYCLE_ENDPOINTS.ACTIVATE_REVIEW_CYCLE_API(cycleId), null, { Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success(response.data.message || "Cycle activated!");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to activate review cycle.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// 6. Delete a Review Cycle
export const deleteReviewCycle = createAsyncThunk(
    'reviewCycle/delete',
    async ({ cycleId, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Deleting...");
        try {
            await apiConnector('DELETE', REVIEW_CYCLE_ENDPOINTS.DELETE_REVIEW_CYCLE_API(cycleId), null, { Authorization: `Bearer ${token}` });
            toast.success("Review Cycle deleted.");
            return { cycleId }; // Return ID for removal from state
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete review cycle.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// --- Slice Definition ---
const reviewCycleSlice = createSlice({
    name: 'reviewCycle',
    initialState,
    reducers: {
        clearReviewCycleOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch All ---
            .addCase(fetchAllReviewCycles.pending, (state) => {
                state.loadingList = true;
            })
            .addCase(fetchAllReviewCycles.fulfilled, (state, action) => {
                state.loadingList = false;
                state.reviewCycles = action.payload.data || [];
                state.pagination = action.payload.pagination || initialState.pagination;
            })
            .addCase(fetchAllReviewCycles.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload;
            })
            // --- Fetch By ID ---
            .addCase(fetchReviewCycleById.pending, (state) => {
                state.loadingDetails = true;
            })
            .addCase(fetchReviewCycleById.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentReviewCycle = action.payload;
            })
            .addCase(fetchReviewCycleById.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            // --- Fulfilled cases for CUD ---
            .addCase(createReviewCycle.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.reviewCycles.unshift(action.payload); // Add new cycle to the beginning of the list
            })
            .addCase(updateReviewCycle.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const index = state.reviewCycles.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.reviewCycles[index] = action.payload;
                }
                if (state.currentReviewCycle?._id === action.payload._id) {
                    state.currentReviewCycle = action.payload;
                }
            })
            .addCase(activateReviewCycle.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const activatedData = action.payload; // Contains { cycleId, status, ... }
                const index = state.reviewCycles.findIndex(c => c._id === activatedData.cycleId);
                if (index !== -1) {
                    state.reviewCycles[index].status = activatedData.status;
                }
                if (state.currentReviewCycle?._id === activatedData.cycleId) {
                    state.currentReviewCycle.status = activatedData.status;
                }
            })
            .addCase(deleteReviewCycle.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.reviewCycles = state.reviewCycles.filter(c => c._id !== action.payload.cycleId);
                if (state.currentReviewCycle?._id === action.payload.cycleId) {
                    state.currentReviewCycle = null;
                }
            })
            // --- CUD Operations (Matcher for shared logic for pending/rejected states) ---
            .addMatcher(
                (action) => [createReviewCycle.pending, updateReviewCycle.pending, activateReviewCycle.pending, deleteReviewCycle.pending].some(type => action.type === type.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [createReviewCycle.rejected, updateReviewCycle.rejected, activateReviewCycle.rejected, deleteReviewCycle.rejected].some(type => action.type === type.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { clearReviewCycleOperationStatus } = reviewCycleSlice.actions;
export default reviewCycleSlice.reducer;
