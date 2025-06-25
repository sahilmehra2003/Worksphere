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
    LOGOUT_API: createUrl('/auth/logout'),
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
    SEARCH_EMPLOYEES_API: createUrl('/employeeInfo/employees'),
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
    CREATE_LEAVE_BALANCES_FOR_ALL_EMPLOYEES_API: createUrl('/leaveSystem/balance/init-all'),
    GET_PENDING_LEAVE_REQUESTS_API: createUrl('/leaveSystem/pending'),
};


export const CLIENT_ENDPOINTS = {
    GET_ALL_CLIENTS_API: createUrl('/clientData/clients'),
    GET_CLIENT_BY_ID_API: (clientId) => createUrl(`/clientData/client/${clientId}`),
    CREATE_CLIENT_API: createUrl('/clientData/client/create'),
    UPDATE_CLIENT_API: (clientId) => createUrl(`/clientData/client/update/${clientId}`),
    DEACTIVATE_CLIENT_API: (clientId) => createUrl(`/clientData/deactivateClient/${clientId}`),
};

export const ATTENDANCE_ENDPOINTS = {
    CHECK_IN_API: createUrl('/attendanceRoutes/check-in'),
    CHECK_OUT_API: createUrl('/attendanceRoutes/check-out'),
    FLAG_ISSUE_TO_HR_API: (attendanceId) => createUrl(`/attendanceRoutes/flag/${attendanceId}`),
    GET_ATTENDANCE_FOR_EMPLOYEE_API: (employeeId) => createUrl(`/attendanceRoutes/employee/${employeeId}`),
    GET_PENDING_APPROVALS_API: createUrl('/attendanceRoutes/approvals'),
    APPROVE_OR_REJECT_SHORTFALL_API: (attendanceId) => createUrl(`/attendanceRoutes/approve/${attendanceId}`),
    UPDATE_ATTENDANCE_BY_ADMIN_API: (attendanceId) => createUrl(`/attendanceRoutes/${attendanceId}`),
    GET_CURRENT_ATTENDANCE_STATUS_API: createUrl('/attendanceRoutes/current-status'),
    REQUEST_CORRECTION_API: (attendanceId) => createUrl(`/attendanceRoutes/request/correction/${attendanceId}`),
    REQUEST_HALF_DAY_API: createUrl('/attendanceRoutes/request/half-day'),
};

export const PERFORMANCE_REVIEW_ENDPOINTS = {
    CREATE_REVIEW_API: createUrl('/employee-performance'),
    GET_MY_REVIEWS_API: createUrl('/employee-performance/my-reviews'),
    GET_TEAM_REVIEWS_API: createUrl('/employee-performance/team-reviews'),
    GET_ALL_REVIEWS_API: createUrl('/employee-performance/all-reviews'),
    GET_REVIEW_BY_ID_API: (reviewId) => createUrl(`/employee-performance/${reviewId}`),
    UPDATE_REVIEW_API: (reviewId) => createUrl(`/employee-performance/${reviewId}`),
    DELETE_REVIEW_API: (reviewId) => createUrl(`/employee-performance/${reviewId}`),
    SUBMIT_SELF_ASSESSMENT_API: createUrl('/employee-performance/submit-self-assessment'),
    SUBMIT_MANAGER_REVIEW_API: createUrl('/employee-performance/submit-manager-review'),
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
export const GOAL_ENDPOINTS = {
    CREATE_GOAL_API: createUrl('/goals/add-goal'),
    // GET_GOAL_API: accepts ?employeeId=<empId>&reviewCycleId=<reviewCycleId> as query params
    GET_GOAL_API: createUrl('/goals/view-goals'),
    UPDATE_GOAL_PROGRESS_API: (goalId) => createUrl(`/goals/${goalId}/progress`),
    DELETE_GOAL_API: (goalId) => createUrl(`/goals/${goalId}`),
    ADD_GOAL_COMMENT_API: (goalId) => createUrl(`/goals/${goalId}/comment`),
    ADD_GOAL_EVIDENCE_API: (goalId) => createUrl(`/goals/${goalId}/evidence`),
    GET_GOALS_BY_EMPLOYEE_ID_API: (empId) => createUrl(`/goals/employee/${empId}`),
}

export const TIMESHEET_ENDPOINTS = {
    CREATE_TIME_LOG_API: createUrl('/timesheets/log'),
    GET_WEEKLY_LOGS_API: (weekStartDate) => createUrl(`/timesheets/weekly?weekStartDate=${weekStartDate}`),
    SUBMIT_WEEKLY_TIMESHEET_API: createUrl('/timesheets/submit-week'),
    GET_PENDING_APPROVALS_API: createUrl('/timesheets/approvals'),
    APPROVE_OR_REJECT_LOG_API: (logId) => createUrl(`/timesheets/approve/${logId}`),
};


export const TRANSACTION_ENDPOINTS = {
    // --- Expense Routes ---
    CREATE_EXPENSE_API: createUrl('/transactions/expenses'),
    CREATE_PROJECT_EXPENSE_API: createUrl('/transactions/expenses/create-project-expense'),
    GET_PENDING_EXPENSES_API: createUrl('/transactions/expenses/get-pending-expenses'),
    APPROVE_EXPENSE_API: (expenseId) => createUrl(`/transactions/expenses/${expenseId}/approve`),
    UPDATE_EXPENSE_API: (expenseId) => createUrl(`/transactions/expenses/${expenseId}`),
    DELETE_EXPENSE_API: (expenseId) => createUrl(`/transactions/expenses/${expenseId}`),

    // Recurring and Automated Expense Routes
    TRIGGER_MONTHLY_SALARY_EXPENSE_API: createUrl('/transactions/expenses/generate-monthly-salaries'),
    CREATE_RECURRING_EXPENSE_API: createUrl('/transactions/expenses/recurring/create'),
    FETCH_RECURRING_EXPENSE_API: createUrl('/transactions/expenses/recurring/fetch'),

    // --- Revenue Routes ---
    CREATE_REVENUE_API: createUrl('/transactions/revenue'),
    CREATE_PROJECT_REVENUE_API: createUrl('/transactions/revenue/create-project-revenue'),
    GET_PENDING_REVENUES_API: createUrl('/transactions/revenue/get-pending-revenue'),
    APPROVE_REVENUE_API: (revenueId) => createUrl(`/transactions/revenue/${revenueId}/approve`),
    UPDATE_REVENUE_API: (revenueId) => createUrl(`/transactions/revenue/${revenueId}`), // <-- ADDED
    DELETE_REVENUE_API: (revenueId) => createUrl(`/transactions/revenue/${revenueId}`), // <-- ADDED

    // --- Reporting and Financial Period Routes ---
    GET_ANNUAL_REPORT_API: createUrl('/transactions/periods/annual'),
    GET_MONTHLY_REPORT_API: createUrl('/transactions/reports/monthly'),
    GET_DEPARTMENT_FINANCIAL_SUMMARY_API: createUrl('/transactions/reports/department-summary'),
    GET_PENDING_FINANCIAL_REPORT_API: createUrl('/transactions/reports/get-pending-financial-period-report'),
    GET_DEPARTMENT_SALARY_EXPENSE_API: (departmentId) => createUrl(`/transactions/reports/department-salary-expense/${departmentId}`),

    // Financial Period Management
    GET_ALL_PERIODS_API: createUrl('/transactions/periods'),
    GET_PERIOD_SUMMARY_API: createUrl('/transactions/periods/summary'),
    UPDATE_PERIOD_STATUS_API: (periodId) => createUrl(`/transactions/periods/${periodId}/status`),
    UPDATE_FINANCIAL_PERIOD_API: (periodId) => createUrl(`/transactions/periods/${periodId}`),
    DELETE_FINANCIAL_PERIOD_API: (periodId) => createUrl(`/transactions/periods/${periodId}`),

    // General Utility
    GET_AVAILABLE_YEARS_API: createUrl('/transactions/available-years'),
};

export const PROJECT_ENDPOINTS = {

    GET_ALL_PROJECTS_API: createUrl('/projectData/projects'),
    GET_MY_PROJECTS_API: createUrl('/projectData/projects/my'),
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

export const BONUS_ENDPOINTS = {
    FETCH_BONUS_TYPES: '/api/v1/bonus/types',
    SEED_BONUS_TYPES: '/api/v1/bonus/seed-types',
    FETCH_MY_BONUS_AWARDS: '/api/v1/bonus/my-awards',
    CREATE_BONUS_AWARD: '/api/v1/bonus/awards',
    GET_PENDING_BONUS_APPROVALS: '/api/v1/bonus/pending-approvals',
    APPROVE_REJECT_BONUS: (awardId) => `/api/v1/bonus/approve-reject/${awardId}`,
    MARK_BONUS_AS_PAID: '/api/v1/bonus/mark-paid'
};

