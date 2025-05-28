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

const router = express.Router();

// Team CRUD operations
router.post('/teams', createTeam);
router.get('/teams', getAllTeams);
router.get('/teams/:id', getTeam);
router.put('/teams/:id', updateTeam);
router.delete('/teams/:id', deleteTeam);

// Team member operations
router.post('/teams/:id/members', addTeamMember);
router.delete('/teams/:id/members', removeTeamMember);

export default router;