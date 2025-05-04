// routes/leave.routes.js
import express from 'express';
import {
    applyLeave,
    approveLeave,
    rejectLeave,
    getLeaveHistory,
    getLeaveBalance,
    cancelLeave
} from '../controllers/leave.controller.js'
import { checkOverlappingLeaves } from '../middlewares/validateLeave.middleware.js'
import { authN } from '../middlewares/auth.js'
import { checkRole, checkPermission, canApproveLeaves, isManagerOrHR } from '../middlewares/permission.middleware.js'

const router = express.Router();

// Apply leave (Employee) - Needs auth, check for overlaps
router.post('/apply',
    authN,
    checkOverlappingLeaves, 
    applyLeave
);

// Approve leave (Requires 'approve_leaves' permission)
router.put('/:leaveId/approve',
    authN,
    canApproveLeaves, // Use permission check middleware
    approveLeave
);

// Reject leave (Requires 'approve_leaves' permission)
router.put('/:leaveId/reject',
    authN,
    canApproveLeaves, // Use permission check middleware
    rejectLeave
);

// Get leave history (Base auth needed, controller might have further logic)
router.get('/leaves', authN, getLeaveHistory);

// Get own leave balance
router.get('/balance', authN, getLeaveBalance);

// Example: Route for HR/Manager to get specific employee's balance
// router.get('/balance/:employeeId', authN, isManagerOrHR, getLeaveBalance);
router.put('/:leaveId/cancel', authN, cancelLeave);

export default router;