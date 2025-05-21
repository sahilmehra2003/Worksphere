import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apiConnector } from '../../services/apiConnector'; 

import { TRANSACTION_ENDPOINTS } from '../../services/apiEndpoints'; 



const initialState = {

    transactions: [], 

    currentTransaction: null,

    loading: false,

    error: null,


};




// 1. Fetch All Transactions

export const fetchAllTransactions = createAsyncThunk(

    'transaction/fetchAll',

    async (_, { rejectWithValue }) => { 

        try {

            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_ALL_TRANSACTIONS_API);

            // Your transactionController.js returns { success, message, transactions }

            if (response.data && response.data.success) {

                return response.data.transactions;

            }

            return rejectWithValue(response.data?.message || 'Failed to fetch transactions.');

        } catch (error) {

            const message = error.response?.data?.message || error.message || 'Failed to fetch transactions.';

            return rejectWithValue(message);

        }

    }

);



// 2. Fetch Transaction By ID

export const fetchTransactionById = createAsyncThunk(

    'transaction/fetchById',

    async (transactionId, { rejectWithValue }) => {

        try {

            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_TRANSACTION_BY_ID_API(transactionId));

            // Your transactionController.js returns { success, message, transaction }

            if (response.data && response.data.success) {

                return response.data.transaction;

            }

            return rejectWithValue(response.data?.message || 'Transaction not found or error fetching details.');

        } catch (error) {

            const message = error.response?.data?.message || error.message || 'Failed to fetch transaction details.';

            return rejectWithValue(message);

        }

    }

);


// If you add Create, Update, Delete for transactions later, you'll add thunks for them here.

const transactionSlice = createSlice({

    name: 'transaction',

    initialState,

    reducers: {

        setCurrentTransaction: (state, action) => {

            state.currentTransaction = action.payload;

        },

        clearTransactionError: (state) => {

            state.error = null;

        },

        // You might not have specific "operation" success/error for just fetching,

        // but if CUD operations are added, you'd add clearOperationStatus here.

    },

    extraReducers: (builder) => {

        builder

            // Fetch All Transactions

            .addCase(fetchAllTransactions.pending, (state) => {

                state.loading = true;

                state.error = null;

            })

            .addCase(fetchAllTransactions.fulfilled, (state, action) => {

                state.loading = false;

                state.transactions = action.payload || []; // Assuming payload is the array

            })

            .addCase(fetchAllTransactions.rejected, (state, action) => {

                state.loading = false;

                state.error = action.payload;

                state.transactions = [];

            })



            // Fetch Transaction By ID

            .addCase(fetchTransactionById.pending, (state) => {

                state.loading = true; // Or a specific loading flag like loadingCurrent

                state.currentTransaction = null;

                state.error = null; // Clear previous error for this specific fetch

            })

            .addCase(fetchTransactionById.fulfilled, (state, action) => {

                state.loading = false;

                state.currentTransaction = action.payload;

            })

            .addCase(fetchTransactionById.rejected, (state, action) => {

                state.loading = false;

                state.error = action.payload; // Set specific error for this fetch

                state.currentTransaction = null;

            });

    },

});



export const { setCurrentTransaction, clearTransactionError } = transactionSlice.actions;



export default transactionSlice.reducer;

