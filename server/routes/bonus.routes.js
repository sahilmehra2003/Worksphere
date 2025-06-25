import express from 'express';
import {
    awardBonus,
    getPendingBonusApprovals,
    approveOrRejectBonus,
    markBonusAsPaid,
    fetchBonusTypes,
    fetchMyBonusAwards,
    createBonusAward,
    seedBonusTypes
} from '../controllers/bonus.controller.js';
import { authN } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';

const router = express.Router();

router.post(
    '/award',
    authN,
    checkPermission(Permissions.AWARD_BONUS),
    awardBonus
);


router.get(
    '/pending-approvals',
    authN,
    checkPermission(Permissions.APPROVE_BONUS),
    getPendingBonusApprovals
);


router.patch(
    '/approve-reject/:awardId',
    authN,
    checkPermission(Permissions.APPROVE_BONUS),
    approveOrRejectBonus
);


router.post(
    '/mark-paid/:awardId',
    authN,
    checkPermission(Permissions.MANAGE_BONUS_PAYMENTS),
    markBonusAsPaid
);

// Bonus Types
router.get('/types', authN, fetchBonusTypes);
router.post('/seed-types', authN, seedBonusTypes);

// Bonus Awards
router.get('/my-awards', authN, fetchMyBonusAwards);
router.post('/awards', authN, createBonusAward);

export default router;
