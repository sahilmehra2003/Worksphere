import express from 'express';
import {
    createTeam,
    updateTeam,
    getAllTeams,
    getTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember
} from '../controllers/teamController.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';
import { authN } from '../middlewares/auth.js';
const router = express.Router();


router.post('/teams', authN, checkPermission(Permissions.CREATE_TEAM), createTeam);
router.get('/teams', authN, checkPermission(Permissions.VIEW_TEAM), getAllTeams);
router.get('/teams/:id', authN, checkPermission(Permissions.VIEW_TEAM), getTeam);
router.put('/teams/:id', authN, checkPermission(Permissions.UPDATE_TEAM), updateTeam);
router.delete('/teams/:id', authN, checkPermission(Permissions.DELETE_TEAM), deleteTeam);


router.post('/teams/:id/members', authN, checkPermission(Permissions.UPDATE_TEAM), addTeamMember);
router.delete('/teams/:id/members', authN, checkPermission(Permissions.UPDATE_TEAM), removeTeamMember);

export default router;