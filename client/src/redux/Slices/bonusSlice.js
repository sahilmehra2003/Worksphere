import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { BONUS_ENDPOINTS } from '../../services/apiEndpoints';

const initialState = {
    awardedBonuses: [],
    pendingApprovals: [],
    loading: false,
    operationLoading: false,
    error: null,
    operationError: null,
    operationSuccess: false,
    bonusTypes: [],
    myBonusAwards: [],
};


export const awardBonus = createAsyncThunk(
    'bonus/award',
    async (bonusData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', BONUS_ENDPOINTS.AWARD_BONUS_API, bonusData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


export const fetchPendingBonusApprovals = createAsyncThunk(
    'bonus/fetchPendingBonusApprovals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', BONUS_ENDPOINTS.GET_PENDING_BONUS_APPROVALS);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending bonus approvals');
        }
    }
);

export const approveOrRejectBonus = createAsyncThunk(
    'bonus/approveOrRejectBonus',
    async ({ awardId, action, rejectionReason }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', BONUS_ENDPOINTS.APPROVE_REJECT_BONUS, {
                awardId,
                action,
                rejectionReason
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to process bonus approval');
        }
    }
);

export const markBonusAsPaid = createAsyncThunk(
    'bonus/markAsPaid',
    async ({ awardId, paymentDetails }, { rejectWithValue }) => {
        try {
            const response = await apiConnector(
                'POST',
                BONUS_ENDPOINTS.MARK_BONUS_AS_PAID_API(awardId),
                { paymentDetails }
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Fetch Bonus Types
export const fetchBonusTypes = createAsyncThunk(
    'bonus/fetchBonusTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', BONUS_ENDPOINTS.FETCH_BONUS_TYPES);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bonus types');
        }
    }
);

// Fetch My Bonus Awards
export const fetchMyBonusAwards = createAsyncThunk(
    'bonus/fetchMyBonusAwards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', BONUS_ENDPOINTS.FETCH_MY_BONUS_AWARDS);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bonus awards');
        }
    }
);

// Create Bonus Award
export const createBonusAward = createAsyncThunk(
    'bonus/createBonusAward',
    async (bonusData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', BONUS_ENDPOINTS.CREATE_BONUS_AWARD, bonusData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create bonus award');
        }
    }
);

// Seed Bonus Types
export const seedBonusTypes = createAsyncThunk(
    'bonus/seedBonusTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', BONUS_ENDPOINTS.SEED_BONUS_TYPES);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to seed bonus types');
        }
    }
);

const bonusSlice = createSlice({
    name: 'bonus',
    initialState,
    reducers: {
        clearBonusOperationStatus: (state) => {
            state.operationLoading = false;
            state.operationError = null;
            state.operationSuccess = false;
        },
        resetBonusState: () => initialState,
        clearError: (state) => {
            state.error = null;
        },
        clearBonusData: (state) => {
            state.bonusTypes = [];
            state.myBonusAwards = [];
            state.error = null;
        },
        clearSuccess: (state) => {
            state.operationSuccess = false;
        }
    },
    extraReducers: (builder) => {

        const operationPending = (state) => {
            state.operationLoading = true;
            state.operationError = null;
            state.operationSuccess = false;
        };
        const operationFulfilled = (state) => {
            state.operationLoading = false;
            state.operationSuccess = true;
        };
        const operationRejected = (state, action) => {
            state.operationLoading = false;
            state.operationError = action.payload;
        };
        const listPending = (state) => {
            state.loading = true;
            state.error = null;
        };
        const listRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload;
        };

        builder

            .addCase(awardBonus.pending, operationPending)
            .addCase(awardBonus.fulfilled, operationFulfilled)
            .addCase(awardBonus.rejected, operationRejected)
            .addCase(fetchPendingBonusApprovals.pending, listPending)
            .addCase(fetchPendingBonusApprovals.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingApprovals = action.payload;
            })
            .addCase(fetchPendingBonusApprovals.rejected, listRejected)

            .addCase(approveOrRejectBonus.pending, operationPending)
            .addCase(approveOrRejectBonus.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationSuccess = true;

                state.pendingApprovals = state.pendingApprovals.filter(
                    (bonus) => bonus._id !== action.payload._id
                );
            })
            .addCase(approveOrRejectBonus.rejected, operationRejected)
            .addCase(markBonusAsPaid.pending, operationPending)
            .addCase(markBonusAsPaid.fulfilled, (state) => {
                state.loading = false;
                state.operationSuccess = true;
                // Optionally update the status of the bonus in any relevant list
            })
            .addCase(markBonusAsPaid.rejected, operationRejected)

            // Fetch Bonus Types
            .addCase(fetchBonusTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBonusTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.bonusTypes = action.payload;
            })
            .addCase(fetchBonusTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch My Bonus Awards
            .addCase(fetchMyBonusAwards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyBonusAwards.fulfilled, (state, action) => {
                state.loading = false;
                state.myBonusAwards = action.payload;
            })
            .addCase(fetchMyBonusAwards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Bonus Award
            .addCase(createBonusAward.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBonusAward.fulfilled, (state, action) => {
                state.loading = false;
                state.operationSuccess = true;

                const newBonus = action.payload;

                // Add to pending approvals if it's pending approval
                // This will show up for approvers immediately
                if (newBonus.status === 'PendingApproval') {
                    state.pendingApprovals.unshift(newBonus);
                }

                // Note: We don't add to myBonusAwards here because that should only contain
                // bonuses awarded TO the current user, not BY the current user
                // The myBonusAwards list will be refreshed when the user navigates or refreshes
            })
            .addCase(createBonusAward.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Seed Bonus Types
            .addCase(seedBonusTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(seedBonusTypes.fulfilled, (state, action) => {
                state.loading = false;
                // Refresh bonus types after seeding
                state.bonusTypes = action.payload;
            })
            .addCase(seedBonusTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearBonusOperationStatus,
    resetBonusState,
    clearError,
    clearBonusData,
    clearSuccess
} = bonusSlice.actions;

export default bonusSlice.reducer;
