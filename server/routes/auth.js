import express from 'express'
const router = express.Router()

import { signup, login,sendOTP,verifyOtp,forgotPassword,resetPassword } from '../controllers/authController.js'
import { authN, isAdmin, isAdminOrEmployee } from '../middlewares/auth.js';


router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp',sendOTP);
router.post('/verify-otp',verifyOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword); 


// Protected route for both Admin and Employee
router.get("/dashboard", authN, isAdminOrEmployee, (req, res) => {
    res.json({
        success: true,
        message: `Welcome ${req.user.name} (${req.user.role}) to the dashboard`
    })
});

// Admin-only route 
router.get("/admin", authN, isAdmin, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to admin-only dashboard"
    })
});

export default router