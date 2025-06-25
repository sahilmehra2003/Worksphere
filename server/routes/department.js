import express from "express";
import { createDepartment, getAllDepartments, updateDepartment, getDepartmentById, setDepartmentInactive } from "../controllers/departmentController.js"
import { authN } from "../middlewares/auth.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { Permissions } from "../config/permission.config.js";
const router = express.Router();

router.get('/departments', authN, checkPermission(Permissions.VIEW_DEPARTMENT), getAllDepartments);
router.get('/department/:id', authN, checkPermission(Permissions.VIEW_DEPARTMENT), getDepartmentById);
router.post('/departments/create', authN, checkPermission(Permissions.CREATE_DEPARTMENT), createDepartment);
router.put('/department/update/:id', authN, checkPermission(Permissions.UPDATE_DEPARTMENT), updateDepartment);
router.patch('/department/setInactive/:id', authN, checkPermission(Permissions.DELETE_DEPARTMENT), setDepartmentInactive);


export default router;