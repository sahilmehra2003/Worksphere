import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { CLIENT_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    clients: [],
    currentClient: null,
    loading: false,
    operationLoading: false,
    error: null,
    operationError: null,
    operationSuccess: false,
};

export const fetchAllClients = createAsyncThunk(
    'client/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', CLIENT_ENDPOINTS.GET_ALL_CLIENTS_API);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch clients.';
            return rejectWithValue(message);
        }
    }
);

export const fetchClientById = createAsyncThunk(
    'client/fetchById',
    async (clientId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', CLIENT_ENDPOINTS.GET_CLIENT_BY_ID_API(clientId));
            if (response.data && (response.data.success === undefined || response.data.success)) {
                return response.data.client || response.data;
            }
            return rejectWithValue(response.data?.message || 'Client not found or error fetching details.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch client details.';
            return rejectWithValue(message);
        }
    }
);

export const createClient = createAsyncThunk(
    'client/create',
    async (clientData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', CLIENT_ENDPOINTS.CREATE_CLIENT_API, clientData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create client.');
            }
            dispatch(fetchAllClients());
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create client.';
            return rejectWithValue(message);
        }
    }
);

export const updateClient = createAsyncThunk(
    'client/update',
    async ({ clientId, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', CLIENT_ENDPOINTS.UPDATE_CLIENT_API(clientId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update client.');
            }
            dispatch(fetchAllClients());
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update client.';
            return rejectWithValue(message);
        }
    }
);

export const deactivateClient = createAsyncThunk(
    'client/deactivate',
    async (clientId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', CLIENT_ENDPOINTS.DEACTIVATE_CLIENT_API(clientId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to deactivate client.');
            }
            dispatch(fetchAllClients());
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to deactivate client.';
            return rejectWithValue(message);
        }
    }
);

const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        setCurrentClient: (state, action) => {
            state.currentClient = action.payload;
        },
        clearClientOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload || [];
            })
            .addCase(fetchAllClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.clients = [];
            })
            .addCase(fetchClientById.pending, (state) => {
                state.loading = true;
                state.currentClient = null;
                state.operationError = null;
            })
            .addCase(fetchClientById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentClient = action.payload;
            })
            .addCase(fetchClientById.rejected, (state, action) => {
                state.loading = false;
                state.operationError = action.payload;
                state.currentClient = null;
            })
            .addMatcher(
                (action) => [createClient.pending.type, updateClient.pending.type, deactivateClient.pending.type].includes(action.type),
                (state) => {
                    state.operationLoading = true;
                    state.operationError = null;
                    state.operationSuccess = false;
                }
            )
            .addMatcher(
                (action) => [createClient.fulfilled.type, updateClient.fulfilled.type, deactivateClient.fulfilled.type].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationSuccess = true;
                    if (action.type === updateClient.fulfilled.type && state.currentClient?._id === action.payload.client?._id) {
                        state.currentClient = action.payload.client;
                    }
                    if (action.type === deactivateClient.fulfilled.type && state.currentClient?._id === action.payload.data?._id) {
                        state.currentClient = action.payload.data;
                    }
                }
            )
            .addMatcher(
                (action) => [createClient.rejected.type, updateClient.rejected.type, deactivateClient.rejected.type].includes(action.type),
                (state, action) => {
                    state.operationLoading = false;
                    state.operationError = action.payload;
                }
            );
    },
});

export const { setCurrentClient, clearClientOperationStatus } = clientSlice.actions;

export default clientSlice.reducer;