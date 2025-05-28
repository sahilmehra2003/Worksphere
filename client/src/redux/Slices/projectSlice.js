import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { PROJECT_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    projects: [],
    currentProject: null,
    loading: false,
    operationLoading: false,
    error: null,
    operationError: null,
    operationSuccess: false,
};

export const fetchAllProjects = createAsyncThunk(
    'project/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', PROJECT_ENDPOINTS.GET_ALL_PROJECTS_API);
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                return response.data.data;
            } else {
                return rejectWithValue(response.data?.message || 'Failed to fetch projects: Unexpected response.');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch projects.');
        }
    }
);

export const fetchProjectById = createAsyncThunk(
    'project/fetchById',
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', PROJECT_ENDPOINTS.GET_PROJECT_BY_ID_API(projectId));
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Project not found.');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch project details.');
        }
    }
);

export const createProject = createAsyncThunk(
    'project/create',
    async (projectData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', PROJECT_ENDPOINTS.CREATE_PROJECT_API, projectData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create project.');
            }
            dispatch(fetchAllProjects());
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create project.');
        }
    }
);

export const updateProject = createAsyncThunk(
    'project/update',
    async ({ projectId, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', PROJECT_ENDPOINTS.UPDATE_PROJECT_API(projectId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update project.');
            }
            dispatch(fetchAllProjects());
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update project.');
        }
    }
);

export const deleteProject = createAsyncThunk(
    'project/delete',
    async (projectId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', PROJECT_ENDPOINTS.DELETE_PROJECT_API(projectId));
            if (response.data && response.data.success) {
                dispatch(fetchAllProjects());
                return { projectId, message: response.data.message };
            }
            return rejectWithValue(response.data?.message || 'Failed to delete project.');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete project.');
        }
    }
);

export const addProjectTeam = createAsyncThunk(
    'project/addTeam',
    async ({ projectId, teamData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', PROJECT_ENDPOINTS.ADD_PROJECT_TEAM_API(projectId), teamData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to add team to project.');
            }
            dispatch(fetchAllProjects());
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add team to project.');
        }
    }
);

export const removeProjectTeam = createAsyncThunk(
    'project/removeTeam',
    async ({ projectId, teamData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', PROJECT_ENDPOINTS.REMOVE_PROJECT_TEAM_API(projectId), teamData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to remove team from project.');
            }
            dispatch(fetchAllProjects());
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove team from project.');
        }
    }
);

export const addProjectClient = createAsyncThunk(
    'project/addClient',
    async ({ projectId, clientData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', PROJECT_ENDPOINTS.ADD_PROJECT_CLIENT_API(projectId), clientData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to add client to project.');
            }
            dispatch(fetchAllProjects());
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add client to project.');
        }
    }
);

export const removeProjectClient = createAsyncThunk(
    'project/removeClient',
    async ({ projectId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', PROJECT_ENDPOINTS.REMOVE_PROJECT_CLIENT_API(projectId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to remove client from project.');
            }
            dispatch(fetchAllProjects());
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove client from project.');
        }
    }
);

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
        },
        clearProjectOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload || [];
            })
            .addCase(fetchAllProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.projects = [];
            })
            .addCase(fetchProjectById.pending, (state) => {
                state.loading = true;
                state.currentProject = null;
                state.operationError = null;
            })
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
                state.loading = false;
                state.operationError = action.payload;
                state.currentProject = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                if (state.currentProject?._id === action.payload.projectId) {
                    state.currentProject = null;
                }
            })
            .addMatcher(
                (action) => [
                    createProject.pending.type,
                    updateProject.pending.type,
                    deleteProject.pending.type,
                    addProjectTeam.pending.type,
                    removeProjectTeam.pending.type,
                    addProjectClient.pending.type,
                    removeProjectClient.pending.type
                ].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [
                    createProject.fulfilled.type,
                    updateProject.fulfilled.type,
                    addProjectTeam.fulfilled.type,
                    removeProjectTeam.fulfilled.type,
                    addProjectClient.fulfilled.type,
                    removeProjectClient.fulfilled.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    if (state.currentProject?._id === action.payload?._id || action.type === createProject.fulfilled.type) {
                        state.currentProject = action.payload;
                    }
                }
            )
            .addMatcher(
                (action) => [
                    createProject.rejected.type,
                    updateProject.rejected.type,
                    deleteProject.rejected.type,
                    addProjectTeam.rejected.type,
                    removeProjectTeam.rejected.type,
                    addProjectClient.rejected.type,
                    removeProjectClient.rejected.type
                ].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                    state.operationSuccess = false;
                }
            );
    },
});

export const { setCurrentProject, clearCurrentProject, clearProjectOperationStatus } = projectSlice.actions;

export default projectSlice.reducer;