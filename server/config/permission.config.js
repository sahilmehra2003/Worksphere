export const Permissions = Object.freeze({
    // Employee Management
    MANAGE_EMPLOYEES: 'manage_employees',
    VIEW_EMPLOYEES: 'view_employees',

    // Leave Management
    REQUEST_LEAVE: 'request_leave',
    APPROVE_LEAVES: 'approve_leaves',
    VIEW_OWN_LEAVE_BALANCE: 'view_own_leave_balance',
    VIEW_TEAM_LEAVE_BALANCE: 'view_team_leave_balance',
    VIEW_ALL_LEAVES: 'view_all_leaves',

    // Department Management
    MANAGE_DEPARTMENTS: 'manage_departments',

    // Role/Permission Management
    MANAGE_ROLES: 'manage_roles',

    // Calendar Management
    MANAGE_CALENDAR: 'manage_calendar',

    // Performance Management
    CREATE_PERFORMANCE_REVIEW: 'create_performance_review',
    MANAGE_PERFORMANCE_CYCLES: 'manage_performance_cycles',
    MANAGE_PERFORMANCE_TEMPLATES: 'manage_performance_templates',
    SET_GOALS: 'set_goals',
    SUBMIT_SELF_ASSESSMENT: 'submit_self_assessment',
    ACKNOWLEDGE_REVIEW: 'acknowledge_review',
    VIEW_OWN_PERFORMANCE: 'view_own_performance',
    VIEW_TEAM_PERFORMANCE: 'view_team_performance',
    VIEW_ALL_PERFORMANCE_DATA: 'view_all_performance_data',
    UPDATE_OWN_SELF_ASSESSMENT: 'update_own_self_assessment',
    UPDATE_MANAGER_REVIEW: 'update_manager_review',
    UPDATE_DEPARTMENT_HEAD_REVIEW: 'update_department_head_review',
    UPDATE_TEAM_LEAD_REVIEW: 'update_team_lead_review',
    DELETE_REVIEW: 'delete_review',

    // Goal Management
    CREATE_OWN_GOAL: 'create_own_goal',
    UPDATE_OWN_GOAL: 'update_own_goal',
    DELETE_OWN_GOAL: 'delete_own_goal',
    VIEW_OWN_GOALS: 'view_own_goals',
    VIEW_TEAM_GOALS: 'view_team_goals',
    MANAGE_ALL_GOALS: 'manage_all_goals',
    COMMENT_ON_GOALS: 'comment_on_goals',


    // Task Management Permissions
    CREATE_TASKS: 'create_tasks',
    VIEW_OWN_TASKS: 'view_own_tasks',
    VIEW_TEAM_TASKS: 'view_team_tasks',
    VIEW_ALL_TASKS: 'view_all_tasks',
    MARK_OWN_TASK_COMPLETE: 'mark_own_task_complete',
    MANAGE_TEAM_TASKS: 'manage_team_tasks',
    MANAGE_ALL_TASKS: 'manage_all_tasks',
    DELETE_TASKS: 'delete_tasks',
    REOPEN_TASKS: 'reopen_tasks',
    UPDATE_TASKS: 'update_tasks',
    VIEW_OTHER_TASKS: 'view_other_tasks',

    // Reporting
    VIEW_REPORTS: 'view_reports',

    // Timesheet Permissions
    APPROVE_TIMESHEETS: 'approve_timesheets',
    VIEW_ALL_TIMESHEETS: 'view_all_timesheets',
    VIEW_TEAM_TIMESHEETS: 'view_team_timesheets',
    FILL_OWN_TIMESHEET: 'fill_own_timesheets',
    SUBMIT_OWN_TIMESHEET: 'submit_own_timesheets',
    VIEW_OWN_TIMESHEET: 'view_own_timesheets',

    // Transaction Permissions
    MANAGE_TRANSACTIONS: 'manage_transactions',
    VIEW_TRANSACTIONS: 'view_transactions',
    CREATE_TRANSACTION: 'create_transaction',
    EDIT_TRANSACTION: 'edit_transaction',
    DELETE_TRANSACTION: 'delete_transaction',
    APPROVE_TRANSACTION: 'approve_transaction',
    VIEW_FINANCE_REPORTS: 'view_finance_reports',

    // Finance-specific permissions
    CREATE_EXPENSE: 'CREATE_EXPENSE',
    CREATE_REVENUE: 'create_revenue',
    APPROVE_EXPENSE: 'approve_expense',
    APPROVE_REVENUE: 'approve_revenue',
    VIEW_FINANCE_REports: 'view_finance_reports',
    VIEW_EXPENSES: 'view_expenses',

    // clients
    MANAGE_CLIENTS: 'MANAGE_CLIENTS',

    // --- NEW Attendance Permissions ---
    MARK_ATTENDANCE: 'mark_attendance',
    APPROVE_ATTENDANCE_SHORTFALL: 'approve_attendance_shortfall',
    MANAGE_ALL_ATTENDANCE: 'manage_all_attendance',
    FLAG_ATTENDANCE_ISSUE: 'flag_attendance_issue',
    VIEW_ATTENDANCE_RECORDS: 'view_attendance_record',

    // --- Bonus System Permissions ---
    AWARD_BONUS: 'award_bonus',
    APPROVE_BONUS: 'approve_bonus',
    MANAGE_BONUS_PAYMENTS: 'manage_bonus_payments',
    VIEW_ALL_BONUSES: 'view_all_bonuses',

    // Project Management
    CREATE_PROJECT: 'create_project',
    UPDATE_PROJECT: 'update_project',
    DELETE_PROJECT: 'delete_project',
    VIEW_PROJECT: 'view_project',

    // Department Management (add more granular)
    CREATE_DEPARTMENT: 'create_department',
    UPDATE_DEPARTMENT: 'update_department',
    DELETE_DEPARTMENT: 'delete_department',
    VIEW_DEPARTMENT: 'view_department',

    // Client Management
    CREATE_CLIENT: 'create_client',
    UPDATE_CLIENT: 'update_client',
    DELETE_CLIENT: 'delete_client',
    VIEW_CLIENT: 'view_client',

    // Team Management
    CREATE_TEAM: 'create_team',
    UPDATE_TEAM: 'update_team',
    DELETE_TEAM: 'delete_team',
    VIEW_TEAM: 'view_team',
});

export const rolePermissions = {
    Admin: Object.values(Permissions),

    HR: [
        Permissions.MANAGE_EMPLOYEES,
        Permissions.VIEW_EMPLOYEES,
        Permissions.APPROVE_LEAVES,
        Permissions.VIEW_ALL_LEAVES,
        Permissions.VIEW_TEAM_LEAVE_BALANCE,
        Permissions.MANAGE_DEPARTMENTS,
        Permissions.MANAGE_CALENDAR,
        Permissions.MANAGE_PERFORMANCE_CYCLES,
        Permissions.MANAGE_PERFORMANCE_TEMPLATES,
        Permissions.VIEW_ALL_PERFORMANCE_DATA,
        Permissions.VIEW_REPORTS,
        Permissions.CREATE_TASKS,
        Permissions.VIEW_ALL_TASKS,
        Permissions.MANAGE_ALL_TASKS,
        Permissions.REOPEN_TASKS,
        Permissions.DELETE_TASKS,
        Permissions.REQUEST_LEAVE,
        Permissions.VIEW_OWN_LEAVE_BALANCE,
        Permissions.SUBMIT_SELF_ASSESSMENT,
        Permissions.ACKNOWLEDGE_REVIEW,
        Permissions.VIEW_OWN_PERFORMANCE,
        Permissions.VIEW_OWN_TASKS,
        Permissions.MARK_OWN_TASK_COMPLETE,
        Permissions.UPDATE_TASKS,
        Permissions.VIEW_OTHER_TASKS,
        Permissions.APPROVE_TIMESHEETS,
        Permissions.VIEW_ALL_TIMESHEETS,
        Permissions.VIEW_TEAM_TIMESHEETS,
        Permissions.VIEW_TRANSACTIONS,
        Permissions.VIEW_TRANSACTION_REPORTS,
        Permissions.APPROVE_EXPENSE,
        Permissions.APPROVE_REVENUE,
        Permissions.VIEW_FINANCE_REPORTS,
        Permissions.VIEW_EXPENSES,
        // HR Attendance Permissions
        Permissions.MANAGE_ALL_ATTENDANCE,
        Permissions.VIEW_ATTENDANCE_RECORDS,
        Permissions.VIEW_OWN_TIMESHEET,
        Permissions.SUBMIT_OWN_TIMESHEET,
        Permissions.FILL_OWN_TIMESHEET,
        Permissions.AWARD_BONUS,
        Permissions.APPROVE_BONUS,
        Permissions.MANAGE_BONUS_PAYMENTS,
        Permissions.VIEW_ALL_BONUSES,
        Permissions.UPDATE_MANAGER_REVIEW,
        Permissions.UPDATE_DEPARTMENT_HEAD_REVIEW,
        Permissions.UPDATE_TEAM_LEAD_REVIEW,
        Permissions.DELETE_REVIEW,
        Permissions.MANAGE_ALL_GOALS,
        Permissions.COMMENT_ON_GOALS,
        Permissions.VIEW_TEAM_GOALS,
        Permissions.CREATE_PERFORMANCE_REVIEW
    ],

    Manager: [
        Permissions.VIEW_EMPLOYEES,
        Permissions.APPROVE_LEAVES,
        Permissions.VIEW_TEAM_LEAVE_BALANCE,
        Permissions.SET_GOALS,
        // Permissions.CONDUCT_REVIEWS, // Assuming this will be added
        Permissions.VIEW_TEAM_PERFORMANCE,
        Permissions.VIEW_REPORTS,
        Permissions.CREATE_TASKS,
        Permissions.VIEW_TEAM_TASKS,
        Permissions.MANAGE_TEAM_TASKS,
        Permissions.REOPEN_TASKS,
        Permissions.DELETE_TASKS,
        Permissions.REQUEST_LEAVE,
        Permissions.VIEW_OWN_LEAVE_BALANCE,
        Permissions.SUBMIT_SELF_ASSESSMENT,
        Permissions.ACKNOWLEDGE_REVIEW,
        Permissions.VIEW_OWN_PERFORMANCE,
        Permissions.VIEW_OWN_TASKS,
        Permissions.MARK_OWN_TASK_COMPLETE,
        Permissions.UPDATE_TASKS,
        Permissions.VIEW_OTHER_TASKS,
        Permissions.APPROVE_TIMESHEETS,
        Permissions.VIEW_TEAM_TIMESHEETS,
        Permissions.MANAGE_CLIENTS,
        Permissions.VIEW_TRANSACTIONS,
        Permissions.VIEW_TRANSACTION_REPORTS,
        Permissions.CREATE_EXPENSE,
        Permissions.CREATE_REVENUE,
        Permissions.APPROVE_EXPENSE,
        Permissions.APPROVE_REVENUE,
        Permissions.VIEW_FINANCE_REPORTS,
        Permissions.VIEW_EXPENSES,
        // Manager Attendance Permissions
        Permissions.MARK_ATTENDANCE,
        Permissions.APPROVE_ATTENDANCE_SHORTFALL,
        Permissions.FLAG_ATTENDANCE_ISSUE,
        Permissions.VIEW_OWN_TIMESHEET,
        Permissions.SUBMIT_OWN_TIMESHEET,
        Permissions.FILL_OWN_TIMESHEET,
        Permissions.AWARD_BONUS,
        Permissions.APPROVE_BONUS,
        Permissions.UPDATE_MANAGER_REVIEW,
        Permissions.VIEW_TEAM_GOALS,
        Permissions.COMMENT_ON_GOALS,
        Permissions.CREATE_OWN_GOAL,
        Permissions.UPDATE_OWN_GOAL,
        Permissions.DELETE_OWN_GOAL,
        Permissions.VIEW_OWN_GOALS,
        Permissions.CREATE_PERFORMANCE_REVIEW,
    ],

    TeamHead: [

        Permissions.MARK_ATTENDANCE,
        Permissions.APPROVE_ATTENDANCE_SHORTFALL,
        Permissions.FLAG_ATTENDANCE_ISSUE,
        Permissions.VIEW_OWN_TIMESHEET,
        Permissions.SUBMIT_OWN_TIMESHEET,
        Permissions.FILL_OWN_TIMESHEET,
        Permissions.AWARD_BONUS,
        Permissions.UPDATE_MANAGER_REVIEW,
    ],

    Employee: [
        Permissions.VIEW_EMPLOYEES,
        Permissions.REQUEST_LEAVE,
        Permissions.VIEW_OWN_LEAVE_BALANCE,
        Permissions.SUBMIT_SELF_ASSESSMENT,
        Permissions.ACKNOWLEDGE_REVIEW,
        Permissions.VIEW_OWN_PERFORMANCE,
        Permissions.VIEW_OWN_TASKS,
        Permissions.MARK_OWN_TASK_COMPLETE,
        Permissions.VIEW_TRANSACTIONS,
        Permissions.CREATE_EXPENSE,
        Permissions.CREATE_REVENUE,
        // Employee Attendance Permissions
        Permissions.MARK_ATTENDANCE,
        Permissions.FLAG_ATTENDANCE_ISSUE,
        Permissions.VIEW_OWN_TIMESHEET,
        Permissions.SUBMIT_OWN_TIMESHEET,
        Permissions.FILL_OWN_TIMESHEET,
        Permissions.UPDATE_OWN_SELF_ASSESSMENT,
        Permissions.CREATE_OWN_GOAL,
        Permissions.UPDATE_OWN_GOAL,
        Permissions.DELETE_OWN_GOAL,
        Permissions.VIEW_OWN_GOALS
    ],
};

export const hasPermission = (role, permission) => {
    if (!role) return false;
    const permissionsForRole = rolePermissions[role] || [];
    return permissionsForRole.includes(permission);
};
