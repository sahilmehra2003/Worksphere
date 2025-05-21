import jwt from 'jsonwebtoken';

import Employee from '../models/employeeSchema.js';

export const authN = async (req, res, next) => {
    try {
     
        const token = req.header('Authorization')?.replace('Bearer ', '') ||
                      req.cookies.token ||
                      req.body.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing!"
            });
        }

        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const employeeId = decoded.id;
            if (!employeeId) {
                console.error("AuthN Error: Token payload is missing employee ID ('id').");
                return res.status(401).json({ success: false, message: "Invalid token payload (missing ID)." });
            }
            const employee = await Employee.findById(employeeId)
                .select('+_id +name +email +role +country +manager +employmentStatus +isVerified'); // Select needed fields

            if (!employee) {
                console.error(`AuthN Error: Employee with ID ${employeeId} not found in database.`);
                return res.status(401).json({ success: false, message: "Authentication failed: User not found." });
            }

            if (employee.employmentStatus !== 'working' && employee.employmentStatus !== 'on_leave') {
                console.warn(`AuthN: Denying access for employee ${employeeId} with status ${employee.employmentStatus}`);
                return res.status(403).json({ success: false, message: "Your account is not currently active." });
            }

            if (!employee.isVerified) {
                console.warn(`AuthN: Denying access for unverified employee ${employeeId}`);
                return res.status(403).json({
                    success: false,
                    message: "Access denied: Please verify your email address first."
                });
            }
 
            req.user = employee;

            console.log(`AuthN: Authenticated Employee - ID: ${req.user._id}, Role: ${req.user.role}`);
            next();

        } catch (error) {
            console.error("AuthN Error: Invalid token.", error.message);
            let message = "Invalid or expired token.";
            if (error.name === 'TokenExpiredError') {
                message = "Session expired, please log in again.";
            } else if (error.name === 'JsonWebTokenError') {
                 message = "Invalid authentication token.";
            }
            return res.status(401).json({
                success: false,
                message: message
            });
        }
    } catch (error) {
        console.error("AuthN Middleware Unexpected Error:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication failed due to server error."
        });
    }
};

export const isAdmin = (req, res, next) => {

    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied: Admin role required." });
    }
};

export const isAdminOrEmployee = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Employee')) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied for this role." });
    }
};

