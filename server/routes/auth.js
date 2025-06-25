import express from 'express'
const router = express.Router()

import { signup, login, sendOTP, verifyOtp, forgotPassword, resetPassword, googleAuthenticationCallback, getCurrentUser, logout } from '../controllers/authController.js'
import { authN, isAdmin, isAdminOrEmployee } from '../middlewares/auth.js';
import passport from 'passport';
import Employee from '../models/employeeSchema.js';

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: false
    }),
    googleAuthenticationCallback
);

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', authN, getCurrentUser);
router.post('/logout', authN, logout);

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