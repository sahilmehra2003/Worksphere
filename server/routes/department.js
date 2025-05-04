import express from "express";
import {createDepartment,getAllDepartments,updateDepartment,getDepartmentById,deleteDepartment} from "../controllers/departmentController.js"
const router=express.Router();

router.get('/departments',getAllDepartments);
router.get('/department/:id', getDepartmentById);
router.post('/departments/create',createDepartment);
router.put('/department/update/:id',updateDepartment)
router.delete('/department/delete/:id', deleteDepartment);
export default router;