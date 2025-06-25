import express from 'express';
import {
    createTimeLog,
    getWeeklyTimeLogs,
    submitWeeklyTimesheet,
    approveOrRejectTimeLog,
    getPendingTimesheetApprovals,
} from '../controllers/timesheet.controller.js';
import { authN } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';

const router = express.Router();


// --- Employee Routes ---

// Create a new time log entry for a day
router.post(
    '/log',
    authN,
    checkPermission(Permissions.FILL_OWN_TIMESHEET),
    createTimeLog
);

router.post(
    '/submit-weekly-timesheet',
    authN,
    checkPermission(Permissions.FILL_OWN_TIMESHEET),
    submitWeeklyTimesheet
)

// Get all logs for the current user for a specific week
router.get(
    '/weekly',
    authN,
    checkPermission(Permissions.VIEW_OWN_TIMESHEET),
    getWeeklyTimeLogs
);

// Submit a full week's timesheet for approval
router.patch(
    '/submit-week',
    authN,
    checkPermission(Permissions.SUBMIT_OWN_TIMESHEET),
    submitWeeklyTimesheet
);


// --- Manager & HR Routes ---

// Get all timesheets pending approval for the current manager
router.get(
    '/approvals',
    authN,
    checkPermission(Permissions.APPROVE_TIMESHEETS),
    getPendingTimesheetApprovals
);

// Approve or reject a specific time log
router.patch(
    '/approve/:logId',
    authN,
    checkPermission(Permissions.APPROVE_TIMESHEETS),
    approveOrRejectTimeLog
);


export default router;
