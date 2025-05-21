import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { PROJECT_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    projects: [], // Array to store the list of all projects
    currentProject: null, // To store details of a single project
    loading: false, // For fetching the list of projects
    operationLoading: false, // For CUD operations
    error: null,
    operationError: null,
    operationSuccess: false,
   // pagination: { currentPage: 1, totalPages: 1, totalRecords: 0 },
};


// 1. Fetch All Projects
export const fetchAllProjects = createAsyncThunk(
    'project/fetchAll',
    async (_, { rejectWithValue }) => { // arg is _ if not used
        try {
            const response = await apiConnector('GET', PROJECT_ENDPOINTS.GET_ALL_PROJECTS_API);
            // Your projectController.js for getAllProjects returns { success, projects }
            if (response && Array.isArray(response.data)) {
                console.log("ProjectSlice: API call successful, response.data is an array. Returning it.");
                return response.data; // Return the array of projects directly
            } else {
                const errorMessage = response.data?.message || 'Failed to fetch projects: Unexpected response structure.';
                console.error("ProjectSlice: Rejecting - " + errorMessage, response.data);
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch projects.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch Project By ID
export const fetchProjectById = createAsyncThunk(
    'project/fetchById',
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', PROJECT_ENDPOINTS.GET_PROJECT_BY_ID_API(projectId));
            // Your projectController.js for getProjectById returns { success, project }
            if (response.data && response.data.success) {
                return response.data.project;
            }
            return rejectWithValue(response.data?.message || 'Project not found or error fetching details.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch project details.';
            return rejectWithValue(message);
        }
    }
);

// 3. Create Project
export const createProject = createAsyncThunk(
    'project/create',
    async (projectData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', PROJECT_ENDPOINTS.CREATE_PROJECT_API, projectData);
            // Your projectController.js for createProject returns { success, message, project }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create project.');
            }
            dispatch(fetchAllProjects()); // Re-fetch all projects to update the list
            return response.data; // { success, message, project }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create project.';
            return rejectWithValue(message);
        }
    }
);

// 4. Update Project (Assuming you have an update controller and route)
export const updateProject = createAsyncThunk(
    'project/update',
    async ({ projectId, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', PROJECT_ENDPOINTS.UPDATE_PROJECT_API(projectId), updatedData);
            // Assume backend returns { success, message, project: updatedProject }
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update project.');
            }
            dispatch(fetchAllProjects()); // Re-fetch to update list
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update project.';
            return rejectWithValue(message);
        }
    }
);

// 5. Delete Project (Assuming you have a delete controller and route)
export const deleteProject = createAsyncThunk(
    'project/delete',
    async (projectId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', PROJECT_ENDPOINTS.DELETE_PROJECT_API(projectId));
            // Assume backend returns { success, message } or 204 No Content
            if (response.status === 204 || (response.data && response.data.success)) {
                dispatch(fetchAllProjects()); // Re-fetch to update list
                return { projectId, ...response.data }; // Return ID for UI or success message
            }
            return rejectWithValue(response.data?.message || 'Failed to delete project.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete project.';
            return rejectWithValue(message);
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
        clearProjectOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Projects
            .addCase(fetchAllProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload || []; // Assuming payload is the array
            })
            .addCase(fetchAllProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.projects = [];
            })

            // Fetch Project By ID
            .addCase(fetchProjectById.pending, (state) => {
                state.loading = true; // Or a specific loadingCurrent
                state.currentProject = null;
                state.operationError = null; // Using operationError for specific fetch error
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

            // Common handling for CUD operations
            .addMatcher(
                (action) => [createProject.pending.type, updateProject.pending.type, deleteProject.pending.type].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [createProject.fulfilled.type, updateProject.fulfilled.type, deleteProject.fulfilled.type].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    // List is re-fetched in the thunks.
                    // Update currentProject if it was the one affected
                    if (action.type === updateProject.fulfilled.type && state.currentProject?._id === action.payload.project?._id) {
                        state.currentProject = action.payload.project;
                    }
                    if (action.type === deleteProject.fulfilled.type && state.currentProject?._id === action.payload.projectId) {
                        state.currentProject = null; // Clear if current was deleted
                    }
                }
            )
            .addMatcher(
                (action) => [createProject.rejected.type, updateProject.rejected.type, deleteProject.rejected.type].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { setCurrentProject, clearProjectOperationStatus } = projectSlice.actions;

export default projectSlice.reducer;