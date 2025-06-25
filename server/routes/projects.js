import express from 'express';
import {
    createProject,
    getAllProjects,
    getProjectById,
    getMyProjects,
    updateProject,
    deleteProject,
    addProjectTeam,
    removeProjectTeam,
    addProjectClient,
    removeProjectClient
} from '../controllers/projectController.js';
import { authN } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { Permissions } from '../config/permission.config.js';

const router = express.Router();

router.get('/projects', authN, checkPermission(Permissions.VIEW_PROJECT), getAllProjects);
router.get('/projects/my', authN, checkPermission(Permissions.VIEW_PROJECT), getMyProjects);
router.get('/projects/:id', authN, checkPermission(Permissions.VIEW_PROJECT), getProjectById);
router.post('/projects/create', authN, checkPermission(Permissions.CREATE_PROJECT), createProject);
router.put('/projects/:id', authN, checkPermission(Permissions.UPDATE_PROJECT), updateProject);
router.delete('/projects/:id', authN, checkPermission(Permissions.DELETE_PROJECT), deleteProject);

// Add/Remove team to/from project
router.put('/projects/:id/add-team', authN, checkPermission(Permissions.UPDATE_PROJECT), addProjectTeam);
router.put('/projects/:id/remove-team', authN, checkPermission(Permissions.UPDATE_PROJECT), removeProjectTeam);

// Add/Remove client to/from project
router.put('/projects/:id/add-client', authN, checkPermission(Permissions.UPDATE_PROJECT), addProjectClient);
router.put('/projects/:id/remove-client', authN, checkPermission(Permissions.UPDATE_PROJECT), removeProjectClient);

export default router;