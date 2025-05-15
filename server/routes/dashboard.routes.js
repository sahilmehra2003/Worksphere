import express from 'express';
import {
    getEmployeeDashboardSummary,
} from '../controllers/dashboardController.js'; // Adjust path as needed
import { authN } from '../middlewares/auth.js'; // Adjust path
import { checkRole } from '../middlewares/authorization.js'; 
import { getManagerDashboardSummary } from '../controllers/managerDashboard.controller.js';
import { getHRDashboardSummary } from '../controllers/hrDashboard.controller.js';
import { getAdminDashboardSummary } from '../controllers/adminDashboard.controller.js';
const router = express.Router();


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
    getHRDashboardSummary   
);

export default router;