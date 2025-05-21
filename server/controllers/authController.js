import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import otpGenerator from 'otp-generator'
import crypto from 'crypto';
// models
import OTP from '../models/otp.model.js';
import Employee from '../models/employeeSchema.js';
import LeaveBalance from '../models/leaveBalance.model.js';
// utility
import { sendMail } from '../utility/sendEmail.util.js';
import { otpEmailTemplate } from '../utility/_email_templates/verificationEmail.template.js';
import { welcomeEmailTemplate } from '../utility/_email_templates/welcomeEmail.template.js';
import { resetPasswordTemplate } from '../utility/_email_templates/passwordResetTemplate.template.js';

dotenv.config();

const ENCRYPTION_KEY = process.env.ACCESS_TOKEN_ENCRYPTION_KEY || 'default_secret_key_32bytes!'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16


export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        // 1. Check if an Employee exists with this email
        const employee = await Employee.findOne({ email });

        if (!employee || employee.isVerified) {
            return res.status(200).json({
                success: true,
                message: "If your email is registered and not verified, an OTP will be sent.",
            });
        }

        // 2. Generate a 4-digit OTP 
        const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true,
        });

        // 3. Create OTP document (the pre-save hook in otpSchema will send the email)
        const newOtpDoc = await OTP.create({ email: email, otp: otp });


        if (newOtpDoc) {
            // console.log(`Generated OTP ${otp} for ${email}`);
            try {
                await sendMail(
                    email,
                    employee.name,
                    "Worksphere: Your Verification Code",
                    otp,
                    otpEmailTemplate
                );
                // console.log(`OTP email sent successfully to ${email}`);
            } catch (mailError) {
                console.error(`Failed to send OTP email to ${email} after saving OTP doc:`, mailError);
            }
        } else {
            throw new Error("Failed to save OTP document.");
        }
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email.",
        });
    } catch (error) {
        console.error("Server error in sendOTP:", error);
        return res.status(500).json({
            success: false,
            message: "Server error generating or sending OTP.",
            error: error.message,
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required to verify.",
            });
        }

        // 1. Find the most recent valid OTP for this email
        const latestOtpDoc = await OTP.findOne({ email: email, otp: otp }).sort({ createdAt: -1 });

        if (!latestOtpDoc) {
            // OTP not found or expired 
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP.",
            });
        }

        // 2. Find the corresponding Employee and mark as verified
        const employee = await Employee.findOne({ email });
        if (!employee) {
            console.error(`OTP verified for ${email}, but corresponding Employee not found.`);
            // Delete the OTP doc since it's now used/invalid
            await OTP.deleteOne({ _id: latestOtpDoc._id });
            return res.status(404).json({
                success: false,
                message: "User account not found.",
            });
        }

        if (employee.isVerified) {
            console.warn(`User ${email} is already verified but submitted a valid OTP.`);
            // Delete the OTP doc
            await OTP.deleteOne({ _id: latestOtpDoc._id });
            return res.status(200).json({
                success: true,
                message: "Email is already verified."
            });
        }

        // Mark employee as verified
        employee.isVerified = true;
        await employee.save();

        // 3. Delete the used OTP document 
        await OTP.deleteOne({ _id: latestOtpDoc._id });

        console.log(`Email verified successfully for ${email}`);

        try {
            await sendMail(
                employee.email,
                employee.name,
                "Welcome to Worksphere!",
                employee.name,
                welcomeEmailTemplate
            );
            console.log(`Welcome email sent successfully to ${employee.email}`);
        } catch (mailError) {
            console.error(`Failed to send welcome email to ${employee.email} after verification:`, mailError);
        }

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
        });

    } catch (error) {
        console.error("Server error in verifyOtp:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during OTP verification.",
            error: error.message,
        });
    }
};

export const signup = async (req, res) => {
    try {
        const {
            name, email, password, phoneNumber, city, state, country, position,
            role, department, manager, client, projectTeam, currentProjects,
            dateOfBirth, emergencyContact
        } = req.body;


        if (!name || !email || !password || !phoneNumber || !city || !state || !country || !position) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: name, email, password, phoneNumber, city, state, country, position."
            });
        }
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ success: false, message: `Email is already registered.` });
        }


        const employeeData = {
            name, email, password, phoneNumber, city, state, country, position,
            role: role || 'Employee',
            ...(department && { department }),
            ...(manager && { manager }),
            ...(client && { client }),
            ...(projectTeam && { projectTeam }),
            ...(currentProjects && { currentProjects }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(emergencyContact && { emergencyContact }),
        };
        const newEmployee = await Employee.create(employeeData);
        let initialBalance = null;
        let balanceCreationError = null;
        try {
            initialBalance = await LeaveBalance.create({ employee: newEmployee._id });
            console.log(`Created initial leave balance for employee ${newEmployee._id}`);
        } catch (balanceError) {
            balanceCreationError = balanceError.message;
            console.error(`Failed to create initial leave balance for employee ${newEmployee._id}:`, balanceError);
        }
        newEmployee.password = undefined;
        const responsePayload = {
            success: true,
            message: `Employee registered successfully.${balanceCreationError ? ' However, failed to create initial leave balance: ' + balanceCreationError : ' Initial leave balance created.'}`,
            employee: newEmployee,
            leaveBalance: initialBalance
        };
        return res.status(201).json(responsePayload);

    } catch (error) {
        console.error("Signup Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        return res.status(500).json({
            success: false, message: 'Error registering employee.', error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password."
            });
        }

        const employee = await Employee.findOne({ email }).select('+password');
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        if (employee.employmentStatus !== 'working' && employee.employmentStatus !== 'on_leave') {
            return res.status(403).json({ success: false, message: "Your account is not currently active." });
        }

        const isMatch = await employee.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }
        if (!employee.isVerified) {
            return res.status(403).json({
                success: false,
                message: "You need to verify your email before login"
            });
        }

        const payload = {
            id: employee._id, // This 'id' is what authN middleware expects from decoded token
            email: employee.email,
            role: employee.role,
            name: employee.name,
            country: employee.country
        };

        // Generate tokens
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        const refreshTokenValue = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // Renamed for clarity

        // Store refresh token and expiry in DB
        employee.refreshToken = refreshTokenValue;
        employee.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await employee.save();

        employee.password = undefined; // Remove password from the employee object sent to client

        // Consistent Cookie Options
        const primaryCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // 'Lax' is a good default. Use 'None' for cross-domain IF 'secure' is also true.
            sameSite: process.env.NODE_ENV === 'production' ? (process.env.COOKIE_SAMESITE_NONE_SECURE ? 'None' : 'Lax') : 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day for access token cookie
        };

        const refreshTokenCookieOptions = {
            ...primaryCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token cookie
        };

        res
            .cookie('token', accessToken, primaryCookieOptions) // *** SET THE 'token' COOKIE with plain JWT ***
            .cookie('refreshToken', refreshTokenValue, refreshTokenCookieOptions) // Keep refresh token cookie if your refresh strategy uses it
            .status(200)
            .json({
                success: true,
                message: "User logged in Successfully",
                accessToken, // Still okay to send plain token in body for frontend state if needed
                // refreshToken, // Optionally send if frontend directly uses it (less common for web)
                user: { // Send necessary, non-sensitive user details
                    id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    role: employee.role,
                    isProfileComplete: employee.isProfileComplete,
                    isVerified: employee.isVerified
                }
            });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: 'Login failed due to server error.',
            error: error.message
        });
    }
};



export const googleAuthenticationCallback = async (req, res) => {
    try {
        if (!req.user) {
            console.error('Google OAuth Callback: req.user is not populated. Passport strategy might have failed or user denied access.');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_authentication_failed_user_not_set`);
        }

        let employeeDocument;

        if (req.user.fromGoogle === true && !req.user._id) {
            console.log('Google OAuth Callback: Handling new user profile from Google strategy:', req.user);
            const { googleId, email, name, isVerified } = req.user;

            const newEmployeeData = {
                googleId,
                email,
                name,
                isVerified,
                isProfileComplete: false,
                role: 'Employee',
                phoneNumber: '0000000000',
                city: 'Not Set',
                state: 'Not Set',
                country: 'XX',
                position: 'Employee',
                employmentStatus: 'working',
            };

            employeeDocument = await Employee.create(newEmployeeData);
            console.log('New Employee created in DB from Google Sign-In:', JSON.stringify(employeeDocument, null, 2));

            try {
                await LeaveBalance.create({ employee: employeeDocument._id });
                console.log(`Created initial leave balance for new Google employee ${employeeDocument._id}`);
            } catch (balanceError) {
                console.error(`Failed to create initial leave balance for new Google employee ${employeeDocument._id}:`, balanceError);
            }

            try {
                await sendMail(
                    employeeDocument.email,
                    employeeDocument.name,
                    "Welcome to Worksphere!",
                    employeeDocument.name,
                    welcomeEmailTemplate
                );
                console.log(`Welcome email sent to new Google employee ${employeeDocument.email}`);
            } catch (mailError) {
                console.error(`Failed to send welcome email to new Google employee ${employeeDocument.email}:`, mailError);
            }
        } else if (req.user._id) {
            employeeDocument = req.user;
            console.log('Google OAuth Callback: Handling existing employee:', JSON.stringify(employeeDocument, null, 2));
        } else {
            console.error('Google OAuth Callback: req.user is in an unexpected state.');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_unexpected_user_state`);
        }

        if (!employeeDocument || !employeeDocument._id) {
            console.error('Google OAuth Callback: Employee document or _id is still missing before JWT creation.');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_final_user_error`);
        }

        const jwtPayload = {
            id: employeeDocument._id.toString(),
            email: employeeDocument.email,
            role: employeeDocument.role,
            name: employeeDocument.name,
            country: employeeDocument.country,
            isVerified: employeeDocument.isVerified,
            isProfileComplete: employeeDocument.isProfileComplete,
        };
        console.log("Issuing JWT with payload:", jwtPayload);

        const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE || '1d',
        });

        const cookieOptions = {
            expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE_DAYS || '1') * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        };

        res.cookie('token', accessToken, cookieOptions);

        let redirectUrl = `${process.env.FRONTEND_URL}/app/dashboard`;
        if (employeeDocument.isProfileComplete === false) {
            redirectUrl = `${process.env.FRONTEND_URL}/app/complete-profile`;
            console.log(`Redirecting user ${employeeDocument.email} to complete profile.`);
        } else {
            console.log(`User ${employeeDocument.email} logged in via Google. Redirecting to dashboard.`);
        }

        res.redirect(redirectUrl);

    } catch (error) {
        console.error("Error in googleAuthenticationCallback controller:", error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            console.error("Google Sign-In: Email already exists traditionally. User should link accounts or login with password.");
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=email_already_exists_google`);
        }
        res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_processing_error`);
    }
};

export const getCurrentUser = (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.removeHeader('ETag');

    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    res.status(200).json({ success: true, user: req.user });
};



export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            console.warn("Forgot password attempt with missing email.");
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent."
            });
        }
        const employee = await Employee.findOne({ email: email });

        if (employee) {
            const plainToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
            const tokenExpiry = Date.now() + 15 * 60 * 1000;


            employee.passwordResetToken = hashedToken;
            employee.passwordResetTokenExpires = tokenExpiry;
            await employee.save();

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${plainToken}`;

            try {
                await sendMail(
                    employee.email,
                    employee.name,
                    `Worksphere - Password Reset Request`,
                    resetUrl,
                    resetPasswordTemplate
                );
                console.log(`Password reset email sent successfully to ${employee.email}`);
            } catch (mailError) {
                console.error(`Failed to send password reset email to ${employee.email}:`, mailError);

                employee.passwordResetToken = undefined;
                employee.passwordResetTokenExpires = undefined;

                await employee.save({ validateBeforeSave: false });
                return res.status(500).json({
                    success: false,
                    message: "Failed to send password reset email. Please try again later.",
                    error: mailError.message
                });
            }
        } else {
            console.log(`Forgot password attempt for non-existent email: ${email}`);
        }

        return res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent."
        });

    } catch (error) {
        console.error("Server error in forgot-password:", error);
        return res.status(500).json({
            success: false,
            message: "Server error processing forgot password request.",
            error: error.message
        });
    }
};

export const resetPassword = async (req, res) => {
    try {

        const { token } = req.params;

        const { password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "Reset token is missing." });
        }
        if (!password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Password and confirmation are required." });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match." });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest('hex');


        const employee = await Employee.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpires: { $gt: Date.now() } // Check if token is still valid (expiry > now)
        });

        if (!employee) {

            return res.status(400).json({
                success: false,
                message: "Password reset token is invalid or has expired."
            });
        }

        employee.password = password;

        employee.passwordResetToken = undefined;
        employee.passwordResetTokenExpires = undefined;

        await employee.save();

        console.log(`Password successfully reset for employee ${employee.email}`);
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully."
        });

    } catch (error) {
        console.error("Server error in resetting password:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error setting new password.', error: error.message });
        }
        return res.status(500).json({
            success: false,
            message: "Server error resetting password.",
            error: error.message
        });
    }
};