import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'


import dbConnect from './config/database.js'

// import routes
import transactionsRoutes from './routes/transaction.js'
import projectRoutes from './routes/projects.js'
import departmentRoutes from './routes/department.js';
import teamRoutes from './routes/projectTeam.js'
import authRoutes from './routes/auth.js'
import calenderRoutes  from './routes/calender.routes.js'
import leaveSystemRoutes from './routes/leave.route.js'
import employeeInfoRoutes from './routes/employee.js'
import managementRoutes from './routes/management.js'
import clientRoutes from './routes/client.js'
import reviewCycleRoues from './routes/reviewCycle.routes.js'
import employeePerformanceRoutes from './routes/employeePerformance.routes.js'
import taksRoutes from './routes/tasks.routes.js';
import timeSheetRoute from './routes/timeSheet.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';

const app=express()

// db connection
dbConnect()


// Configuration- middleware setup
dotenv.config()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"})) 
app.use(morgan("common"))
app.use(express.urlencoded({
    extended:true
}))

app.use(cors());



const PORT=process.env.PORT || 3000

// Default route
app.get('/',(req,res)=>{
    res.send(`<h1>ADMIN PORTAL SYSTEM</h1>`)
})
// Routes
app.use("/clientData",clientRoutes);
app.use("/employeeInfo",employeeInfoRoutes)
app.use("/management",managementRoutes);
app.use("/transactionsDetails",transactionsRoutes);
app.use('/projectData', projectRoutes);
app.use('/departmentData',departmentRoutes);
app.use('/teamData',teamRoutes);
app.use('/auth',authRoutes)
app.use('/calendar',calenderRoutes);
app.use('/leaveSystem',leaveSystemRoutes);
app.use('/reviewCycle',reviewCycleRoues);
app.use('/employeePerformance',employeePerformanceRoutes);
app.use('/taskRoutes',taksRoutes);
app.use('/timesheet',timeSheetRoute);
app.use('/attendanceRoutes',attendanceRoutes)




app.listen(PORT,()=>{
    console.log(`Server started successfully at Port ${PORT}` )
    
})
