import express from "express"
const router = express.Router();
import { 
    getEmployee, 
    getAllEmployees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee,
    updatePassword 
} from "../controllers/employeeController.js";
import { authN, isAdmin, isAdminOrEmployee } from "../middlewares/auth.js";

// Public route (example)
router.get('/employees/public', getAllEmployees);

// Employee can view their own profile
router.get('/employee/:id', authN, isAdminOrEmployee, (req, res, next) => {
    // Allow if employee is viewing their own profile OR admin
    if (req.user.role === "Employee" && req.user.id !== req.params.id) {
        return res.status(403).json({
            success: false,
            message: "You can only view your own profile"
        });
    }
    next();
}, getEmployee);

// Employee can view all employees (but with limited info)
router.get('/employees', authN, isAdminOrEmployee, getAllEmployees);

// Only admin can create/update/delete employees
router.post('/employees/create', authN, isAdmin, createEmployee);
router.put('/employees/:id', authN, isAdmin, updateEmployee);
router.patch('/change-password', authN, updatePassword);
router.delete('/employees/delete/:id', authN, isAdmin, deleteEmployee);

export default router;