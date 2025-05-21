import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Employee from '../models/employeeSchema.js';
import dotenv from 'dotenv';
dotenv.config();
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Employee.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.GOOGLE_CALLBACK_URL}`,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let employee = await Employee.findOne({ googleId: profile.id });

        if (employee) {
            return done(null, employee);
        }

        // Check if user exists with the same email
        employee = await Employee.findOne({ email: profile.emails[0].value });

        if (employee) {
            // Update existing user with Google ID
            employee.googleId = profile.id;
            employee.isVerified = true; 
            await employee.save();
            return done(null, employee);
        }

        // Do NOT create the user here if required fields are missing
        // Instead, pass minimal info to the session for profile completion
        return done(null, {
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            isVerified: true,
            isProfileComplete: false,
            fromGoogle: true // flag for your logic
        });
    } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error, null);
    }
})); 