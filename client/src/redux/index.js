import { combineReducers } from '@reduxjs/toolkit'; 
import themeReducer from  './Slices/themeSlice';
import authReducer from './Slices/authSlice';        
import employeeReducer from './Slices/employeeSlice';   
import departmentReducer from './Slices/departmentSlice';
import leaveReducer from './Slices/leaveSlice';
import taskReducer from './Slices/taskSlice';
import transactionReducer from './Slices/transactionSlice';
import attendanceReducer from './Slices/attendanceSlice';
import clientReducer from './Slices/clientSlice'
import calenderReducer from './Slices/calenderSlice'
import projectReducer from './Slices/projectSlice'
import dashboardReducer from './Slices/dashboardSlice'
import announcementReducer from './Slices/announcementSlice'
import timesheetReducer from './Slices/timeSheetSlice'
import reviewCycleReducer from './Slices/reviewCycleSlice'

const rootReducer = combineReducers({
    theme: themeReducer,
    auth: authReducer,
    employee: employeeReducer,
    department: departmentReducer,
    leave: leaveReducer,
    task: taskReducer,
    transaction: transactionReducer,
    attendance: attendanceReducer,
    client: clientReducer,
    calendar: calenderReducer,
    project: projectReducer,
    dashboard: dashboardReducer,
    announcement: announcementReducer,
    timesheet: timesheetReducer,
    reviewCycle:reviewCycleReducer
    // ... add other reducers here
});

export default rootReducer;
