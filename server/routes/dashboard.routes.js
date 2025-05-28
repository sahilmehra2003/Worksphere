import express from 'express';
import {
    getEmployeeDashboardSummary,
} from '../controllers/employeeDashboard.controller.js';
import { authN } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/permission.middleware.js';
import { getManagerDashboardSummary } from '../controllers/managerDashboard.controller.js';
import { getHrDashboardSummary } from '../controllers/hrDashboard.controller.js';
import { getAdminDashboardSummary } from '../controllers/adminDashboard.controller.js';
import {
    getCommonDashboardData,
    getRecentActivities,
    getNotifications,
    markNotificationAsRead,
    clearAllNotifications
} from '../controllers/dashboard.controller.js';

const router = express.Router();

// Role-specific dashboard routes
router.get(
    '/employee-summary',
    authN,
    getEmployeeDashboardSummary
);

router.get(
    '/manager-summary',
    authN,
    checkRole(['Manager', 'Admin', 'HR']),
    getManagerDashboardSummary,
);

router.get(
    '/admin-summary',
    authN,
    checkRole(['Admin']),
    getAdminDashboardSummary,
);

router.get(
    '/hr-summary',
    authN,
    checkRole(['HR', 'Admin']),
    getHrDashboardSummary
);

// Common dashboard routes
router.get(
    '/common-data',
    authN,
    getCommonDashboardData
);

router.get(
    '/recent-activities',
    authN,
    getRecentActivities
);

router.get(
    '/notifications',
    authN,
    getNotifications
);

router.post(
    '/notifications/:notificationId/read',
    authN,
    markNotificationAsRead
);

router.delete(
    '/notifications/clear-all',
    authN,
    clearAllNotifications
);

export default router;