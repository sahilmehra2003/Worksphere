import express from 'express';
import { authN } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';
import {
    createGoal,
    getGoals,
    updateGoalProgress,
    addGoalEvidence,
    deleteGoal,
    addGoalComment,
    getGoalsByEmployeeId
} from '../controllers/goal.controller.js';
import { upload } from '../middlewares/muler.middleware.js';

const router = express.Router();


router.post(
    '/add-goal',
    authN,
    checkPermission(Permissions.CREATE_OWN_GOAL),
    createGoal
);


router.get(
    '/view-goals',
    authN,
    checkPermission(Permissions.MANAGE_ALL_GOALS),
    getGoals
);

router.delete(
    '/:goalId',
    authN,
    checkPermission(Permissions.DELETE_OWN_GOAL),
    deleteGoal
);

// --- Progress and Evidence Updates ---
router.put(
    '/:goalId/progress',
    authN,
    checkPermission(Permissions.UPDATE_OWN_GOAL),
    updateGoalProgress
);

router.post(
    '/:goalId/evidence',
    authN,
    checkPermission(Permissions.UPDATE_OWN_GOAL),
    upload.single('evidence'),
    addGoalEvidence
);


router.post(
    '/:goalId/comment',
    authN,
    checkPermission(Permissions.COMMENT_ON_GOALS),
    addGoalComment
);

router.get(
    '/employee/:empId',
    authN,
    checkPermission(Permissions.VIEW_OWN_GOALS),
    getGoalsByEmployeeId
);

export default router;
