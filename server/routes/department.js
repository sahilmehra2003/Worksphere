import express from "express";
import {createDepartment,getAllDepartments,updateDepartment,getDepartmentById,setDepartmentInactive} from "../controllers/departmentController.js"
import { authN, isAdmin } from "../middlewares/auth.js";
const router=express.Router();

router.get('/departments',getAllDepartments);
router.get('/department/:id', getDepartmentById);
router.post('/departments/create',createDepartment);
router.put('/department/update/:id',updateDepartment)
router.patch('/department/setInactive/:id',authN,isAdmin,setDepartmentInactive);


export default router;