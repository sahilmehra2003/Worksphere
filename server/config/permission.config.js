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
    MANAGE_PERFORMANCE_CYCLES: 'manage_performance_cycles',
    MANAGE_PERFORMANCE_TEMPLATES: 'manage_performance_templates',
    SET_GOALS: 'set_goals', 
    SUBMIT_SELF_ASSESSMENT: 'submit_self_assessment',
    ACKNOWLEDGE_REVIEW: 'acknowledge_review',
    VIEW_OWN_PERFORMANCE: 'view_own_performance',
    VIEW_TEAM_PERFORMANCE: 'view_team_performance',
    VIEW_ALL_PERFORMANCE_DATA: 'view_all_performance_data',

    // --- Task Management Permissions (NEW) ---
    CREATE_TASKS: 'create_tasks',                 
    VIEW_OWN_TASKS: 'view_own_tasks',                 
    VIEW_TEAM_TASKS: 'view_team_tasks',               
    VIEW_ALL_TASKS: 'view_all_tasks',                
    MARK_OWN_TASK_COMPLETE: 'mark_own_task_complete',
    MANAGE_TEAM_TASKS: 'manage_team_tasks',           
    MANAGE_ALL_TASKS: 'manage_all_tasks',             
    DELETE_TASKS: 'delete_tasks',                    
    REOPEN_TASKS: 'reopen_tasks',                    
    UPDATE_TASKS:'update_tasks',
    VIEW_OTHER_TASKS:'view_other_tasks',
    // Reporting
    VIEW_REPORTS: 'view_reports',

      // Timesheet Permissions 
      APPROVE_TIMESHEETS: 'approve_timesheets',
      VIEW_ALL_TIMESHEETS: 'view_all_timesheets',  
      VIEW_TEAM_TIMESHEETS: 'view_team_timesheets', 


    // Add other permissions (MANAGE_PROJECTS, MANAGE_CLIENTS etc.)
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
    ],

    Manager: [
        Permissions.VIEW_EMPLOYEES, 
        Permissions.APPROVE_LEAVES, 
        Permissions.VIEW_TEAM_LEAVE_BALANCE,
        Permissions.SET_GOALS, 
        Permissions.CONDUCT_REVIEWS, 
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
    ],

    DepartmentHead: [ 
        Permissions.VIEW_EMPLOYEES, 
        Permissions.APPROVE_LEAVES, 
        Permissions.VIEW_TEAM_LEAVE_BALANCE, 
        Permissions.SET_GOALS, 
        Permissions.CONDUCT_REVIEWS, 
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
    ],

    TeamHead: [ 
        Permissions.VIEW_EMPLOYEES, 
        Permissions.VIEW_TEAM_LEAVE_BALANCE, 
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
    ],
};

export const hasPermission = (role, permission) => {
    if (!role) return false;
    const permissionsForRole = rolePermissions[role] || [];
    return permissionsForRole.includes(permission);
};