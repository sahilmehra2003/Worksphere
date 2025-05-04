import express from 'express';
import { createProject, getAllProjects,getProjectById } from '../controllers/projectController.js';

const router = express.Router();


router.get('/projects', getAllProjects); 
router.get('/projects/:id', getProjectById); 
router.post('/projects/create',createProject);


export default router;