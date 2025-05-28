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
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch clients');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch clients');
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
    async (clientData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', CLIENT_ENDPOINTS.CREATE_CLIENT_API, clientData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create client');
            }
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create client');
        }
    }
);

export const updateClient = createAsyncThunk(
    'client/update',
    async ({ clientId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', CLIENT_ENDPOINTS.UPDATE_CLIENT_API(clientId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update client');
            }
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update client');
        }
    }
);

export const deactivateClient = createAsyncThunk(
    'client/deactivate',
    async (clientId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', CLIENT_ENDPOINTS.DEACTIVATE_CLIENT_API(clientId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to deactivate client');
            }
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to deactivate client');
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
        clearCurrentClient: (state) => {
            state.currentClient = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload;
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
            .addCase(createClient.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.clients.push(action.payload);
            })
            .addCase(createClient.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })
            .addCase(updateClient.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const index = state.clients.findIndex(client => client._id === action.payload._id);
                if (index !== -1) {
                    state.clients[index] = action.payload;
                }
                if (state.currentClient?._id === action.payload._id) {
                    state.currentClient = action.payload;
                }
            })
            .addCase(updateClient.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })
            .addCase(deactivateClient.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(deactivateClient.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const index = state.clients.findIndex(client => client._id === action.payload._id);
                if (index !== -1) {
                    state.clients[index] = action.payload;
                }
                if (state.currentClient?._id === action.payload._id) {
                    state.currentClient = action.payload;
                }
            })
            .addCase(deactivateClient.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            });
    },
});

export const { setCurrentClient, clearClientOperationStatus, clearCurrentClient } = clientSlice.actions;

export default clientSlice.reducer;