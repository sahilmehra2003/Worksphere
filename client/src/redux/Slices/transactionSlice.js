import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { TRANSACTION_ENDPOINTS } from '../../services/apiEndpoints'

const initialState = {
    transactions: [], // For lists like getAllTransactions, getDepartmentTransactions etc.
    currentTransaction: null, // For getTransactionById
    monthlyReportData: [],
    transactionStats: null, // Or an appropriate initial structure e.g., { revenue: {}, expense: {} }
    availableYears: [],
    loading: false, // General loading for lists
    detailsLoading: false, // For fetching a single transaction's details
    reportLoading: false, // For reports like monthly or stats
    yearsLoading: false, // For fetching available years
    operationLoading: false, // For CUD operations and approve
    error: null, // General error for list fetching
    detailsError: null,
    reportError: null,
    yearsError: null,
    operationError: null,
    operationSuccess: false, // Flag for successful CUD/approve operations
    pagination: { // For paginated lists
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
};



// 1. Fetch All Transactions (existing, can be enhanced with filters from backend)
export const fetchAllTransactions = createAsyncThunk(
    'transaction/fetchAll',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_ALL_TRANSACTIONS_API, null, null, params);
            if (response.data && response.data.success) {
                return response.data; // Expects { success, data: transactions, pagination }
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch transactions.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch transactions.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch Transaction By ID (existing)
export const fetchTransactionById = createAsyncThunk(
    'transaction/fetchById',
    async (transactionId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_TRANSACTION_BY_ID_API(transactionId));
            if (response.data && response.data.success) {
                return response.data.data; // Expects { success, data: transaction }
            }
            return rejectWithValue(response.data?.message || 'Transaction not found.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch transaction details.';
            return rejectWithValue(message);
        }
    }
);

// 3. Create Transaction
export const createTransaction = createAsyncThunk(
    'transaction/create',
    async (transactionData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', TRANSACTION_ENDPOINTS.CREATE_TRANSACTION_API, transactionData);
            if (response.data && response.data.success) {
                // dispatch(fetchAllTransactions({})); // Optionally re-fetch or update list locally
                return response.data.data; // The new transaction object
            }
            return rejectWithValue(response.data?.message || 'Failed to create transaction.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create transaction.';
            return rejectWithValue(message);
        }
    }
);

// 4. Update Transaction
export const updateTransaction = createAsyncThunk(
    'transaction/update',
    async ({ transactionId, updatedData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', TRANSACTION_ENDPOINTS.UPDATE_TRANSACTION_API(transactionId), updatedData);
            if (response.data && response.data.success) {
                // dispatch(fetchAllTransactions({})); // Optionally re-fetch
                return response.data.data; // The updated transaction object
            }
            return rejectWithValue(response.data?.message || 'Failed to update transaction.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update transaction.';
            return rejectWithValue(message);
        }
    }
);

// 5. Delete Transaction
export const deleteTransaction = createAsyncThunk(
    'transaction/delete',
    async (transactionId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', TRANSACTION_ENDPOINTS.DELETE_TRANSACTION_API(transactionId));
            // Delete typically returns 200/204 on success
            if (response.status === 200 || response.status === 204 || (response.data && response.data.success)) {
                // dispatch(fetchAllTransactions({})); // Optionally re-fetch
                return { transactionId }; // Return ID for local removal from list
            }
            return rejectWithValue(response.data?.message || 'Failed to delete transaction.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete transaction.';
            return rejectWithValue(message);
        }
    }
);

// 6. Approve Transaction
export const approveTransaction = createAsyncThunk(
    'transaction/approve',
    async (transactionId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TRANSACTION_ENDPOINTS.APPROVE_TRANSACTION_API(transactionId));
            if (response.data && response.data.success) {
                // dispatch(fetchAllTransactions({})); // Optionally re-fetch
                return response.data.data; // The approved transaction object
            }
            return rejectWithValue(response.data?.message || 'Failed to approve transaction.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to approve transaction.';
            return rejectWithValue(message);
        }
    }
);

// 7. Fetch Monthly Report
export const fetchMonthlyReport = createAsyncThunk(
    'transaction/fetchMonthlyReport',
    async ({ year }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_MONTHLY_REPORT_API, null, null, { year });
            if (response.data && response.data.success) {
                return response.data.data; // Array of monthly data
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch monthly report.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch monthly report.';
            return rejectWithValue(message);
        }
    }
);

// 8. Fetch Available Years
export const fetchAvailableYears = createAsyncThunk(
    'transaction/fetchAvailableYears',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_AVAILABLE_YEARS_API);
            if (response.data && response.data.success) {
                return response.data.data; // Array of years
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch available years.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch available years.';
            return rejectWithValue(message);
        }
    }
);

// 9. Fetch Transaction Stats
export const fetchTransactionStats = createAsyncThunk(
    'transaction/fetchStats',
    async ({ startDate, endDate } = {}, { rejectWithValue }) => { // Optional params
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_TRANSACTION_STATS_API, null, null, Object.keys(params).length ? params : null);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch transaction stats.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch transaction stats.';
            return rejectWithValue(message);
        }
    }
);



export const fetchDepartmentTransactions = createAsyncThunk(
    'transaction/fetchByDepartment',
    async (departmentId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_DEPARTMENT_TRANSACTIONS_API(departmentId));
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch department transactions.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch department transactions.';
            return rejectWithValue(message);
        }
    }
);
// Similar thunks for fetchProjectTransactions, fetchClientTransactions

// Add new thunks for enhanced features
export const fetchTransactionsByDateRange = createAsyncThunk(
    'transaction/fetchByDateRange',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_TRANSACTIONS_BY_DATE_RANGE_API, null, null, { startDate, endDate });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch transactions by date range.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch transactions by date range.';
            return rejectWithValue(message);
        }
    }
);

export const fetchTransactionsByStatus = createAsyncThunk(
    'transaction/fetchByStatus',
    async (status, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_TRANSACTIONS_BY_STATUS_API(status));
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch transactions by status.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch transactions by status.';
            return rejectWithValue(message);
        }
    }
);

export const fetchTransactionsByPaymentStatus = createAsyncThunk(
    'transaction/fetchByPaymentStatus',
    async (paymentStatus, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_TRANSACTIONS_BY_PAYMENT_STATUS_API(paymentStatus));
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch transactions by payment status.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch transactions by payment status.';
            return rejectWithValue(message);
        }
    }
);

export const fetchRecurringTransactions = createAsyncThunk(
    'transaction/fetchRecurring',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_RECURRING_TRANSACTIONS_API);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch recurring transactions.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch recurring transactions.';
            return rejectWithValue(message);
        }
    }
);

export const addPaymentToTransaction = createAsyncThunk(
    'transaction/addPayment',
    async ({ transactionId, paymentData }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', TRANSACTION_ENDPOINTS.ADD_PAYMENT_API(transactionId), paymentData);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to add payment.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add payment.';
            return rejectWithValue(message);
        }
    }
);

export const updateTransactionTags = createAsyncThunk(
    'transaction/updateTags',
    async ({ transactionId, tags }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', TRANSACTION_ENDPOINTS.UPDATE_TRANSACTION_TAGS_API(transactionId), { tags });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to update transaction tags.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update transaction tags.';
            return rejectWithValue(message);
        }
    }
);

export const fetchTransactionsByTags = createAsyncThunk(
    'transaction/fetchByTags',
    async (tags, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_TRANSACTIONS_BY_TAGS_API, null, null, { tags });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch transactions by tags.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch transactions by tags.';
            return rejectWithValue(message);
        }
    }
);

const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        setCurrentTransaction: (state, action) => {
            state.currentTransaction = action.payload;
        },
        clearTransactionError: (state) => {
            state.error = null;
            state.detailsError = null;
            state.reportError = null;
            state.yearsError = null;
            state.operationError = null;
        },
        clearOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
        resetTransactionState: () => initialState,
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
                state.transactions = action.payload.data || [];
                state.pagination = action.payload.pagination || initialState.pagination;
            })
            .addCase(fetchAllTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.transactions = [];
            })

            // Fetch Transaction By ID
            .addCase(fetchTransactionById.pending, (state) => {
                state.detailsLoading = true;
                state.currentTransaction = null;
                state.detailsError = null;
            })
            .addCase(fetchTransactionById.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.currentTransaction = action.payload;
            })
            .addCase(fetchTransactionById.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload;
                state.currentTransaction = null;
            })

            // Create Transaction
            .addCase(createTransaction.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.transactions.unshift(action.payload); // Add to the beginning of the list
                // Or, if relying on re-fetch:
                // state.currentTransaction = action.payload; // Optionally set as current
            })
            .addCase(createTransaction.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Update Transaction
            .addCase(updateTransaction.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const index = state.transactions.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }
                if (state.currentTransaction?._id === action.payload._id) {
                    state.currentTransaction = action.payload;
                }
            })
            .addCase(updateTransaction.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Delete Transaction
            .addCase(deleteTransaction.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                state.transactions = state.transactions.filter(t => t._id !== action.payload.transactionId);
                if (state.currentTransaction?._id === action.payload.transactionId) {
                    state.currentTransaction = null;
                }
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Approve Transaction
            .addCase(approveTransaction.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(approveTransaction.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const index = state.transactions.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }
                if (state.currentTransaction?._id === action.payload._id) {
                    state.currentTransaction = action.payload;
                }
            })
            .addCase(approveTransaction.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Fetch Monthly Report
            .addCase(fetchMonthlyReport.pending, (state) => {
                state.reportLoading = true;
                state.reportError = null;
            })
            .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
                state.reportLoading = false;
                state.monthlyReportData = action.payload || [];
            })
            .addCase(fetchMonthlyReport.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload;
                state.monthlyReportData = [];
            })

            // Fetch Available Years
            .addCase(fetchAvailableYears.pending, (state) => {
                state.yearsLoading = true;
                state.yearsError = null;
            })
            .addCase(fetchAvailableYears.fulfilled, (state, action) => {
                state.yearsLoading = false;
                state.availableYears = action.payload || [];
            })
            .addCase(fetchAvailableYears.rejected, (state, action) => {
                state.yearsLoading = false;
                state.yearsError = action.payload;
                state.availableYears = [];
            })

            // Fetch Transaction Stats
            .addCase(fetchTransactionStats.pending, (state) => {
                state.reportLoading = true; // Can reuse reportLoading
                state.reportError = null;
            })
            .addCase(fetchTransactionStats.fulfilled, (state, action) => {
                state.reportLoading = false;
                state.transactionStats = action.payload || null;
            })
            .addCase(fetchTransactionStats.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload;
                state.transactionStats = null;
            })

            // Fetch Department Transactions (example of specific list loading)
            .addCase(fetchDepartmentTransactions.pending, (state) => {
                state.loading = true; // Use general loading for now
                state.error = null;
            })
            .addCase(fetchDepartmentTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload || []; // Overwrites main transactions list
            })
            .addCase(fetchDepartmentTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Transactions by Date Range
            .addCase(fetchTransactionsByDateRange.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactionsByDateRange.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchTransactionsByDateRange.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Transactions by Status
            .addCase(fetchTransactionsByStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactionsByStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchTransactionsByStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Transactions by Payment Status
            .addCase(fetchTransactionsByPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactionsByPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchTransactionsByPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Recurring Transactions
            .addCase(fetchRecurringTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecurringTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchRecurringTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add Payment to Transaction
            .addCase(addPaymentToTransaction.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(addPaymentToTransaction.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const index = state.transactions.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }
                if (state.currentTransaction?._id === action.payload._id) {
                    state.currentTransaction = action.payload;
                }
            })
            .addCase(addPaymentToTransaction.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Update Transaction Tags
            .addCase(updateTransactionTags.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                state.operationSuccess = false;
            })
            .addCase(updateTransactionTags.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;
                const index = state.transactions.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }
                if (state.currentTransaction?._id === action.payload._id) {
                    state.currentTransaction = action.payload;
                }
            })
            .addCase(updateTransactionTags.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })

            // Fetch Transactions by Tags
            .addCase(fetchTransactionsByTags.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactionsByTags.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchTransactionsByTags.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setCurrentTransaction, clearTransactionError, clearOperationStatus, resetTransactionState } = transactionSlice.actions;

export default transactionSlice.reducer;