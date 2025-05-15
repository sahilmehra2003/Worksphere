import express from 'express';
import {
    getEmployeeDashboardSummary,
    // getManagerDashboardSummary, // To be created
    // getAdminDashboardSummary,   // To be created
    // getHRDashboardSummary       // To be created
} from '../controllers/dashboardController.js'; // Adjust path as needed
import { authN } from '../middlewares/auth.js'; // Adjust path
import { checkRole } from '../middlewares/authorization.js'; // Adjust path (if using for Manager/Admin/HR routes)
// import { Permissions } from '../config/permissions.js'; // If using specific dashboard permissions

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
     // getManagerDashboardSummary,
);

// GET /api/dashboard/admin-summary - Data for the Admin's dashboard
router.get(
    '/admin-summary',
    authN,
    checkRole(['Admin']),
    // getAdminDashboardSummary,
);

// GET /api/dashboard/hr-summary - Data for the HR's dashboard
router.get(
    '/hr-summary',
    authN,
    checkRole(['HR', 'Admin']),
    // getHRDashboardSummary   
);

export default router;