import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import session from 'express-session'
import cookieParser from 'cookie-parser'

import dbConnect from './config/database.js'
import './config/passport.js' 

import transactionsRoutes from './routes/transaction.js'
import projectRoutes from './routes/projects.js'
import departmentRoutes from './routes/department.js';
import teamRoutes from './routes/projectTeam.js'
import authRoutes from './routes/auth.js'
import calendarRoutes from './routes/calender.routes.js'
import leaveSystemRoutes from './routes/leave.route.js'
import employeeInfoRoutes from './routes/employee.js'
import managementRoutes from './routes/management.js'
import clientRoutes from './routes/client.js'
import reviewCycleRoues from './routes/reviewCycle.routes.js'
import employeePerformanceRoutes from './routes/employeePerformance.routes.js'
import taksRoutes from './routes/tasks.routes.js';
import timeSheetRoute from './routes/timeSheet.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import announcemetRoutes from './routes/announcement.routes.js';
import bonusSystemRoutes from './routes/bonus.routes.js';
import goalSystemRoutes from './routes/goal.routes.js';
import paymentRoutes from './routes/payment.js'

const app = express()

dbConnect()

dotenv.config()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))
app.use(express.urlencoded({
    extended: true
}))

app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'params',
        'X-Requested-With',
        'Accept',
        'Origin'
    ]
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send(`<h1>ADMIN PORTAL SYSTEM</h1>`)
})

app.use("/api/v1/payments", paymentRoutes); 
app.use("/api/v1/clientData", clientRoutes);
app.use("/api/v1/employeeInfo", employeeInfoRoutes)
app.use("/api/v1/management", managementRoutes);
app.use("/api/v1/transactions", transactionsRoutes);
app.use('/api/v1/projectData', projectRoutes);
app.use('/api/v1/departmentData', departmentRoutes);
app.use('/api/v1/teamRoutes', teamRoutes);
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/leaveSystem', leaveSystemRoutes);
app.use('/api/v1/reviewCycle', reviewCycleRoues);
app.use('/api/v1/employee-performance', employeePerformanceRoutes);
app.use('/api/v1/taskRoutes', taksRoutes);
app.use('/api/v1/timesheets', timeSheetRoute);
app.use('/api/v1/attendanceRoutes', attendanceRoutes);
app.use('/api/v1/dashboardRoutes', dashboardRoutes);
app.use('/api/v1/announcementRoutes', announcemetRoutes);
app.use('/api/v1/bonus', bonusSystemRoutes);
app.use('/api/v1/goals',goalSystemRoutes);

app.listen(PORT, () => {
    console.log(`Server started successfully at Port ${PORT}`)
})