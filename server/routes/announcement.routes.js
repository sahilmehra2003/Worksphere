import express from 'express';
import {
    createAnnouncement,
    getAnnouncementByIdForManagement,
    updateAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    archiveAnnouncement,
    getActiveAnnouncementsForUser,
    getAllAnnouncementsForManagement
} from '../controllers/announcement.controller.js';
import { authN } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/permission.middleware.js';

const router = express.Router();

// Management routes (Admin, HR only)
router.get('/management', authN, checkRole(['Admin', 'HR', 'Manager']), getAllAnnouncementsForManagement);
router.get('/management/:id', authN, checkRole(['Admin', 'HR','Manager']), getAnnouncementByIdForManagement);
router.post('/', authN, checkRole(['Admin', 'HR']), createAnnouncement);
router.put('/:id', authN, checkRole(['Admin', 'HR']), updateAnnouncement);
router.delete('/:id', authN, checkRole(['Admin', 'HR']), deleteAnnouncement);
router.patch('/:id/publish', authN, checkRole(['Admin', 'HR']), publishAnnouncement);
router.patch('/:id/archive', authN, checkRole(['Admin', 'HR']), archiveAnnouncement);

// User routes (All authenticated users)
router.get('/active', authN, getActiveAnnouncementsForUser);

export default router;
