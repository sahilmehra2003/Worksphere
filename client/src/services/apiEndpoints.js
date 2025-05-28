const V1_API_PREFIX = '/api/v1';
const createUrl = (path) => `${V1_API_PREFIX}${path}`;


export const AUTH_ENDPOINTS = {
    SIGNUP_API: createUrl('/auth/signup'),
    LOGIN_API: createUrl('/auth/login'),
    SEND_OTP_API: createUrl('/auth/send-otp'),
    VERIFY_OTP_API: createUrl('/auth/verify-otp'),
    FORGOT_PASSWORD_API: createUrl('/auth/forgot-password'),
    RESET_PASSWORD_API: (token) => createUrl(`/auth/reset-password/${token}`),
    GOOGLE_AUTH_INIT_API: createUrl('/auth/google'),
    GOOGLE_AUTH_CALLBACK_API: createUrl('/auth/google/callback'),
    REFRESH_TOKEN_API: createUrl('/auth/refresh-token'),

};


export const EMPLOYEE_ENDPOINTS = {
    GET_ALL_EMPLOYEES_PUBLIC_API: createUrl('/employeeInfo/employees/public'),
    GET_ALL_EMPLOYEES_INTERNAL_API: createUrl('/employeeInfo/employees'),
    GET_EMPLOYEE_PROFILE_API: (employeeId) => createUrl(`/employeeInfo/employee/${employeeId}`),
    CHANGE_PASSWORD_API: createUrl('/employeeInfo/change-password'),
    CREATE_EMPLOYEE_API: createUrl('/employeeInfo/employees/create'),
    UPDATE_EMPLOYEE_PROFILE_API: (employeeId) => createUrl(`/employeeInfo/employees/${employeeId}`),
    SET_EMPLOYEE_INACTIVE_API: (employeeId) => createUrl(`/employeeInfo/employees/setInactive/${employeeId}`),
    COMPLETE_PROFILE_API: createUrl('/employeeInfo/complete-profile'),
}

export const DEPARTMENT_ENDPOINTS = {
    GET_ALL_DEPARTMENTS_API: createUrl('/departmentData/departments'),
    GET_DEPARTMENT_BY_ID_API: (departmentId) => createUrl(`/departmentData/department/${departmentId}`),
    CREATE_DEPARTMENT_API: createUrl('/departmentData/departments/create'),
    UPDATE_DEPARTMENT_API: (departmentId) => createUrl(`/departmentData/department/update/${departmentId}`),
    SET_DEPARTMENT_INACTIVE_API: (departmentId) => createUrl(`/departmentData/department/setInactive/${departmentId}`),
};

export const CALENDAR_ENDPOINTS = {
    UPSERT_COUNTRY_CALENDAR_API: createUrl('/calendar/create'),
    GET_ALL_CONFIGURED_CALENDARS_API: createUrl('/calendar/fetchAll'),
    GET_COUNTRY_CALENDAR_DETAILS_API: (countryCode) => createUrl(`/calendar/fetchcountrycalender/${countryCode}`),
    DELETE_COUNTRY_CALENDAR_API: (countryCode) => createUrl(`/calendar/${countryCode}`),
    ADD_CUSTOM_HOLIDAY_API: (countryCode) => createUrl(`/calendar/${countryCode}/holidays`),
    DELETE_HOLIDAY_API: (countryCode, holidayId) => createUrl(`/calendar/${countryCode}/holidays/${holidayId}`),
};

export const LEAVE_ENDPOINTS = {
    APPLY_LEAVE_API: createUrl('/leaveSystem/apply'),
    APPROVE_LEAVE_API: (leaveId) => createUrl(`/leaveSystem/${leaveId}/approve`),
    REJECT_LEAVE_API: (leaveId) => createUrl(`/leaveSystem/${leaveId}/reject`),
    GET_LEAVE_HISTORY_API: createUrl('/leaveSystem/leaves'),
    GET_MY_LEAVE_BALANCE_API: createUrl('/leaveSystem/balance'),
    CANCEL_LEAVE_API: (leaveId) => createUrl(`/leaveSystem/${leaveId}/cancel`),
    GET_EMPLOYEE_LEAVE_BALANCE_API: (employeeId) => createUrl(`/leaveSystem/balance/${employeeId}`),
};


export const CLIENT_ENDPOINTS = {
    GET_ALL_CLIENTS_API: createUrl('/clientData/clients'),
    GET_CLIENT_BY_ID_API: (clientId) => createUrl(`/clientData/client/${clientId}`),
    CREATE_CLIENT_API: createUrl('/clientData/client/create'),
    UPDATE_CLIENT_API: (clientId) => createUrl(`/clientData/client/update/${clientId}`),
    DEACTIVATE_CLIENT_API: (clientId) => createUrl(`/clientData/deactivateClient/${clientId}`),
};

export const ATTENDANCE_ENDPOINTS = {
    CLOCK_IN_API: createUrl('/attendanceRoutes/clock-in'),
    CLOCK_OUT_API: createUrl('/attendanceRoutes/clock-out'),
    GET_CURRENT_ATTENDANCE_STATUS_API: createUrl('/attendanceRoutes/status'),
    GET_ATTENDANCE_HISTORY_API: createUrl('/attendanceRoutes/history'),
};

export const PERFORMANCE_REVIEW_ENDPOINTS = {
    GET_MY_PERFORMANCE_REVIEWS_API: createUrl('/employeePerformance/myPerformance'),
    GET_TEAM_PERFORMANCE_REVIEWS_API: createUrl('/employeePerformance/teamPerformance'),
    GET_PERFORMANCE_REVIEW_BY_ID_API: (reviewId) => createUrl(`/employeePerformance/performanceById/${reviewId}`),
    GET_ALL_PERFORMANCE_REVIEWS_API: createUrl('/employeePerformance/getAllPerformance'),
    UPDATE_PERFORMANCE_REVIEW_API: (reviewId) => createUrl(`/employeePerformance/updatePerformance/${reviewId}`),
    SOFT_DELETE_PERFORMANCE_REVIEW_API: (reviewId) => createUrl(`/employeePerformance/deleteReview/${reviewId}`),
};

export const REVIEW_CYCLE_ENDPOINTS = {
    CREATE_REVIEW_CYCLE_API: createUrl('/reviewCycle/createReviewCycle'),
    GET_ALL_REVIEW_CYCLES_API: createUrl('/reviewCycle/getAllReviewCycle'),
    GET_REVIEW_CYCLE_BY_ID_API: (cycleId) => createUrl(`/reviewCycle/getReviewCycleById/${cycleId}`),
    ACTIVATE_REVIEW_CYCLE_API: (cycleId) => createUrl(`/reviewCycle/activateReviewCycle/${cycleId}`),
    UPDATE_REVIEW_CYCLE_API: (cycleId) => createUrl(`/reviewCycle/updateReviewCycle/${cycleId}`),
    DELETE_REVIEW_CYCLE_API: (cycleId) => createUrl(`/reviewCycle/deleteReviewCycle/${cycleId}`),

    // Potential future endpoint for non-admins to see active/relevant cycles:
    // GET_ACTIVE_REVIEW_CYCLES_FOR_USER_API: createUrl('/reviewCycle/activeForUser'),
};

export const TASK_ENDPOINTS = {
    CREATE_TASK_API: createUrl('/taskRoutes/createTask'),
    GET_MY_TASKS_API: createUrl('/taskRoutes/myTask'),
    GET_ALL_TASKS_API: createUrl('/taskRoutes/allTasks'),
    GET_TASK_BY_ID_API: (taskId) => createUrl(`/taskRoutes/getTaskById/${taskId}`),
    UPDATE_TASK_API: (taskId) => createUrl(`/taskRoutes/updateTask/${taskId}`),
    REOPEN_TASK_API: (taskId) => createUrl(`/taskRoutes/reopenTask/${taskId}`),
    DELETE_TASK_API: (taskId) => createUrl(`/taskRoutes/deleteTask/${taskId}`),
};

export const TIMESHEET_ENDPOINTS = {
    ADD_TIMESHEET_ENTRY_API: createUrl('/timesheet/addEntries'),
    UPDATE_TIMESHEET_ENTRY_BY_ID_API: (entryId) => createUrl(`/timesheet/updateEntries/${entryId}`),
    DELETE_TIMESHEET_ENTRY_API: (entryId) => createUrl(`/timesheet/deleteEntries/${entryId}`),
    // Timesheet Management
    GET_ALL_TIMESHEETS_API: createUrl('/timesheet/getALLTimesheets'), // For Admin/HR
    GET_MY_TIMESHEETS_API: createUrl('/timesheet/myTimeSheets'), // For logged-in employee
    GET_SUBMITTED_TIMESHEETS_API: createUrl('/timesheet/submitted'), // For approvers
    GET_TIMESHEET_BY_ID_API: (timesheetId) => createUrl(`/timesheet/getTimesheetById/${timesheetId}`),
    SUBMIT_TIMESHEET_API: (timesheetId) => createUrl(`/timesheet/draftTimeSheet/${timesheetId}/submit`),
    APPROVE_TIMESHEET_API: (timesheetId) => createUrl(`/timesheet/approveTimesheet/${timesheetId}/approve`),
    REJECT_TIMESHEET_API: (timesheetId) => createUrl(`/timesheet/checkTimesheet/${timesheetId}/reject`),
};

export const TRANSACTION_ENDPOINTS = {
    GET_TRANSACTION_BY_ID_API: (transactionId) => createUrl(`/transactionsDetails/transaction/${transactionId}`),
    GET_ALL_TRANSACTIONS_API: createUrl('/transactionsDetails/transactions'),
};

export const PROJECT_ENDPOINTS = {

    GET_ALL_PROJECTS_API: createUrl('/projectData/projects'),
    GET_PROJECT_BY_ID_API: (projectId) => createUrl(`/projectData/projects/${projectId}`),
    CREATE_PROJECT_API: createUrl('/projectData/projects/create'),
    UPDATE_PROJECT_API: (projectId) => createUrl(`/projectData/projects/${projectId}`),
    DELETE_PROJECT_API: (projectId) => createUrl(`/projectData/projects/${projectId}`),
    ADD_PROJECT_TEAM_API: (projectId) => createUrl(`/projectData/projects/${projectId}/add-team`),
    REMOVE_PROJECT_TEAM_API: (projectId) => createUrl(`/projectData/projects/${projectId}/remove-team`),
    ADD_PROJECT_CLIENT_API: (projectId) => createUrl(`/projectData/projects/${projectId}/add-client`),
    REMOVE_PROJECT_CLIENT_API: (projectId) => createUrl(`/projectData/projects/${projectId}/remove-client`),
};

export const DASHBOARD_ENDPOINTS = {
    // Role-specific endpoints
    GET_EMPLOYEE_DASHBOARD_API: createUrl('/dashboardRoutes/employee-summary'),
    GET_MANAGER_DASHBOARD_API: createUrl('/dashboardRoutes/manager-summary'),
    GET_ADMIN_DASHBOARD_API: createUrl('/dashboardRoutes/admin-summary'),
    GET_HR_DASHBOARD_API: createUrl('/dashboardRoutes/hr-summary'),

    // Common dashboard endpoints
    GET_COMMON_DASHBOARD_API: createUrl('/dashboardRoutes/common-data'),
    GET_RECENT_ACTIVITIES_API: createUrl('/dashboardRoutes/recent-activities'),
    GET_NOTIFICATIONS_API: createUrl('/dashboardRoutes/notifications'),
    MARK_NOTIFICATION_READ_API: (notificationId) => createUrl(`/dashboardRoutes/notifications/${notificationId}/read`),
    CLEAR_ALL_NOTIFICATIONS_API: createUrl('/dashboardRoutes/notifications/clear-all'),
};


export const ANNOUNCEMENT_ENDPOINTS = {
    CREATE_ANNOUNCEMENT_API: createUrl('/announcementRoutes'),
    GET_ALL_ANNOUNCEMENTS_MANAGEMENT_API: createUrl('/announcementRoutes/management'),
    GET_ANNOUNCEMENT_BY_ID_MANAGEMENT_API: (announcementId) => createUrl(`/announcementRoutes/management/${announcementId}`),
    UPDATE_ANNOUNCEMENT_API: (announcementId) => createUrl(`/announcementRoutes/${announcementId}`),
    DELETE_ANNOUNCEMENT_API: (announcementId) => createUrl(`/announcementRoutes/${announcementId}`),
    PUBLISH_ANNOUNCEMENT_API: (announcementId) => createUrl(`/announcementRoutes/${announcementId}/publish`),
    ARCHIVE_ANNOUNCEMENT_API: (announcementId) => createUrl(`/announcementRoutes/${announcementId}/archive`),
    GET_ACTIVE_ANNOUNCEMENTS_USER_API: createUrl('/announcementRoutes/active'),
};

export const TEAM_ENDPOINTS = {
    GET_ALL_TEAMS_API: createUrl('/teamRoutes/teams'),
    GET_TEAM_BY_ID_API: (teamId) => createUrl(`/teamRoutes/teams/${teamId}`),
    CREATE_TEAM_API: createUrl('/teamRoutes/teams'),
    UPDATE_TEAM_API: (teamId) => createUrl(`/teamRoutes/teams/${teamId}`),
    DELETE_TEAM_API: (teamId) => createUrl(`/teamRoutes/teams/${teamId}`),
    ADD_TEAM_MEMBER_API: (teamId) => createUrl(`/teamRoutes/teams/${teamId}/members`),
    REMOVE_TEAM_MEMBER_API: (teamId) => createUrl(`/teamRoutes/teams/${teamId}/members`),
};
