import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { GOAL_ENDPOINTS } from '../../services/apiEndpoints';
import { toast } from 'react-hot-toast';

const initialState = {
    goals: [],
    loading: false,
    operationLoading: false,
    error: null,
    operationError: null,
    operationSuccess: false,
};


// 1. Get Goals (for self, team, or all based on backend logic)
export const getGoals = createAsyncThunk(
    'goal/getGoals',
    async ({ reviewCycleId, employeeId, token }, { rejectWithValue }) => {
        try {
            const params = { reviewCycleId, employeeId };
            const response = await apiConnector('GET', GOAL_ENDPOINTS.GET_GOAL_API, null, { Authorization: `Bearer ${token}` }, params);
            if (response.data?.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch goals.');
        } catch (error) {
            const message = error.response?.data?.message || 'Could not fetch goals.';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// 2. Create a new Goal
export const createGoal = createAsyncThunk(
    'goal/createGoal',
    async ({ goalData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Creating goal...");
        try {
            const response = await apiConnector('POST', GOAL_ENDPOINTS.CREATE_GOAL_API, goalData, { Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success("Goal created successfully!");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create goal.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// 3. Update Goal Progress
export const updateGoalProgress = createAsyncThunk(
    'goal/updateProgress',
    async ({ goalId, progressData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Updating progress...");
        try {
            const response = await apiConnector('PUT', GOAL_ENDPOINTS.UPDATE_GOAL_PROGRESS_API(goalId), progressData, { Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success("Progress updated.");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update progress.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// 4. Add a Comment to a Goal
export const addGoalComment = createAsyncThunk(
    'goal/addComment',
    async ({ goalId, commentData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Adding comment...");
        try {
            const response = await apiConnector('POST', GOAL_ENDPOINTS.ADD_GOAL_COMMENT_API(goalId), commentData, { Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success("Comment added.");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add comment.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// 5. Add Evidence to a Goal
export const addGoalEvidence = createAsyncThunk(
    'goal/addEvidence',
    async ({ goalId, formData, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Uploading evidence...");
        try {
            // NOTE: apiConnector must be able to handle FormData for file uploads
            const response = await apiConnector('POST', GOAL_ENDPOINTS.ADD_GOAL_EVIDENCE_API(goalId), formData, { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` });
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            toast.success("Evidence uploaded.");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to upload evidence.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

// 6. Delete a Goal
export const deleteGoal = createAsyncThunk(
    'goal/deleteGoal',
    async ({ goalId, token }, { rejectWithValue }) => {
        const toastId = toast.loading("Deleting goal...");
        try {
            await apiConnector('DELETE', GOAL_ENDPOINTS.DELETE_GOAL_API(goalId), null, { Authorization: `Bearer ${token}` });
            toast.success("Goal deleted.");
            return { goalId };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete goal.';
            toast.error(message);
            return rejectWithValue(message);
        } finally {
            toast.dismiss(toastId);
        }
    }
);

export const getGoalsByEmployeeId = createAsyncThunk(
    'goal/getGoalsByEmployeeId',
    async ({ empId, token }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', GOAL_ENDPOINTS.GET_GOALS_BY_EMPLOYEE_ID_API(empId), null, { Authorization: `Bearer ${token}` });
            if (response.data?.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch goals by employee ID.');
        } catch (error) {
            const message = error.response?.data?.message || 'Could not fetch goals by employee ID.';
            return rejectWithValue(message);
        }
    }
);

const goalSlice = createSlice({
    name: 'goal',
    initialState,
    reducers: {
        clearGoalOperationStatus: (state) => {
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {

        const updateGoalInState = (state, updatedGoal) => {
            const index = state.goals.findIndex(g => g._id === updatedGoal._id);
            if (index !== -1) {
                state.goals[index] = updatedGoal;
            }
        };

        builder
            // Get Goals
            .addCase(getGoals.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGoals.fulfilled, (state, action) => {
                state.loading = false;
                state.goals = action.payload;
            })
            .addCase(getGoals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Goals By Employee ID
            .addCase(getGoalsByEmployeeId.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGoalsByEmployeeId.fulfilled, (state, action) => {
                state.loading = false;
                state.goals = action.payload;
            })
            .addCase(getGoalsByEmployeeId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Goal
            .addCase(createGoal.pending, (state) => {
                state.operationLoading = true;
            })
            .addCase(createGoal.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.goals.unshift(action.payload); // Add to the top
            })
            .addCase(createGoal.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Delete Goal
            .addCase(deleteGoal.pending, (state) => {
                state.operationLoading = true;
            })
            .addCase(deleteGoal.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.goals = state.goals.filter(g => g._id !== action.payload.goalId);
            })
            .addCase(deleteGoal.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Update Progress, Add Comment, Add Evidence (they all update a goal)
            .addMatcher(
                (action) => [updateGoalProgress.pending.type, addGoalComment.pending.type, addGoalEvidence.pending.type].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                }
            )
            .addMatcher(
                (action) => [updateGoalProgress.fulfilled.type, addGoalComment.fulfilled.type, addGoalEvidence.fulfilled.type].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    updateGoalInState(state, action.payload);
                }
            )
            .addMatcher(
                (action) => [updateGoalProgress.rejected.type, addGoalComment.rejected.type, addGoalEvidence.rejected.type].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { clearGoalOperationStatus } = goalSlice.actions;
export default goalSlice.reducer;
