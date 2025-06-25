import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { TEAM_ENDPOINTS } from '../../services/apiEndpoints';
import { apiConnector } from '../../services/apiConnector';

const initialState = {
    teams: [],
    currentTeam: null,
    loading: false,
    error: null,
    operationSuccess: false,
};

// Async thunks
export const getAllTeams = createAsyncThunk(
    'projectTeam/getAllTeams',
    async (_, { rejectWithValue }) => {
        try {
            //   dispatch(projectTeamSlice.actions.clearError()); 
            console.log('[Slice/getAllTeams] Fetching all teams...');
            const response = await apiConnector('GET', TEAM_ENDPOINTS.GET_ALL_TEAMS_API); // response is the full Axios response object
            console.log('[Slice/getAllTeams] Raw API Response Object:', response);

            // Access the actual backend response data from response.data
            const backendResponse = response.data;

            if (backendResponse && backendResponse.success && Array.isArray(backendResponse.data)) {
                console.log('[Slice/getAllTeams] API call successful. Returning data:', backendResponse.data);
                return backendResponse.data; // Return the actual array of teams
            } else {
                console.error('[Slice/getAllTeams] API call unsuccessful or unexpected structure:', backendResponse);
                return rejectWithValue(backendResponse?.message || 'Failed to fetch teams: Invalid response structure');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch teams.';
            console.error('[Slice/getAllTeams] Caught error in thunk:', errorMessage, error);
            return rejectWithValue(errorMessage);
        }
    }
);

// Apply similar corrections to other thunks (createTeam, getTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember)
// Example for createTeam:
export const createTeam = createAsyncThunk(
    'projectTeam/createTeam',
    async (teamData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', TEAM_ENDPOINTS.CREATE_TEAM_API, teamData);
            const backendResponse = response.data;
            if (!backendResponse.success) {
                return rejectWithValue(backendResponse.message || 'Failed to create Team Data.');
            }
            // If you have a getAllTeams thunk and want to refresh the list:
            // dispatch(getAllTeams());
            return backendResponse.data; // This is the new team object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create team.');
        }
    }
);

// --- getTeam by ID ---
export const getTeam = createAsyncThunk(
    'projectTeam/getTeam',
    async (teamId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TEAM_ENDPOINTS.GET_TEAM_BY_ID_API(teamId));
            const backendResponse = response.data;
            if (!backendResponse.success) {
                return rejectWithValue(backendResponse.message || 'Failed to fetch Team Data.');
            }
            return backendResponse.data; // This is the team object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch team.');
        }
    }
);

// --- updateTeam ---
export const updateTeam = createAsyncThunk(
    'projectTeam/updateTeam',
    async ({ teamId, teamData }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', TEAM_ENDPOINTS.UPDATE_TEAM_API(teamId), teamData);
            const backendResponse = response.data;
            if (!backendResponse.success) {
                return rejectWithValue(backendResponse.message || 'Failed to update Team Data.');
            }
            // dispatch(getAllTeams()); // Optionally refresh list
            return backendResponse.data; // This is the updated team object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update team.');
        }
    }
);

// --- deleteTeam ---
export const deleteTeam = createAsyncThunk(
    'projectTeam/deleteTeam',
    async (teamId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', TEAM_ENDPOINTS.DELETE_TEAM_API(teamId));
            const backendResponse = response.data;
            if (!backendResponse.success) {
                return rejectWithValue(backendResponse.message || 'Failed to delete Team Data.');
            }
            // dispatch(getAllTeams()); // Optionally refresh list
            return { teamId, message: backendResponse.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete team.');
        }
    }
);

// --- addTeamMember ---
export const addTeamMember = createAsyncThunk(
    'projectTeam/addTeamMember',
    async ({ teamId, memberId }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', TEAM_ENDPOINTS.ADD_TEAM_MEMBER_API(teamId), { memberId });
            const backendResponse = response.data;
            if (!backendResponse.success) {
                return rejectWithValue(backendResponse.message || 'Failed to add Team Member.');
            }
            // dispatch(getAllTeams()); // Optionally refresh list
            // dispatch(getTeam(teamId)); // Or refresh current team details
            return backendResponse.data; // This is the updated team object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add member.');
        }
    }
);

// --- removeTeamMember ---
export const removeTeamMember = createAsyncThunk(
    'projectTeam/removeTeamMember',
    async ({ teamId, memberId }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', TEAM_ENDPOINTS.REMOVE_TEAM_MEMBER_API(teamId), { memberId });
            const backendResponse = response.data;
            if (!backendResponse.success) {
                return rejectWithValue(backendResponse.message || 'Failed to remove Team Member.');
            }
            // dispatch(getAllTeams()); // Optionally refresh list
            // dispatch(getTeam(teamId)); // Or refresh current team details
            return backendResponse.data; // This is the updated team object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove member.');
        }
    }
);


const projectTeamSlice = createSlice({
    name: 'projectTeam',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearOperationSuccess: (state) => {
            state.operationSuccess = false;
        },
        clearCurrentTeam: (state) => {
            state.currentTeam = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get All Teams
            .addCase(getAllTeams.pending, (state) => {
                console.log('[Slice/getAllTeams.pending] Setting loading true.'); // You should see this
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllTeams.fulfilled, (state, action) => {
                // ------ VITAL DEBUGGING LOGS START ------
                console.log('--------------------------------------------------------------------');
                console.log('[Slice/getAllTeams.fulfilled] Reducer CALLED. Action type:', action.type);
                console.log('[Slice/getAllTeams.fulfilled] Action payload (should be array of teams):', action.payload);

                state.loading = false;
                state.teams = action.payload; // This is the crucial state update

                if (state.teams) {
                    try {
                        console.log('[Slice/getAllTeams.fulfilled] state.teams AFTER assignment:', current(state.teams));
                    } catch (e) {
                        console.error('[Slice/getAllTeams.fulfilled] Error logging state.teams with current():', e);
                        console.log('[Slice/getAllTeams.fulfilled] state.teams AFTER assignment (raw):', state.teams);
                    }
                }
                console.log('--------------------------------------------------------------------');
                // ------ VITAL DEBUGGING LOGS END ------
            })
            .addCase(getAllTeams.rejected, (state, action) => {
                console.error('[Slice/getAllTeams.rejected] Reducer CALLED. Action type:', action.type); // You should see this if it rejects
                console.error('[Slice/getAllTeams.rejected] Error payload:', action.payload);
                state.loading = false;
                state.error = action.payload || 'Failed to fetch teams';
                state.teams = []; // Reset teams on error
            })

            // Get Single Team
            .addCase(getTeam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTeam = action.payload; // action.payload is the team object
                if (state.currentTeam) {
                    try {
                        console.log('[Slice/getTeam.fulfilled] Current team updated:', current(state.currentTeam));
                    } catch (e) {
                        console.error('[Slice/getTeam.fulfilled] Error logging state.currentTeam with current():', e);
                        console.log('[Slice/getTeam.fulfilled] state.currentTeam AFTER assignment (raw):', state.currentTeam);
                    }
                }
            })
            .addCase(getTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.currentTeam = null;
            })

            // Create Team
            .addCase(createTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.operationSuccess = true;
                state.teams.push(action.payload); // action.payload is the new team object
                state.currentTeam = action.payload;
                console.log('[Slice/createTeam.fulfilled] New team added. Teams:', current(state.teams));
            })

            // Delete Team
            .addCase(deleteTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.operationSuccess = true;
                state.teams = state.teams.filter(team => team._id !== action.payload.teamId);
                if (state.currentTeam?._id === action.payload.teamId) {
                    state.currentTeam = null;
                }
                console.log('[Slice/deleteTeam.fulfilled] Team deleted. Teams:', current(state.teams));
            })

            // Common pending state for operations that modify data
            .addMatcher(
                (action) => [
                    createTeam.pending.type,
                    updateTeam.pending.type,
                    deleteTeam.pending.type,
                    addTeamMember.pending.type,
                    removeTeamMember.pending.type,
                ].includes(action.type),
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.operationSuccess = false;
                }
            )
            // Common rejected state
            .addMatcher(
                (action) => [
                    createTeam.rejected.type,
                    updateTeam.rejected.type,
                    deleteTeam.rejected.type,
                    addTeamMember.rejected.type,
                    removeTeamMember.rejected.type,
                    getAllTeams.rejected.type,
                    getTeam.rejected.type
                ].includes(action.type),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload || 'An operation failed';
                    state.operationSuccess = false;
                    console.error('[Slice/Matcher.rejected] Error payload:', action.payload);
                }
            )
            // Update Team / Add Member / Remove Member (they all return the updated team object)
            .addMatcher(
                (action) => [
                    updateTeam.fulfilled.type,
                    addTeamMember.fulfilled.type,
                    removeTeamMember.fulfilled.type,
                ].includes(action.type),
                (state, action) => {
                    state.loading = false;
                    state.operationSuccess = true;
                    const updatedTeam = action.payload; // action.payload is the updated team object
                    const index = state.teams.findIndex(team => team._id === updatedTeam._id);
                    if (index !== -1) {
                        state.teams[index] = updatedTeam;
                    }
                    if (state.currentTeam?._id === updatedTeam._id) {
                        state.currentTeam = updatedTeam;
                    }
                    if (state.teams) {
                        try {
                            console.log(`[Slice/${action.type}] Team updated. Teams:`, current(state.teams), "Current:", state.currentTeam ? current(state.currentTeam) : null);
                        } catch (e) {
                            console.error(`[Slice/${action.type}] Error logging state.teams or state.currentTeam with current():`, e);
                            console.log(`[Slice/${action.type}] state.teams AFTER assignment (raw):`, state.teams, "Current:", state.currentTeam);
                        }
                    }
                }
            );
    }
});

export const { clearError, clearOperationSuccess, clearCurrentTeam } = projectTeamSlice.actions;

export default projectTeamSlice.reducer;