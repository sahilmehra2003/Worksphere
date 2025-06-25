import express from 'express';
import {
    markCheckIn,
    markCheckOut,
    getAttendanceForEmployee,
    getPendingApprovals,
    approveOrRejectShortfall,
    flagIssueToHR,
    updateAttendanceByAdmin,
    getCurrentAttendanceStatus,
    requestCorrection,
    requestHalfDay
} from '../controllers/attendance.controller.js';
import { authN } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';

const router = express.Router();


router.post(
    '/check-in',
    authN,
    checkPermission(Permissions.MARK_ATTENDANCE),
    markCheckIn
);

router.post(
    '/check-out',
    authN,
    checkPermission(Permissions.MARK_ATTENDANCE),
    markCheckOut
);

router.patch(
    '/flag/:attendanceId',
    authN,
    checkPermission(Permissions.FLAG_ATTENDANCE_ISSUE),
    flagIssueToHR
);


router.get(
    '/approvals',
    authN,
    checkPermission(Permissions.APPROVE_ATTENDANCE_SHORTFALL),
    getPendingApprovals
);

router.patch(
    '/approve/:attendanceId',
    authN,
    checkPermission(Permissions.APPROVE_ATTENDANCE_SHORTFALL),
    approveOrRejectShortfall
);

router.get('/current-status',
    authN,
    checkPermission(Permissions.VIEW_ATTENDANCE_RECORDS),
    getCurrentAttendanceStatus
)


router.get(
    '/employee/:employeeId',
    authN,
    checkPermission(Permissions.VIEW_ATTENDANCE_RECORDS),
    getAttendanceForEmployee
);


router.put(
    '/:attendanceId',
    authN,
    checkPermission(Permissions.MANAGE_ALL_ATTENDANCE),
    updateAttendanceByAdmin
);

router.put(
    '/request/correction/:attendaceId',
    authN,
    checkPermission(Permissions.FLAG_ATTENDANCE_ISSUE),
    requestCorrection
)
router.post(
    '/request/half-day',
    authN,
    checkPermission(Permissions.FLAG_ATTENDANCE_ISSUE),
    requestHalfDay
)

export default router;


