import express from 'express';
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectTeam,
    removeProjectTeam,
    addProjectClient,
    removeProjectClient
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.post('/projects/create', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Add/Remove team to/from project
router.put('/projects/:id/add-team', addProjectTeam);
router.put('/projects/:id/remove-team', removeProjectTeam);

// Add/Remove client to/from project
router.put('/projects/:id/add-client', addProjectClient);
router.put('/projects/:id/remove-client', removeProjectClient);

export default router;