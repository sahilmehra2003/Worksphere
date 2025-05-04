import express from 'express'
import { 
    createReviewCycle, 
    deleteReviewCycle, 
    getAllReviewCycles, 
    getReviewCycleById, 
    updateReviewCycle,
    activateReviewCycle
} from '../controllers/reviewCycle.controller.js';
import { authN } from '../middlewares/auth.js'; 
import { Permissions } from '../config/permission.config.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
const router=express.Router();

router.post('/createReviewCycle',authN,checkPermission(Permissions.MANAGE_PERFORMANCE_CYCLES),createReviewCycle);
router.get('/getAllReviewCycle', authN,checkPermission(Permissions.MANAGE_PERFORMANCE_CYCLES),getAllReviewCycles);
router.get('/getReviewCycleById/:id',authN,checkPermission(Permissions.MANAGE_PERFORMANCE_CYCLES),getReviewCycleById);
router.put('/activateReviewCycle/:id',authN,checkPermission(Permissions.MANAGE_PERFORMANCE_CYCLES),activateReviewCycle)
router.put('/updateReviewCycle/:id',authN,checkPermission(Permissions.MANAGE_PERFORMANCE_CYCLES),updateReviewCycle);
router.delete('/deleteReviewCycle/:id',authN,checkPermission(Permissions.MANAGE_PERFORMANCE_CYCLES),deleteReviewCycle);

export default router;