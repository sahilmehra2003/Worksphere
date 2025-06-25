import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { PERFORMANCE_REVIEW_ENDPOINTS } from '../../services/apiEndpoints';
import { toast } from 'react-hot-toast';

const initialState = {
    myReviews: [],
    teamReviews: [],
    allReviews: [],
    currentReviewDetails: null,
    loading: false,
    detailsLoading: false,
    operationLoading: false,
    error: null,
    operationError: null,
    operationSuccess: false,
    pagination: {
        myReviews: { currentPage: 1, totalPages: 1, totalRecords: 0 },
        teamReviews: { currentPage: 1, totalPages: 1, totalRecords: 0 },
        allReviews: { currentPage: 1, totalPages: 1, totalRecords: 0 },
    },
};

// --- ASYNC THUNKS ---

// NEW: Create a Performance Review
export const createPerformanceReview = createAsyncThunk(
    'performanceReview/create',
    async ({ reviewData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Initiating review...");
        try {
            const response = await apiConnector(
                'POST',
                PERFORMANCE_REVIEW_ENDPOINTS.CREATE_REVIEW_API,
                reviewData,
                { Authorization: `Bearer ${token}` }
            );
            if (response.data?.success) {
                toast.success("Review initiated successfully!");
                return response.data.data;
            }
            return rejectWithValue(response.data?.message);
        } catch (error) {
            const message = error.response?.data?.message || 'Could not initiate review.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// NEW: Submit Self-Assessment
export const submitSelfAssessment = createAsyncThunk(
    'performanceReview/submitSelfAssessment',
    async ({ selfAssessmentData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Submitting self-assessment...");
        try {
            const response = await apiConnector(
                'POST',
                PERFORMANCE_REVIEW_ENDPOINTS.SUBMIT_SELF_ASSESSMENT_API,
                selfAssessmentData,
                { Authorization: `Bearer ${token}` }
            );
            if (response.data?.success) {
                toast.success("Self-assessment submitted successfully!");
                return response.data.data;
            }
            return rejectWithValue(response.data?.message);
        } catch (error) {
            const message = error.response?.data?.message || 'Could not submit self-assessment.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// NEW: Submit Manager Review
export const submitManagerReview = createAsyncThunk(
    'performanceReview/submitManagerReview',
    async ({ managerReviewData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Submitting manager review...");
        try {
            const response = await apiConnector(
                'POST',
                PERFORMANCE_REVIEW_ENDPOINTS.SUBMIT_MANAGER_REVIEW_API,
                managerReviewData,
                { Authorization: `Bearer ${token}` }
            );
            if (response.data?.success) {
                toast.success("Manager review submitted successfully!");
                return response.data.data;
            }
            return rejectWithValue(response.data?.message);
        } catch (error) {
            const message = error.response?.data?.message || 'Could not submit manager review.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// Fetch My Performance Reviews
export const fetchMyPerformanceReviews = createAsyncThunk(
    'performanceReview/fetchMy',
    async ({ page = 1, limit = 10, token } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit };
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_MY_REVIEWS_API, null, { Authorization: `Bearer ${token}` }, params);
            if (response.data?.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not fetch your reviews.');
            return rejectWithValue(error.response?.data);
        }
    }
);

// Fetch Team Performance Reviews
export const fetchTeamPerformanceReviews = createAsyncThunk(
    'performanceReview/fetchTeam',
    async ({ page = 1, limit = 10, cycleId, token } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, cycleId };
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_TEAM_REVIEWS_API, null, { Authorization: `Bearer ${token}` }, params);
            if (response.data?.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not fetch team reviews.');
            return rejectWithValue(error.response?.data);
        }
    }
);

// Fetch All Performance Reviews (for Admin/HR)
export const fetchAllPerformanceReviews = createAsyncThunk(
    'performanceReview/fetchAll',
    async ({ page = 1, limit = 10, filters = {}, token } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_ALL_REVIEWS_API, null, { Authorization: `Bearer ${token}` }, params);
            if (response.data?.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not fetch all reviews.');
            return rejectWithValue(error.response?.data);
        }
    }
);


// Fetch a single Performance Review By ID
export const fetchPerformanceReviewById = createAsyncThunk(
    'performanceReview/fetchById',
    async ({ reviewId, token }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_REVIEW_BY_ID_API(reviewId), null, { Authorization: `Bearer ${token}` });
            if (response.data?.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not fetch the review details.');
            return rejectWithValue(error.response?.data);
        }
    }
);

// Update a Performance Review (Handles self-assessment, manager review, and acknowledgement)
export const updatePerformanceReview = createAsyncThunk(
    'performanceReview/update',
    async ({ reviewId, updatedData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Updating...");
        try {
            const response = await apiConnector('PUT', PERFORMANCE_REVIEW_ENDPOINTS.UPDATE_REVIEW_API(reviewId), updatedData, { Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success(response.data.message || "Review updated successfully!");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update review.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// Soft Delete a Performance Review
export const softDeletePerformanceReview = createAsyncThunk(
    'performanceReview/softDelete',
    async ({ reviewId, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Deleting...");
        try {
            await apiConnector('DELETE', PERFORMANCE_REVIEW_ENDPOINTS.DELETE_REVIEW_API(reviewId), null, { Authorization: `Bearer ${token}` });
            toast.success("Review deleted successfully.");
            return { reviewId };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete review.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// --- SLICE DEFINITION ---

const performanceReviewSlice = createSlice({
    name: 'performanceReview',
    initialState,
    reducers: {
        clearPerformanceReviewOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        const updateInList = (list, updatedItem) => list.map(item => item._id === updatedItem._id ? updatedItem : item);

        builder
            // --- Fetch My Reviews ---
            .addCase(fetchMyPerformanceReviews.pending, (state) => { state.loading = true; })
            .addCase(fetchMyPerformanceReviews.fulfilled, (state, action) => { state.loading = false; state.myReviews = action.payload.data || []; state.pagination.myReviews = action.payload.pagination; })
            .addCase(fetchMyPerformanceReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // --- Fetch Team Reviews ---
            .addCase(fetchTeamPerformanceReviews.pending, (state) => { state.loading = true; })
            .addCase(fetchTeamPerformanceReviews.fulfilled, (state, action) => { state.loading = false; state.teamReviews = action.payload.data || []; state.pagination.teamReviews = action.payload.pagination; })
            .addCase(fetchTeamPerformanceReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // --- Fetch All Reviews ---
            .addCase(fetchAllPerformanceReviews.pending, (state) => { state.loading = true; })
            .addCase(fetchAllPerformanceReviews.fulfilled, (state, action) => { state.loading = false; state.allReviews = action.payload.data || []; state.pagination.allReviews = action.payload.pagination; })
            .addCase(fetchAllPerformanceReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // --- Fetch by ID ---
            .addCase(fetchPerformanceReviewById.pending, (state) => { state.detailsLoading = true; })
            .addCase(fetchPerformanceReviewById.fulfilled, (state, action) => { state.detailsLoading = false; state.currentReviewDetails = action.payload; })
            .addCase(fetchPerformanceReviewById.rejected, (state, action) => { state.detailsLoading = false; state.error = action.payload; })

            // --- Create Performance Review ---
            .addCase(createPerformanceReview.pending, (state) => { state.operationLoading = true; state.operationSuccess = false; state.operationError = null; })
            .addCase(createPerformanceReview.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                // Add to the appropriate list if it's relevant
                state.teamReviews.unshift(action.payload);
                state.allReviews.unshift(action.payload);
            })
            .addCase(createPerformanceReview.rejected, (state, action) => { state.operationLoading = false; state.operationError = action.payload; })

            // --- Update Performance Review ---
            .addCase(updatePerformanceReview.pending, (state) => { state.operationLoading = true; state.operationSuccess = false; state.operationError = null; })
            .addCase(updatePerformanceReview.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const updatedReview = action.payload;
                if (state.currentReviewDetails?._id === updatedReview._id) state.currentReviewDetails = updatedReview;
                state.myReviews = updateInList(state.myReviews, updatedReview);
                state.teamReviews = updateInList(state.teamReviews, updatedReview);
                state.allReviews = updateInList(state.allReviews, updatedReview);
            })
            .addCase(updatePerformanceReview.rejected, (state, action) => { state.operationLoading = false; state.operationError = action.payload; })

            // --- Soft Delete Performance Review ---
            .addCase(softDeletePerformanceReview.pending, (state) => { state.operationLoading = true; state.operationSuccess = false; state.operationError = null; })
            .addCase(softDeletePerformanceReview.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const { reviewId } = action.payload;
                state.myReviews = state.myReviews.filter(r => r._id !== reviewId);
                state.teamReviews = state.teamReviews.filter(r => r._id !== reviewId);
                state.allReviews = state.allReviews.filter(r => r._id !== reviewId);
                if (state.currentReviewDetails?._id === reviewId) state.currentReviewDetails = null;
            })
            .addCase(softDeletePerformanceReview.rejected, (state, action) => { state.operationLoading = false; state.operationError = action.payload; })

            // --- Submit Self-Assessment ---
            .addCase(submitSelfAssessment.pending, (state) => { state.operationLoading = true; state.operationSuccess = false; state.operationError = null; })
            .addCase(submitSelfAssessment.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const updatedReview = action.payload;
                if (state.currentReviewDetails?._id === updatedReview._id) state.currentReviewDetails = updatedReview;
                state.myReviews = updateInList(state.myReviews, updatedReview);
                state.teamReviews = updateInList(state.teamReviews, updatedReview);
                state.allReviews = updateInList(state.allReviews, updatedReview);
            })
            .addCase(submitSelfAssessment.rejected, (state, action) => { state.operationLoading = false; state.operationError = action.payload; })

            // --- Submit Manager Review ---
            .addCase(submitManagerReview.pending, (state) => { state.operationLoading = true; state.operationSuccess = false; state.operationError = null; })
            .addCase(submitManagerReview.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const updatedReview = action.payload;
                if (state.currentReviewDetails?._id === updatedReview._id) state.currentReviewDetails = updatedReview;
                state.myReviews = updateInList(state.myReviews, updatedReview);
                state.teamReviews = updateInList(state.teamReviews, updatedReview);
                state.allReviews = updateInList(state.allReviews, updatedReview);
            })
            .addCase(submitManagerReview.rejected, (state, action) => { state.operationLoading = false; state.operationError = action.payload; });
    },
});

export const { clearPerformanceReviewOperationStatus } = performanceReviewSlice.actions;
export default performanceReviewSlice.reducer;
