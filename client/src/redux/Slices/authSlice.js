import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { AUTH_ENDPOINTS, EMPLOYEE_ENDPOINTS } from '../../services/apiEndpoints';
import { useSelector } from 'react-redux';

const getInitialAuthState = () => {
    try {
        const userString = localStorage.getItem('worksphereUser');
        const token = localStorage.getItem('worksphereToken');
        if (userString) {
            const user = JSON.parse(userString);
            return {
                user,
                token,
                isAuthenticated: true,
                loading: false,
                error: null,
                success: false,
                otpSent: false,
                emailVerified: user.isVerified || false,
            };
        }
    } catch (error) {
        console.error("Error parsing auth state from localStorage:", error);
    }
    return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        success: false,
        otpSent: false,
        emailVerified: false,
    };
};

// Async Thunks for Authentication
// 1. Login User
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            console.log("Attempting login with credentials:", credentials); // For debugging
            const response = await apiConnector('POST', AUTH_ENDPOINTS.LOGIN_API, credentials);
            console.log("Login API response:", response); // For debugging
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Login failed');
            }
            return response.data; // Expected: { success, token, user, message }
        } catch (error) {
            console.error("Login thunk error:", error); // For debugging
            const message = error.response?.data?.message || error.message || 'Login failed due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 2. Signup User
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', AUTH_ENDPOINTS.SIGNUP_API, userData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Signup failed');
            }
            return response.data; // Expected: { success, employee, message }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Signup failed due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 3. Send OTP
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (emailData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', AUTH_ENDPOINTS.SEND_OTP_API, emailData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to send OTP');
            }
            return response.data.message; // Or simply indicate success
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to send OTP due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 4. Verify OTP
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (otpData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', AUTH_ENDPOINTS.VERIFY_OTP_API, otpData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'OTP verification failed');
            }
            return response.data.message; // Or an object indicating success
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'OTP verification failed due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 5. Forgot Password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (emailData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', AUTH_ENDPOINTS.FORGOT_PASSWORD_API, emailData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Forgot password request failed');
            }
            return response.data.message;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Forgot password request failed due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 6. Reset Password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, passwordData }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', AUTH_ENDPOINTS.RESET_PASSWORD_API(token), passwordData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Password reset failed');
            }
            return response.data.message;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Password reset failed due to server error.';
            return rejectWithValue(message);
        }
    }
);

// Add refresh token thunk
export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) {
                return rejectWithValue('No token to refresh');
            }

            const response = await apiConnector('POST', AUTH_ENDPOINTS.REFRESH_TOKEN_API, { token });
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Token refresh failed');
            }

            // Set token expiry to 1 hour from now
            const expiryTime = new Date().getTime() + 3600000; // 1 hour in milliseconds
            localStorage.setItem('worksphereTokenExpiry', expiryTime.toString());

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Token refresh failed';
            return rejectWithValue(message);
        }
    }
);

// Add Google Auth thunk
export const initiateGoogleAuth = createAsyncThunk(
    'auth/initiateGoogleAuth',
    async (_, { rejectWithValue }) => {
        try {
            // Redirect to Google OAuth endpoint
            window.location.href = AUTH_ENDPOINTS.GOOGLE_AUTH_INIT_API;
            return null;
        } catch (error) {
            return rejectWithValue('Failed to initiate Google authentication', error);
        }
    }
);

export const completeProfile = createAsyncThunk(
    'auth/completeProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', EMPLOYEE_ENDPOINTS.COMPLETE_PROFILE_API, profileData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Profile completion failed');
        }
    }
);

// Add Google Auth Callback Handler
export const handleGoogleAuthCallback = createAsyncThunk(
    'auth/handleGoogleAuthCallback',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', AUTH_ENDPOINTS.GOOGLE_AUTH_CALLBACK_API);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Google authentication failed');
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Google authentication failed';
            return rejectWithValue(message);
        }
    }
);


export const logoutUserAsync = createAsyncThunk(
    'auth/logoutUserAsync',
    async (_, { rejectWithValue }) => {
        try {
            await apiConnector('POST', AUTH_ENDPOINTS.LOGOUT_API);
            return true;
        } catch {
            return rejectWithValue('Logout failed');
        }
    }
);

// Auth Slice Definition
const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialAuthState(),
    reducers: {
        logoutUser: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.success = false;
            state.otpSent = false;
            state.emailVerified = false;
            localStorage.removeItem('worksphereUser');
            localStorage.removeItem('worksphereToken');
            // Optionally clear other localStorage/sessionStorage items
            // Optionally: document.cookie = ... (for non-httpOnly cookies)
            console.log("User logged out, localStorage cleared.");
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        clearAuthSuccess: (state) => {
            state.success = false;
        },
        setCredentials: (state, action) => {
            const { user } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
            state.emailVerified = user.isVerified || false;
            state.loading = false;
            state.error = null;
            localStorage.setItem('worksphereUser', JSON.stringify(user));
        },
    },
    extraReducers: (builder) => {
        builder
            // Login User
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.accessToken;
                localStorage.setItem('worksphereUser', JSON.stringify(action.payload.user));
                localStorage.setItem('worksphereToken', action.payload.accessToken);
                console.log("Login successful, user stored:", action.payload.user);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed. Please try again.'; // Use payload from rejectWithValue
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem('worksphereUser');
                localStorage.removeItem('worksphereToken');
            })

            // Signup User
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                // Signup typically doesn't log the user in or set token,
                // it just creates the account. User proceeds to OTP then login.
                // We might want to store the email of the user who signed up for OTP flow.
                // state.user = action.payload.employee; // Or just set a message
                console.log("Signup successful:", action.payload.message);
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Signup failed. Please try again.';
            })

            // Send OTP
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.otpSent = false;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.otpSent = true; // Indicate OTP was sent successfully
                console.log("Send OTP successful:", action.payload);
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to send OTP.';
                state.otpSent = false;
            })

            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.emailVerified = true; // Mark email as verified
                state.otpSent = false; // Reset otpSent flag after verification
                console.log("Verify OTP successful:", action.payload);
                // Note: Does not log the user in. They need to proceed to login.
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'OTP verification failed.';
            })

            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                console.log("Forgot password request successful:", action.payload);
                // Usually just show a message to the user
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Forgot password request failed.';
                state.success = false;
            })

            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                console.log("Password reset successful:", action.payload);
                // User should now be able to login with new password
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Password reset failed.';
                state.success = false;
            })

            // Refresh Token
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                localStorage.setItem('worksphereToken', action.payload.token);
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('worksphereToken');
                localStorage.removeItem('worksphereUser');
                localStorage.removeItem('worksphereTokenExpiry');
            })

            // Google Auth Initiate
            .addCase(initiateGoogleAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(initiateGoogleAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to initiate Google authentication';
            })

            // Google Auth Callback
            .addCase(handleGoogleAuthCallback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(handleGoogleAuthCallback.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.accessToken;
                state.emailVerified = action.payload.user.isVerified;
                localStorage.setItem('worksphereUser', JSON.stringify(action.payload.user));
                localStorage.setItem('worksphereToken', action.payload.accessToken);
            })
            .addCase(handleGoogleAuthCallback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Google authentication failed';
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem('worksphereUser');
                localStorage.removeItem('worksphereToken');
            })
            // COMPLETE PROFILE
            .addCase(completeProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                localStorage.setItem('worksphereUser', JSON.stringify(action.payload.user));
            })
            .addCase(completeProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUserAsync.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
                state.success = false;
                state.otpSent = false;
                state.emailVerified = false;
                localStorage.removeItem('worksphereUser');
                localStorage.removeItem('worksphereToken');
            })
            .addCase(logoutUserAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Logout failed.';
            });
    },
});

export const { logoutUser, clearAuthError, clearAuthSuccess, setCredentials } = authSlice.actions;

export default authSlice.reducer;

// Selector for permissions
export const selectPermissions = (state) => state.auth.user?.permissions || [];

// Custom hook for permission check
export const useHasPermission = (permission) => {
    const permissions = useSelector(selectPermissions);
    return permissions.includes(permission);
};

// Utility function for use outside React components
export const hasPermission = (permissions, permission) => {
    return Array.isArray(permissions) && permissions.includes(permission);
};