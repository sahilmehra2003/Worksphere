import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { DEPARTMENT_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    departments: [],
    currentDepartmentIndex: 0,
    currentDepartmentDetails: null,
    loading: false,
    error: null,
    operationLoading: false,
    operationError: null,
    operationSuccess: false,
};

// Fetch all departments for the slider/list
export const fetchAllDepartments = createAsyncThunk(
    'department/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DEPARTMENT_ENDPOINTS.GET_ALL_DEPARTMENTS_API);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch departments.';
            return rejectWithValue(message);
        }
    }
);

// Fetch department by ID (for editing or details view)
export const fetchDepartmentById = createAsyncThunk(
    'department/fetchById',
    async (departmentId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', DEPARTMENT_ENDPOINTS.GET_DEPARTMENT_BY_ID_API(departmentId));
            if (response.data.success) {
                return response.data.department;
            }
            return rejectWithValue(response.data.message || 'Failed to fetch department details.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch department details.';
            return rejectWithValue(message);
        }
    }
);

export const createDepartment = createAsyncThunk(
    'department/create',
    async (departmentData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', DEPARTMENT_ENDPOINTS.CREATE_DEPARTMENT_API, departmentData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create department.');
            }
            dispatch(fetchAllDepartments()); // Refresh list after create
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create department.';
            return rejectWithValue(message);
        }
    }
);

export const updateDepartment = createAsyncThunk(
    'department/update',
    async ({ departmentId, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', DEPARTMENT_ENDPOINTS.UPDATE_DEPARTMENT_API(departmentId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update department.');
            }
            dispatch(fetchAllDepartments()); // Refresh list after update
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update department.';
            return rejectWithValue(message);
        }
    }
);

// Set department inactive (used for delete in UI)
export const setDepartmentInactive = createAsyncThunk(
    'department/setInactive',
    async (departmentId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', DEPARTMENT_ENDPOINTS.SET_DEPARTMENT_INACTIVE_API(departmentId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to deactivate department.');
            }
            dispatch(fetchAllDepartments()); // Refresh list after deactivation
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to deactivate department.';
            return rejectWithValue(message);
        }
    }
);

const departmentSlice = createSlice({
    name: 'department',
    initialState,
    reducers: {
        setCurrentDepartmentByIndex: (state, action) => {
            const newIndex = action.payload;
            if (state.departments.length > 0) {
                if (newIndex >= 0 && newIndex < state.departments.length) {
                    state.currentDepartmentIndex = newIndex;
                    state.currentDepartmentDetails = state.departments[newIndex];
                } else if (newIndex < 0) { // Loop to last
                    state.currentDepartmentIndex = state.departments.length - 1;
                    state.currentDepartmentDetails = state.departments[state.departments.length - 1];
                } else { // Loop to first
                    state.currentDepartmentIndex = 0;
                    state.currentDepartmentDetails = state.departments[0];
                }
            }
        },
        clearDepartmentOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllDepartments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = action.payload;
                if (state.departments.length > 0) {
                    if (state.currentDepartmentIndex >= state.departments.length) {
                        state.currentDepartmentIndex = 0;
                    }
                    state.currentDepartmentDetails = state.departments[state.currentDepartmentIndex];
                } else {
                    state.currentDepartmentIndex = 0;
                    state.currentDepartmentDetails = null;
                }
            })
            .addCase(fetchAllDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.departments = [];
                state.currentDepartmentDetails = null;
            })
            .addCase(fetchDepartmentById.pending, (state) => {
                state.loading = true;
                state.operationError = null;
            })
            .addCase(fetchDepartmentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDepartmentDetails = action.payload;
                const index = state.departments.findIndex(d => d._id === action.payload._id);
                if (index !== -1) {
                    state.departments[index] = action.payload;
                }
            })
            .addCase(fetchDepartmentById.rejected, (state, action) => {
                state.loading = false;
                state.operationError = action.payload;
            })
            .addCase(createDepartment.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(createDepartment.fulfilled, (state) => {
                state.operationLoading = false;
                state.operationSuccess = true;
            })
            .addCase(createDepartment.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })
            .addCase(updateDepartment.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                if (state.currentDepartmentDetails && state.currentDepartmentDetails._id === action.payload.department._id) {
                    state.currentDepartmentDetails = action.payload.department;
                }
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })
            .addCase(setDepartmentInactive.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(setDepartmentInactive.fulfilled, (state) => {
                state.operationLoading = false;
                state.operationSuccess = true;
            })
            .addCase(setDepartmentInactive.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            });
    },
});

export const { setCurrentDepartmentByIndex, clearDepartmentOperationStatus } = departmentSlice.actions;

export default departmentSlice.reducer;