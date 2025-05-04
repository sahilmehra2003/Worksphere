import express from 'express'
import {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksForUser,
  updateTask,
  deleteTask,
  reopenTask
} from '../controllers/task.controller.js'

import { authN } from '../middlewares/auth.js';
import { Permissions } from '../config/permission.config.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router=express.Router();

router.post('/createTask',authN,checkPermission(Permissions.CREATE_TASKS),createTask);
router.get('/myTask',authN,checkPermission(Permissions.VIEW_OWN_TASKS),getTasksForUser);
router.get('/allTasks',authN,checkPermission(Permissions.VIEW_ALL_TASKS),getAllTasks);
router.get('/getTaskById/:taskId',authN,checkPermission(Permissions.VIEW_OTHER_TASKS),getTaskById);
router.put('/updateTask/:taskId',authN,checkPermission(Permissions.UPDATE_TASKS),updateTask);
router.patch('/reopenTask/:taskId',authN,checkPermission(Permissions.REOPEN_TASKS),reopenTask);
router.delete('/deleteTask/:taskId',authN,checkPermission(Permissions.DELETE_TASKS),deleteTask);

export default router;