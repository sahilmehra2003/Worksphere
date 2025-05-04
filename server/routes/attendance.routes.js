import express from 'express'
import {
    clockIn,
    clockOut,
    getAttendanceHistory,
    getCurrentStatus
} from '../controllers/attendance.controller.js'

import { authN } from '../middlewares/auth.js'
const router=express.Router();

router.post(
    '/clock-in',
    authN, 
    clockIn
);

router.post(
    '/clock-out',
    authN, 
    clockOut
);

router.get(
    '/status',
    authN, 
    getCurrentStatus
);

router.get(
    '/history',
    authN, 
    getAttendanceHistory
);

export default router;