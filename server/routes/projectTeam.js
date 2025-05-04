import express from 'express';
import { createTeam, updateTeam } from '../controllers/teamController.js'; 
const router=express.Router();

router.post("/teams/create",createTeam);
router.put("/teams/update",updateTeam)
export default router;