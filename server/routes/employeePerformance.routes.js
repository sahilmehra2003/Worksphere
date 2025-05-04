import express from 'express'
import {
    getMyPerformanceReviews,
    getTeamPerformanceReviews,
    getAllPerformanceReviews,
    getPerformanceReviewById,
    updatePerformanceReview,
    softDeletePerformanceReview
} from '../controllers/employeePerformance.controller.js'
import { authN,isAdmin } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';


const router=express.Router();

router.get('/myPerformance',authN,getMyPerformanceReviews);
router.get("/teamPerformance",authN,checkPermission(Permissions.VIEW_TEAM_PERFORMANCE),getTeamPerformanceReviews);
router.get("/performanceById/:id",authN,getPerformanceReviewById);
router.get("/getAllPerformance",authN,checkPermission(Permissions.VIEW_ALL_PERFORMANCE_DATA),getAllPerformanceReviews)
router.put("/updatePerformance/:id",authN,updatePerformanceReview);
router.delete("/deleteReview/:id",authN,isAdmin,softDeletePerformanceReview);


export default router;