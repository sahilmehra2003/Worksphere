import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { TASK_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    myTasks: {
        upcoming: [],
        overdue: [],
        completed: [],
    },
    allTasks: [], // For Admin/Manager view
    currentTaskDetails: null,
    loadingMyTasks: false,
    loadingAllTasks: false,
    loadingDetails: false,
    operationLoading: false, // For create, update, delete, reopen
    error: null,
    operationError: null,
    operationSuccess: false,
    pagination: { // For lists that support pagination (e.g., getAllTasks)
        allTasks: { currentPage: 1, totalPages: 1, totalRecords: 0 },
        // myTasks might also have pagination if the list can be long
    },
};

// --- Async Thunks ---

// 1. Fetch My Tasks (categorized: upcoming, overdue, completed)
export const fetchMyTasks = createAsyncThunk(
    'task/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TASK_ENDPOINTS.GET_MY_TASKS_API);
            // Backend's getTasksForUser returns { success, data: { upcomingTasks, overdueTasks, completedTasks } }
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch your tasks.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch your tasks.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch All Tasks (for Admin/Manager, with pagination and filters)
export const fetchAllTasks = createAsyncThunk(
    'task/fetchAll',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const params = {
                page,
                limit,
                // Handle search query
                search: filters.search || undefined,
                // Handle status filter
                isCompleted: filters.status === 'completed' ? true :
                    filters.status === 'open' ? false :
                        undefined,
                // Handle priority filter
                priority: filters.priority || undefined,
                // Handle sorting
                sortBy: filters.sortBy || undefined,
                sortOrder: filters.sortOrder || undefined,
            };

            // Remove undefined values
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) => value !== undefined)
            );

            const response = await apiConnector('GET', TASK_ENDPOINTS.GET_ALL_TASKS_API, null, null, cleanParams);
            if (response.data && response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch all tasks.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch all tasks.';
            return rejectWithValue(message);
        }
    }
);

// 3. Fetch Task By ID
export const fetchTaskById = createAsyncThunk(
    'task/fetchById',
    async (taskId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TASK_ENDPOINTS.GET_TASK_BY_ID_API(taskId));
            // Backend's getTaskById returns { success, data: task }
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Task not found.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch task details.';
            return rejectWithValue(message);
        }
    }
);

// 4. Create Task
export const createTask = createAsyncThunk(
    'task/create',
    async (taskData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', TASK_ENDPOINTS.CREATE_TASK_API, taskData);
            // Backend's createTask returns { success, message, data: newTask }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create task.');
            }
            // After creating a task, refresh relevant task lists
            dispatch(fetchMyTasks()); // If it might appear in "my tasks"
            dispatch(fetchAllTasks()); // Or if viewing "all tasks" (consider if this is too broad)
            return response.data.data; // Return the newly created task
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create task.';
            return rejectWithValue(message);
        }
    }
);

// 5. Update Task
export const updateTask = createAsyncThunk(
    'task/update',
    // eslint-disable-next-line no-unused-vars
    async ({ taskId, updatedData }, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', TASK_ENDPOINTS.UPDATE_TASK_API(taskId), updatedData);
            // Backend's updateTask returns { success, message, data: updatedTask }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update task.');
            }
            // Refresh relevant lists
            dispatch(fetchMyTasks());
            dispatch(fetchAllTasks()); // Or a more targeted update if possible
            return response.data.data; // Return the updated task
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update task.';
            return rejectWithValue(message);
        }
    }
);

// 6. Reopen Task
export const reopenTask = createAsyncThunk(
    'task/reopen',
    async ({ taskId, newDeadlineDate, description }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TASK_ENDPOINTS.REOPEN_TASK_API(taskId), {
                newDeadlineDate,
                description
            });
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to reopen task.');
            }
            // Refresh task lists after reopening
            dispatch(fetchAllTasks());
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to reopen task.';
            return rejectWithValue(message);
        }
    }
);

// 7. Delete Task
export const deleteTask = createAsyncThunk(
    'task/delete',
    async (taskId, { dispatch, rejectWithValue }) => {
        try {
            // Backend's deleteTask returns 204 No Content on success or { success, message }
            const response = await apiConnector('DELETE', TASK_ENDPOINTS.DELETE_TASK_API(taskId));
            if (response.status === 204 || (response.data && response.data.success)) {
                dispatch(fetchMyTasks());
                dispatch(fetchAllTasks());
                return { taskId }; // Return taskId for UI to remove it from local list if needed before re-fetch
            }
            return rejectWithValue(response.data?.message || 'Failed to delete task.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete task.';
            return rejectWithValue(message);
        }
    }
);

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        setCurrentTaskDetails: (state, action) => {
            state.currentTaskDetails = action.payload;
        },
        clearTaskOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Tasks
            .addCase(fetchMyTasks.pending, (state) => {
                state.loadingMyTasks = true;
                state.error = null;
            })
            .addCase(fetchMyTasks.fulfilled, (state, action) => {
                state.loadingMyTasks = false;
                state.myTasks.upcoming = action.payload.upcomingTasks || [];
                state.myTasks.overdue = action.payload.overdueTasks || [];
                state.myTasks.completed = action.payload.completedTasks || [];
            })
            .addCase(fetchMyTasks.rejected, (state, action) => {
                state.loadingMyTasks = false;
                state.error = action.payload;
                state.myTasks = { upcoming: [], overdue: [], completed: [] };
            })

            // Fetch All Tasks
            .addCase(fetchAllTasks.pending, (state) => {
                state.loadingAllTasks = true;
                state.error = null;
            })
            .addCase(fetchAllTasks.fulfilled, (state, action) => {
                state.loadingAllTasks = false;
                state.allTasks = action.payload.data || [];
                state.pagination.allTasks = action.payload.pagination || initialState.pagination.allTasks;
            })
            .addCase(fetchAllTasks.rejected, (state, action) => {
                state.loadingAllTasks = false;
                state.error = action.payload;
                state.allTasks = [];
            })

            // Fetch Task By ID
            .addCase(fetchTaskById.pending, (state) => {
                state.loadingDetails = true;
                state.operationError = null; // Or a specific detailsError
                state.currentTaskDetails = null;
            })
            .addCase(fetchTaskById.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentTaskDetails = action.payload;
            })
            .addCase(fetchTaskById.rejected, (state, action) => {
                state.loadingDetails = false;
                state.operationError = action.payload;
                state.currentTaskDetails = null;
            })

            // Common handling for Create, Update, Reopen, Delete operations
            .addMatcher(
                (action) => [
                    createTask.pending.type,
                    updateTask.pending.type,
                    reopenTask.pending.type,
                    deleteTask.pending.type
                ].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [
                    createTask.fulfilled.type,
                    updateTask.fulfilled.type,
                    reopenTask.fulfilled.type,
                    deleteTask.fulfilled.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    // Lists are re-fetched by the thunks.
                    // If currentTaskDetails was affected, it might get updated or cleared.
                    if (action.type === updateTask.fulfilled.type || action.type === reopenTask.fulfilled.type) {
                        if (state.currentTaskDetails?._id === action.payload._id) {
                            state.currentTaskDetails = action.payload;
                        }
                    }
                    if (action.type === deleteTask.fulfilled.type) {
                        if (state.currentTaskDetails?._id === action.payload.taskId) {
                            state.currentTaskDetails = null;
                        }
                    }
                }
            )
            .addMatcher(
                (action) => [
                    createTask.rejected.type,
                    updateTask.rejected.type,
                    reopenTask.rejected.type,
                    deleteTask.rejected.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { setCurrentTaskDetails, clearTaskOperationStatus } = taskSlice.actions;

export default taskSlice.reducer;