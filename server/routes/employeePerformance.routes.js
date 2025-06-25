import express from 'express'
import {
    getMyPerformanceReviews,
    getTeamPerformanceReviews,
    getAllPerformanceReviews,
    getPerformanceReviewById,
    createPerformanceReview,
    updatePerformanceReview,
    softDeletePerformanceReview,
    submitSelfAssessment,
    submitManagerReview
} from '../controllers/employeePerformance.controller.js'
import { authN } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';


const router = express.Router();

router.post(
    '/',
    authN,
    checkPermission(Permissions.CREATE_PERFORMANCE_REVIEW),
    createPerformanceReview
);

router.get('/my-reviews', authN, checkPermission(Permissions.VIEW_OWN_PERFORMANCE), getMyPerformanceReviews);
router.get('/team-reviews', authN, checkPermission(Permissions.VIEW_TEAM_PERFORMANCE), getTeamPerformanceReviews);
router.get('/all-reviews', authN, checkPermission(Permissions.VIEW_ALL_PERFORMANCE_DATA), getAllPerformanceReviews);
router.get('/:id', authN, getPerformanceReviewById);


router.put('/:id',
    authN,
    checkPermission([
        Permissions.UPDATE_OWN_SELF_ASSESSMENT,
        Permissions.UPDATE_MANAGER_REVIEW,
        Permissions.UPDATE_DEPARTMENT_HEAD_REVIEW,
        Permissions.UPDATE_TEAM_LEAD_REVIEW
    ]),
    updatePerformanceReview
);

router.delete('/:id', authN, checkPermission(Permissions.DELETE_REVIEW), softDeletePerformanceReview);

// --- NEW ROUTES ---

// Submit Self-Assessment
router.post('/submit-self-assessment',
    authN,
    checkPermission([
        Permissions.SUBMIT_SELF_ASSESSMENT,
        Permissions.UPDATE_OWN_SELF_ASSESSMENT
    ]),
    submitSelfAssessment
);

// Submit Manager Review
router.post('/submit-manager-review',
    authN,
    checkPermission([
        Permissions.UPDATE_MANAGER_REVIEW,
        Permissions.UPDATE_DEPARTMENT_HEAD_REVIEW,
        Permissions.UPDATE_TEAM_LEAD_REVIEW
    ]),
    submitManagerReview
);

export default router;