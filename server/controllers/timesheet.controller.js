import TimeLog from '../models/timesheet.model.js';
import Attendance from '../models/attendance.model.js';
import Employee from '../models/employeeSchema.js';
import { getStartOfWeek } from '../utility/getStartOfWeek.utility.js';
import mongoose from 'mongoose';


export const createTimeLog = async (req, res) => {
    try {
        const { projectId, taskId, date, hours, notes } = req.body;
        const employeeId = req.user._id;

        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        // 1. --- Validate against Attendance ---
        const attendanceRecord = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: logDate, $lt: new Date(logDate.getTime() + 24 * 60 * 60 * 1000) }
        });

        if (!attendanceRecord || !['Present', 'Shortfall', 'Pending Approval'].includes(attendanceRecord.status)) {
            return res.status(400).json({ success: false, error: "You can only log time for days you were marked present." });
        }

        // 2. --- Validate Daily Hour Limit (9 hours) ---
        const existingLogs = await TimeLog.find({ employee: employeeId, date: logDate });
        const hoursAlreadyLogged = existingLogs.reduce((sum, log) => sum + log.hours, 0);

        if (hoursAlreadyLogged + hours > 9) {
            return res.status(400).json({ success: false, error: `You cannot log more than 9 hours per day. You have already logged ${hoursAlreadyLogged} hours.` });
        }

        // 3. --- Create the New Time Log ---
        const weekStartDate = getStartOfWeek(logDate);

        const newTimeLog = new TimeLog({
            employee: employeeId,
            attendance: attendanceRecord._id,
            project: projectId,
            task: taskId,
            date: logDate,
            weekStartDate,
            hours,
            notes,
            approval: {
                manager: req.user.manager, // Get manager from user object
            }
        });

        await newTimeLog.save();

        return res.status(201).json({
            success: true,
            message: "Time log created successfully.",
            data: newTimeLog
        });

    } catch (error) {
        console.error("Error creating time log:", error);
        return res.status(500).json({ success: false, error: "Server error while creating time log." });
    }
};


export const getWeeklyTimeLogs = async (req, res) => {
    try {
        const { weekStartDate } = req.query;
        const employeeId = req.user._id;

        if (!weekStartDate) {
            return res.status(400).json({ success: false, error: "weekStartDate query parameter is required." });
        }

        const logs = await TimeLog.find({
            employee: employeeId,
            weekStartDate: new Date(weekStartDate)
        }).populate('project', 'name').populate('task', 'name');

        return res.status(200).json({
            success: true,
            data: logs
        });

    } catch (error) {
        console.error("Error fetching weekly time logs:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching time logs." });
    }
};


export const submitWeeklyTimesheet = async (req, res) => {
    try {
        const { weekStartDate } = req.body;
        const employeeId = req.user._id;

        if (!weekStartDate) {
            return res.status(400).json({ success: false, error: "weekStartDate is required." });
        }

        const startOfWeek = new Date(weekStartDate);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const employee = await Employee.findById(employeeId).select('country');
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found." });
        }

        // --- 1. Fetch all necessary data in parallel ---
        const [attendanceRecords, leaveRecords, holidays, timeLogsForWeek] = await Promise.all([
            Attendance.find({ employee: employeeId, date: { $gte: startOfWeek, $lte: endOfWeek } }),
            LeaveRequest.find({ employee: employeeId, status: 'Approved', startDate: { $lte: endOfWeek }, endDate: { $gte: startOfWeek } }),
            CountryCalendar.findOne({ country: employee.country, year: startOfWeek.getFullYear() }),
            TimeLog.find({ employee: employeeId, weekStartDate: startOfWeek })
        ]);

        const holidayDates = holidays ? holidays.holidays.map(h => new Date(h.date).toDateString()) : [];
        const leaveDates = [];
        leaveRecords.forEach(leave => {
            for (let d = new Date(leave.startDate); d <= leave.endDate; d.setDate(d.getDate() + 1)) {
                if (d >= startOfWeek && d <= endOfWeek) {
                    leaveDates.push(d.toDateString());
                }
            }
        });

        // --- 2. Calculate Total Required Hours for the Week ---
        let totalRequiredHours = 0;
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(currentDay.getDate() + i);
            const currentDayString = currentDay.toDateString();

            // Skip weekends (Saturday and Sunday)
            if (currentDay.getDay() === 0 || currentDay.getDay() === 6) {
                continue;
            }

            // Check for holidays or approved leave
            if (holidayDates.includes(currentDayString) || leaveDates.includes(currentDayString)) {
                continue; // Required hours for this day is 0
            }

            const attendance = attendanceRecords.find(a => new Date(a.date).toDateString() === currentDayString);

            if (attendance && ['Present', 'Shortfall', 'Pending Approval'].includes(attendance.status)) {
                totalRequiredHours += attendance.isHalfDay ? 5 : 9;
            } else if (!attendance) {
                // If there's no attendance record for a workday, it's still considered a 9-hour day
                totalRequiredHours += 9;
            }
        }

        // --- 3. Calculate Total Logged Hours for the Week ---
        const totalLoggedHours = timeLogsForWeek.reduce((sum, log) => sum + log.hours, 0);

        // --- 4. Compare and Validate ---
        if (totalLoggedHours < totalRequiredHours) {
            return res.status(400).json({
                success: false,
                error: `Timesheet submission failed. You have only logged ${totalLoggedHours} out of the required ${totalRequiredHours} hours for this week.`
            });
        }

        // --- 5. If valid, submit the timesheet ---
        await TimeLog.updateMany(
            { employee: employeeId, weekStartDate: startOfWeek, 'approval.status': 'Pending' },
            { $set: { 'approval.status': 'Submitted' } }
        );

        return res.status(200).json({
            success: true,
            message: "Timesheet for the week has been submitted for approval."
        });

    } catch (error) {
        console.error("Error submitting weekly timesheet:", error);
        return res.status(500).json({ success: false, error: "Server error while submitting timesheet." });
    }
};




export const approveOrRejectTimeLog = async (req, res) => {
    try {
        const { logId } = req.params;
        const { status, rejectionReason } = req.body; // 'Approved' or 'Rejected'
        const managerId = req.user._id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status provided." });
        }

        const log = await TimeLog.findById(logId);

        if (!log) {
            return res.status(404).json({ success: false, error: "Time log not found." });
        }


        log.approval.status = status;
        log.approval.rejectionReason = status === 'Rejected' ? rejectionReason : '';
        log.approval.approvedAt = new Date();

        await log.save();

        return res.status(200).json({
            success: true,
            message: `Time log has been ${status.toLowerCase()}.`,
            data: log
        });

    } catch (error) {
        console.error("Error approving/rejecting time log:", error);
        return res.status(500).json({ success: false, error: "Server error during approval." });
    }
};


export const getPendingTimesheetApprovals = async (req, res) => {
    try {
        const managerId = req.user._id;

        const pendingLogs = await TimeLog.find({
            'approval.manager': managerId,
            'approval.status': 'Submitted' // Or 'Pending' depending on your workflow
        }).populate('employee', 'name').populate('project', 'name');

        return res.status(200).json({
            success: true,
            data: pendingLogs
        });

    } catch (error) {
        console.error("Error fetching pending timesheets:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching approvals." });
    }
};


