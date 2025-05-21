import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../../services/apiConnector';
import { EMPLOYEE_ENDPOINTS } from '../../services/apiEndpoints';

// Debounce utility function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Debounced search function
const debouncedSearch = debounce(async (params, dispatch) => {
    dispatch(searchEmployees(params));
}, 300); // 300ms delay

const initialState = {
    employees: [],
    currentProfile: null,
    loading: false,
    error: null,
    searchQuery: '',
    sortConfig: {
        field: 'name',
        direction: 'asc'
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
};

// 1. Fetch All Employees (Internal/Admin view with more details)
export const fetchAllEmployeesInternal = createAsyncThunk(
    'employee/fetchAllInternal',
    async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
        try {
            // Construct query parameters for pagination and filtering
            const params = { page, limit, ...filters };
            const response = await apiConnector('GET', EMPLOYEE_ENDPOINTS.GET_ALL_EMPLOYEES_INTERNAL_API, null, null, params);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to fetch employees');
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch employees due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 2. Fetch All Employees (Public/Limited view) - if needed separately
export const fetchAllEmployeesPublic = createAsyncThunk(
    'employee/fetchAllPublic',
    async (arg, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', EMPLOYEE_ENDPOINTS.GET_ALL_EMPLOYEES_PUBLIC_API);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to fetch public employee list');
            }
            return response.data.data; // Assuming it returns an array of employees directly under 'data'
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch public employee list due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 3. Fetch Single Employee Profile
export const fetchEmployeeProfile = createAsyncThunk(
    'employee/fetchProfile',
    async (employeeId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('GET', EMPLOYEE_ENDPOINTS.GET_EMPLOYEE_PROFILE_API(employeeId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to fetch employee profile');
            }
            return response.data.data; // Expected: { success, data: employeeObject }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch employee profile due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 4. Create Employee (Admin/HR)
export const createEmployee = createAsyncThunk(
    'employee/create',
    async (employeeData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', EMPLOYEE_ENDPOINTS.CREATE_EMPLOYEE_API, employeeData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to create employee');
            }
            return response.data; // Expected: { success, message, employee }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create employee due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 5. Update Employee Profile (Admin/HR for others, or own profile)
export const updateEmployeeProfile = createAsyncThunk(
    'employee/updateProfile',
    async ({ employeeId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', EMPLOYEE_ENDPOINTS.UPDATE_EMPLOYEE_PROFILE_API(employeeId), updatedData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to update employee profile');
            }
            return response.data; // Expected: { success, message, data: updatedEmployee }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update employee profile due to server error.';
            return rejectWithValue(message);
        }
    }
);

// 6. Set Employee Inactive (Admin/HR)
export const setEmployeeInactive = createAsyncThunk(
    'employee/setInactive',
    async (employeeId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', EMPLOYEE_ENDPOINTS.SET_EMPLOYEE_INACTIVE_API(employeeId));
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to set employee inactive');
            }
            return response.data; // Expected: { success, message, data: updatedEmployee }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to set employee inactive due to server error.';
            return rejectWithValue(message);
        }
    }
);

export const changeEmployeePassword = createAsyncThunk(
    'employee/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PATCH', EMPLOYEE_ENDPOINTS.CHANGE_PASSWORD_API, passwordData);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Failed to change password');
            }
            return response.data.message;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to change password due to server error.';
            return rejectWithValue(message);
        }
    }
);

// Modify the searchEmployees thunk to use debouncing
export const searchEmployees = createAsyncThunk(
    'employee/search',
    async ({ query, page = 1, limit = 10, sortField, sortDirection }, { rejectWithValue }) => {
        try {
            const params = {
                page,
                limit,
                search: query,
                sortField,
                sortDirection
            };
            const response = await apiConnector('GET', EMPLOYEE_ENDPOINTS.SEARCH_EMPLOYEES_API, null, null, params);
            if (!response.data.success) {
                return rejectWithValue(response.data.message || 'Search failed');
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Search failed due to server error.';
            return rejectWithValue(message);
        }
    }
);

// Add a new action to handle debounced search
export const debouncedSearchEmployees = (params) => (dispatch) => {
    debouncedSearch(params, dispatch);
};

const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        clearEmployeeError: (state) => {
            state.error = null;
        },
        clearCurrentProfile: (state) => {
            state.currentProfile = null;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.pagination.currentPage = 1; // Reset to first page on new search
        },
        setSortConfig: (state, action) => {
            state.sortConfig = action.payload;
            state.pagination.currentPage = 1; // Reset to first page on new sort
        },
        resetSearchAndSort: (state) => {
            state.searchQuery = '';
            state.sortConfig = initialState.sortConfig;
            state.pagination.currentPage = 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Employees (Internal)
            .addCase(fetchAllEmployeesInternal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEmployeesInternal.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload.data;
                state.pagination = action.payload.pagination || initialState.pagination;
            })
            .addCase(fetchAllEmployeesInternal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load employees.';
            })

            // Fetch All Employees (Public) - Example, stores in same employees array
            .addCase(fetchAllEmployeesPublic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEmployeesPublic.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload; // Assuming payload is the array of employees
            })
            .addCase(fetchAllEmployeesPublic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load public employee list.';
            })

            // Fetch Single Employee Profile
            .addCase(fetchEmployeeProfile.pending, (state) => {
                state.loading = true;
                state.currentProfile = null; // Clear previous profile
                state.error = null;
            })
            .addCase(fetchEmployeeProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProfile = action.payload;
            })
            .addCase(fetchEmployeeProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load employee profile.';
            })

            // Create Employee
            .addCase(createEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEmployee.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally add the new employee to the state.employees list
                // or trigger a re-fetch of fetchAllEmployeesInternal
                // For now, just log success or set a success message.
                // state.employees.unshift(action.payload.employee); // If you want to add to list
                console.log("Employee created:", action.payload.message);
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create employee.';
            })

            // Update Employee Profile
            .addCase(updateEmployeeProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployeeProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProfile = action.payload.data; // Update current profile if it was the one edited
                // Update the employee in the 'employees' list if present
                const index = state.employees.findIndex(emp => emp._id === action.payload.data._id);
                if (index !== -1) {
                    state.employees[index] = action.payload.data;
                }
            })
            .addCase(updateEmployeeProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update employee profile.';
            })

            // Set Employee Inactive
            .addCase(setEmployeeInactive.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setEmployeeInactive.fulfilled, (state, action) => {
                state.loading = false;
                const updatedEmployee = action.payload.data;
                // Update the employee in the 'employees' list
                const index = state.employees.findIndex(emp => emp._id === updatedEmployee._id);
                if (index !== -1) {
                    state.employees[index].employmentStatus = updatedEmployee.employmentStatus; // Or update whole object
                }
                if (state.currentProfile && state.currentProfile._id === updatedEmployee._id) {
                    state.currentProfile.employmentStatus = updatedEmployee.employmentStatus;
                }
            })
            .addCase(setEmployeeInactive.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to set employee inactive.';
            })

            // Change Password
            .addCase(changeEmployeePassword.pending, (state) => {
                state.loading = true; // Might want a specific loading flag for password change
                state.error = null;
            })
            .addCase(changeEmployeePassword.fulfilled, (state, action) => {
                state.loading = false;
                console.log("Password changed successfully:", action.payload);
                // No user data to update here, just a success message normally.
            })
            .addCase(changeEmployeePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to change password.'; // Or a specific password error state
            })

            // Search Employees
            .addCase(searchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload.data;
                state.pagination = action.payload.pagination || initialState.pagination;
            })
            .addCase(searchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Search failed.';
            });
    },
});

export const {
    clearEmployeeError,
    clearCurrentProfile,
    setSearchQuery,
    setSortConfig,
    resetSearchAndSort
} = employeeSlice.actions;

// Selectors
export const selectFilteredEmployees = (state) => {
    const { employees, searchQuery, sortConfig } = state.employee;

    // Filter employees based on search query
    let filtered = employees;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(query) ||
            emp.email.toLowerCase().includes(query) ||
            emp.department?.toLowerCase().includes(query)
        );
    }

    // Sort employees
    return [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
};

export const selectEmployeeById = (state, employeeId) =>
    state.employee.employees.find(emp => emp._id === employeeId);

export default employeeSlice.reducer;