import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { TRANSACTION_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    expenses: [],
    revenues: [],
    pendingExpenses: [],
    pendingRevenues: [],
    recurringTransactions: [], 
    periods: [],
    annualReport: null,
    monthlyReport: null,
    departmentSummary: null,
    departmentSalaryExpense: null,
    periodSummary: null,
    availableYears: [],

    // Status states
    loading: false,
    reportLoading: false,
    operationLoading: false,
    error: null,
    operationError: null,
    reportError: null,
    operationSuccess: false,
};


// --- Expense Thunks ---
export const createExpense = createAsyncThunk('transaction/createExpense', async (data, { rejectWithValue }) => { try { const response = await apiConnector('POST', TRANSACTION_ENDPOINTS.CREATE_EXPENSE_API, data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const createProjectExpense = createAsyncThunk('transaction/createProjectExpense', async (data, { rejectWithValue }) => { try { const response = await apiConnector('POST', TRANSACTION_ENDPOINTS.CREATE_PROJECT_EXPENSE_API, data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const approveExpense = createAsyncThunk('transaction/approveExpense', async ({ expenseId, status, notes }, { rejectWithValue }) => { try { const response = await apiConnector('PATCH', TRANSACTION_ENDPOINTS.APPROVE_EXPENSE_API(expenseId), { status, notes }); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const fetchPendingExpenses = createAsyncThunk('transaction/fetchPendingExpenses', async (_, { rejectWithValue }) => { try { const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_PENDING_EXPENSES_API); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const updateExpense = createAsyncThunk('transaction/updateExpense', async ({ expenseId, data }, { rejectWithValue }) => { try { const response = await apiConnector('PUT', TRANSACTION_ENDPOINTS.UPDATE_EXPENSE_API(expenseId), data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const deleteExpense = createAsyncThunk('transaction/deleteExpense', async (expenseId, { rejectWithValue }) => { try { await apiConnector('DELETE', TRANSACTION_ENDPOINTS.DELETE_EXPENSE_API(expenseId)); return expenseId; } catch (error) { return rejectWithValue(error.response.data); } });

// --- Recurring Expense Thunks ---
export const createRecurringExpense = createAsyncThunk('transaction/createRecurringExpense', async (data, { rejectWithValue }) => { try { const response = await apiConnector('POST', TRANSACTION_ENDPOINTS.CREATE_RECURRING_EXPENSE_API, data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const fetchRecurringExpenses = createAsyncThunk('transaction/fetchRecurringExpenses', async (_, { rejectWithValue }) => { try { const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.FETCH_RECURRING_EXPENSE_API); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });


// --- Revenue Thunks ---
export const createRevenue = createAsyncThunk('transaction/createRevenue', async (data, { rejectWithValue }) => { try { const response = await apiConnector('POST', TRANSACTION_ENDPOINTS.CREATE_REVENUE_API, data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const createProjectRevenue = createAsyncThunk('transaction/createProjectRevenue', async (data, { rejectWithValue }) => { try { const response = await apiConnector('POST', TRANSACTION_ENDPOINTS.CREATE_PROJECT_REVENUE_API, data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const approveRevenue = createAsyncThunk('transaction/approveRevenue', async ({ revenueId, status, notes }, { rejectWithValue }) => { try { const response = await apiConnector('PATCH', TRANSACTION_ENDPOINTS.APPROVE_REVENUE_API(revenueId), { status, notes }); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const fetchPendingRevenues = createAsyncThunk('transaction/fetchPendingRevenues', async (_, { rejectWithValue }) => { try { const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_PENDING_REVENUES_API); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const updateRevenue = createAsyncThunk('transaction/updateRevenue', async ({ revenueId, data }, { rejectWithValue }) => { try { const response = await apiConnector('PUT', TRANSACTION_ENDPOINTS.UPDATE_REVENUE_API(revenueId), data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const deleteRevenue = createAsyncThunk('transaction/deleteRevenue', async (revenueId, { rejectWithValue }) => { try { await apiConnector('DELETE', TRANSACTION_ENDPOINTS.DELETE_REVENUE_API(revenueId)); return revenueId; } catch (error) { return rejectWithValue(error.response.data); } });


// --- Reporting & Period Thunks ---
export const fetchAnnualReport = createAsyncThunk('transaction/fetchAnnualReport', async ({ year }, { rejectWithValue }) => { try { const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_ANNUAL_REPORT_API, null, null, { year }); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const fetchAllPeriods = createAsyncThunk('transaction/fetchAllPeriods', async (params, { rejectWithValue }) => { try { const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_ALL_PERIODS_API, null, null, params); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const updateFinancialPeriod = createAsyncThunk('transaction/updateFinancialPeriod', async ({ periodId, data }, { rejectWithValue }) => { try { const response = await apiConnector('PUT', TRANSACTION_ENDPOINTS.UPDATE_FINANCIAL_PERIOD_API(periodId), data); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });
export const deleteFinancialPeriod = createAsyncThunk('transaction/deleteFinancialPeriod', async (periodId, { rejectWithValue }) => { try { await apiConnector('DELETE', TRANSACTION_ENDPOINTS.DELETE_FINANCIAL_PERIOD_API(periodId)); return periodId; } catch (error) { return rejectWithValue(error.response.data); } });
export const fetchAvailableYears = createAsyncThunk('transaction/fetchAvailableYears', async (_, { rejectWithValue }) => { try { const response = await apiConnector('GET', TRANSACTION_ENDPOINTS.GET_AVAILABLE_YEARS_API); return response.data.data; } catch (error) { return rejectWithValue(error.response.data); } });


// --- Slice Definition ---

const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        clearOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
        resetTransactionState: () => initialState,
    },
    extraReducers: (builder) => {
        const operationPending = (state) => { state.operationLoading = true; state.operationError = null; state.operationSuccess = false; };
        const operationFulfilled = (state) => { state.operationLoading = false; state.operationSuccess = true; };
        const operationRejected = (state, action) => { state.operationLoading = false; state.operationError = action.payload?.message || 'Operation failed'; };
        const listPending = (state) => { state.loading = true; state.error = null; };
        const listRejected = (state, action) => { state.loading = false; state.error = action.payload?.message || 'Failed to fetch data.'; };

        builder
            // Expenses
            .addCase(createExpense.pending, operationPending).addCase(createExpense.fulfilled, operationFulfilled).addCase(createExpense.rejected, operationRejected)
            .addCase(createProjectExpense.pending, operationPending).addCase(createProjectExpense.fulfilled, operationFulfilled).addCase(createProjectExpense.rejected, operationRejected)
            .addCase(approveExpense.pending, operationPending).addCase(approveExpense.fulfilled, operationFulfilled).addCase(approveExpense.rejected, operationRejected)
            .addCase(updateExpense.pending, operationPending).addCase(updateExpense.fulfilled, operationFulfilled).addCase(updateExpense.rejected, operationRejected)
            .addCase(deleteExpense.pending, operationPending)
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.operationLoading = false; state.operationSuccess = true;
                state.pendingExpenses = state.pendingExpenses.filter(item => item._id !== action.payload);
                if (state.annualReport?.expenses) { state.annualReport.expenses = state.annualReport.expenses.filter(item => item._id !== action.payload); }
            })
            .addCase(deleteExpense.rejected, operationRejected)
            .addCase(fetchPendingExpenses.pending, listPending)
            .addCase(fetchPendingExpenses.fulfilled, (state, action) => { state.loading = false; state.pendingExpenses = action.payload; })
            .addCase(fetchPendingExpenses.rejected, listRejected)

            // Recurring Expenses
            .addCase(createRecurringExpense.pending, operationPending).addCase(createRecurringExpense.fulfilled, operationFulfilled).addCase(createRecurringExpense.rejected, operationRejected)
            .addCase(fetchRecurringExpenses.pending, listPending)
            .addCase(fetchRecurringExpenses.fulfilled, (state, action) => { state.loading = false; state.recurringTransactions = action.payload; })
            .addCase(fetchRecurringExpenses.rejected, listRejected)

            // Revenues
            .addCase(createRevenue.pending, operationPending).addCase(createRevenue.fulfilled, operationFulfilled).addCase(createRevenue.rejected, operationRejected)
            .addCase(createProjectRevenue.pending, operationPending).addCase(createProjectRevenue.fulfilled, operationFulfilled).addCase(createProjectRevenue.rejected, operationRejected)
            .addCase(approveRevenue.pending, operationPending).addCase(approveRevenue.fulfilled, operationFulfilled).addCase(approveRevenue.rejected, operationRejected)
            .addCase(updateRevenue.pending, operationPending).addCase(updateRevenue.fulfilled, operationFulfilled).addCase(updateRevenue.rejected, operationRejected)
            .addCase(deleteRevenue.pending, operationPending)
            .addCase(deleteRevenue.fulfilled, (state, action) => {
                state.operationLoading = false; state.operationSuccess = true;
                state.pendingRevenues = state.pendingRevenues.filter(item => item._id !== action.payload);
                if (state.annualReport?.revenues) { state.annualReport.revenues = state.annualReport.revenues.filter(item => item._id !== action.payload); }
            })
            .addCase(deleteRevenue.rejected, operationRejected)
            .addCase(fetchPendingRevenues.pending, listPending)
            .addCase(fetchPendingRevenues.fulfilled, (state, action) => { state.loading = false; state.pendingRevenues = action.payload; })
            .addCase(fetchPendingRevenues.rejected, listRejected)

            // Reporting & Periods
            .addCase(fetchAnnualReport.pending, (state) => { state.reportLoading = true; state.reportError = null; })
            .addCase(fetchAnnualReport.fulfilled, (state, action) => { state.reportLoading = false; state.annualReport = action.payload; })
            .addCase(fetchAnnualReport.rejected, (state, action) => { state.reportLoading = false; state.reportError = action.payload?.message || 'Failed to fetch report.'; })
            .addCase(fetchAllPeriods.pending, listPending)
            .addCase(fetchAllPeriods.fulfilled, (state, action) => { state.loading = false; state.periods = action.payload; })
            .addCase(fetchAllPeriods.rejected, listRejected)
            .addCase(updateFinancialPeriod.pending, operationPending).addCase(updateFinancialPeriod.fulfilled, operationFulfilled).addCase(updateFinancialPeriod.rejected, operationRejected)
            .addCase(deleteFinancialPeriod.pending, operationPending)
            .addCase(deleteFinancialPeriod.fulfilled, (state, action) => {
                state.operationLoading = false; state.operationSuccess = true;
                state.periods = state.periods.filter(p => p._id !== action.payload);
            })
            .addCase(deleteFinancialPeriod.rejected, operationRejected)
            .addCase(fetchAvailableYears.pending, listPending)
            .addCase(fetchAvailableYears.fulfilled, (state, action) => { state.loading = false; state.availableYears = action.payload; })
            .addCase(fetchAvailableYears.rejected, listRejected);
    },
});

export const {
    clearOperationStatus,
    resetTransactionState
} = transactionSlice.actions;

export default transactionSlice.reducer;
