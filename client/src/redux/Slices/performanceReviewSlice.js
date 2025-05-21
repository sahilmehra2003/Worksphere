import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector'; 
import { PERFORMANCE_REVIEW_ENDPOINTS } from '../../services/apiEndpoints'; 

const initialState = {
    myReviews: [],
    teamReviews: [],
    allReviews: [], // For Admin/HR view
    currentReviewDetails: null,
    loading: false, // General loading for lists
    detailsLoading: false, // For loading a single review's details
    operationLoading: false, // For update/delete operations
    error: null,
    operationError: null,
    operationSuccess: false,
    pagination: { // For lists that support pagination (e.g., getAllPerformanceReviews)
        myReviews: { currentPage: 1, totalPages: 1, totalRecords: 0 },
        teamReviews: { currentPage: 1, totalPages: 1, totalRecords: 0 },
        allReviews: { currentPage: 1, totalPages: 1, totalRecords: 0 },
    },
};



// 1. Fetch My Performance Reviews
export const fetchMyPerformanceReviews = createAsyncThunk(
    'performanceReview/fetchMy',
    async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => { // Added pagination
        try {
            const params = { page, limit };
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_MY_PERFORMANCE_REVIEWS_API, null, null, params);
            // Backend returns { success, count, data (reviews), pagination (optional) }
            if (response.data && response.data.success) {
                return response.data; // Contains data and pagination
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch your performance reviews.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch your performance reviews.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch Team Performance Reviews (for Managers)
export const fetchTeamPerformanceReviews = createAsyncThunk(
    'performanceReview/fetchTeam',
    async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => { // Added pagination
        try {
            const params = { page, limit };
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_TEAM_PERFORMANCE_REVIEWS_API, null, null, params);
            if (response.data && response.data.success) {
                return response.data; // Contains data and pagination
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch team performance reviews.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch team performance reviews.';
            return rejectWithValue(message);
        }
    }
);

// 3. Fetch All Performance Reviews (for Admin/HR)
export const fetchAllPerformanceReviews = createAsyncThunk(
    'performanceReview/fetchAll',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => { // Added pagination and filters
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_ALL_PERFORMANCE_REVIEWS_API, null, null, params);
            if (response.data && response.data.success) {
                return response.data; // Contains data and pagination
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch all performance reviews.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch all performance reviews.';
            return rejectWithValue(message);
        }
    }
);

// 4. Fetch Performance Review By ID
export const fetchPerformanceReviewById = createAsyncThunk(
    'performanceReview/fetchById',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', PERFORMANCE_REVIEW_ENDPOINTS.GET_PERFORMANCE_REVIEW_BY_ID_API(reviewId));
            // Backend returns { success, data (review) }
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Performance review not found.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch performance review details.';
            return rejectWithValue(message);
        }
    }
);

// 5. Update Performance Review (e.g., submit self-assessment, manager review)
export const updatePerformanceReview = createAsyncThunk(
    'performanceReview/update',
    async ({ reviewId, updatedData }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', PERFORMANCE_REVIEW_ENDPOINTS.UPDATE_PERFORMANCE_REVIEW_API(reviewId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update performance review.');
            }
            // After update, potentially re-fetch lists or the specific review for consistency
            // For example, if it was 'myReview'
            const updatedReview = response.data.data;
            const myReviewsList = getState().performanceReview.myReviews;
            if (myReviewsList.some(r => r._id === updatedReview._id)) {
                dispatch(fetchMyPerformanceReviews()); // or just update the specific item in the list
            }
            // Similar logic for teamReviews or allReviews if applicable
            return updatedReview; // Return the updated review
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update performance review.';
            return rejectWithValue(message);
        }
    }
);

// 6. Soft Delete Performance Review (Admin)
export const softDeletePerformanceReview = createAsyncThunk(
    'performanceReview/softDelete',
    async (reviewId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', PERFORMANCE_REVIEW_ENDPOINTS.SOFT_DELETE_PERFORMANCE_REVIEW_API(reviewId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to delete performance review.');
            }
            // Re-fetch the list it might have belonged to, e.g., allReviews for admin
            dispatch(fetchAllPerformanceReviews()); // Or more targeted refresh
            return { reviewId, ...response.data }; // Return reviewId and success message/data
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete performance review.';
            return rejectWithValue(message);
        }
    }
);


const performanceReviewSlice = createSlice({
    name: 'performanceReview',
    initialState,
    reducers: {
        setCurrentReviewDetails: (state, action) => {
            state.currentReviewDetails = action.payload;
        },
        clearPerformanceReviewOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Performance Reviews
            .addCase(fetchMyPerformanceReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyPerformanceReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.myReviews = action.payload.data || [];
                state.pagination.myReviews = action.payload.pagination || initialState.pagination.myReviews;
            })
            .addCase(fetchMyPerformanceReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.myReviews = [];
            })

            // Fetch Team Performance Reviews
            .addCase(fetchTeamPerformanceReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTeamPerformanceReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.teamReviews = action.payload.data || [];
                state.pagination.teamReviews = action.payload.pagination || initialState.pagination.teamReviews;
            })
            .addCase(fetchTeamPerformanceReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.teamReviews = [];
            })

            // Fetch All Performance Reviews
            .addCase(fetchAllPerformanceReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPerformanceReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.allReviews = action.payload.data || [];
                state.pagination.allReviews = action.payload.pagination || initialState.pagination.allReviews;
            })
            .addCase(fetchAllPerformanceReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.allReviews = [];
            })

            // Fetch Performance Review By ID
            .addCase(fetchPerformanceReviewById.pending, (state) => {
                state.detailsLoading = true;
                state.operationError = null; // Or a specific detailsError
                state.currentReviewDetails = null;
            })
            .addCase(fetchPerformanceReviewById.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.currentReviewDetails = action.payload;
            })
            .addCase(fetchPerformanceReviewById.rejected, (state, action) => {
                state.detailsLoading = false;
                state.operationError = action.payload; // Or detailsError
                state.currentReviewDetails = null;
            })

            // Update Performance Review
            .addCase(updatePerformanceReview.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(updatePerformanceReview.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.currentReviewDetails = action.payload; // Update with the returned updated review
                // The thunk handles re-fetching lists if necessary
            })
            .addCase(updatePerformanceReview.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Soft Delete Performance Review
            .addCase(softDeletePerformanceReview.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(softDeletePerformanceReview.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                // The thunk handles re-fetching lists.
                // If currentReviewDetails was the one deleted, clear it.
                if (state.currentReviewDetails?._id === action.payload.reviewId) {
                    state.currentReviewDetails = null;
                }
            })
            .addCase(softDeletePerformanceReview.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            });
    },
});

export const { setCurrentReviewDetails, clearPerformanceReviewOperationStatus } = performanceReviewSlice.actions;

export default performanceReviewSlice.reducer;