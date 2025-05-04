// controllers/attendanceController.js

import TimeLog from '../models/timeLog.model.js';



export const clockIn = async (req, res) => {
    try {
        const employeeId = req.user._id; 

        // 1. Check if already clocked in
        const existingOpenLog = await TimeLog.findOne({
            employee: employeeId,
            status: 'ClockedIn'
        });

        if (existingOpenLog) {
            return res.status(400).json({
                success: false,
                message: `You are already clocked in since ${existingOpenLog.clockInTime.toLocaleString()}. Please clock out first.`
            });
        }

        // 2. Create new clock-in record
        const clockInTime = new Date();
        const newLogData = {
            employee: employeeId,
            clockInTime: clockInTime,
            status: 'ClockedIn', // Schema default, but explicit here
            ipAddressIn: req.ip // Capture IP address from request
            // workDate will be set by pre-save hook based on clockInTime
        };

        const newLog = await TimeLog.create(newLogData);

        res.status(201).json({
            success: true,
            message: 'Successfully clocked in.',
            data: newLog
        });

    } catch (error) {
        console.error("Error during clock-in:", error);
        res.status(500).json({ success: false, message: 'Server error during clock-in.', error: error.message });
    }
};


export const clockOut = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const { notes } = req.body; // Optional notes on clock-out

        // 1. Find the most recent open clock-in record for this employee
        const logToClose = await TimeLog.findOne({
            employee: employeeId,
            status: 'ClockedIn'
        }).sort({ clockInTime: -1 }); // Get the latest one if multiple somehow exist

        if (!logToClose) {
            return res.status(400).json({
                success: false,
                message: "Cannot clock out: You are not currently clocked in."
            });
        }

        // 2. Calculate duration and update record
        const clockOutTime = new Date();
        const durationMillis = clockOutTime.getTime() - logToClose.clockInTime.getTime();
        // Ensure duration is non-negative (shouldn't happen normally)
        const durationMinutes = Math.max(0, Math.round(durationMillis / (1000 * 60)));

        // Update the found log entry
        logToClose.clockOutTime = clockOutTime;
        logToClose.durationMinutes = durationMinutes;
        logToClose.status = 'ClockedOut';
        logToClose.ipAddressOut = req.ip; // Capture clock-out IP
        if (notes) {
            logToClose.notes = notes;
        }

        const updatedLog = await logToClose.save(); // Use save to trigger any potential hooks

        res.status(200).json({
            success: true,
            message: 'Successfully clocked out.',
            data: updatedLog
        });

    } catch (error) {
        console.error("Error during clock-out:", error);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error during clock-out.', error: error.message });
    }
};


export const getCurrentStatus = async (req, res) => {
    try {
        const employeeId = req.user._id;

        // Find the latest 'ClockedIn' entry for the user
        const currentClockIn = await TimeLog.findOne({
            employee: employeeId,
            status: 'ClockedIn'
        }).sort({ clockInTime: -1 }).lean(); // Get the most recent active clock-in

        if (currentClockIn) {
            // User is currently clocked in
            res.status(200).json({
                success: true,
                status: 'ClockedIn',
                clockInTime: currentClockIn.clockInTime,
                logId: currentClockIn._id // ID of the current open log
            });
        } else {
            // User is not clocked in, find the last clock-out time for context (optional)
            const lastLog = await TimeLog.findOne({ employee: employeeId })
                                      .sort({ createdAt: -1 }) // Find the absolute latest record
                                      .lean();
            res.status(200).json({
                success: true,
                status: 'ClockedOut',
                lastClockOutTime: lastLog?.clockOutTime || null, // Provide last clock-out time if available
                lastLogId: lastLog?._id || null
            });
        }

    } catch (error) {
        console.error("Error fetching current attendance status:", error);
        res.status(500).json({ success: false, message: 'Server error fetching status.', error: error.message });
    }
};


export const getAttendanceHistory = async (req, res) => {
    try {
        const employeeId = req.user._id;

        // --- Filtering ---
        const query = { employee: employeeId }; // Base query for the user
        // Date range filtering (example: using workDate)
        if (req.query.startDate) {
            const start = new Date(req.query.startDate);
             if (!isNaN(start.getTime())) {
                 // Ensure we compare against the start of the day UTC
                 query.workDate = { ...query.workDate, $gte: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())) };
             }
        }
         if (req.query.endDate) {
            const end = new Date(req.query.endDate);
             if (!isNaN(end.getTime())) {
                 // Ensure we compare against the end of the day UTC
                 const endOfDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999));
                 query.workDate = { ...query.workDate, $lte: endOfDay };
             }
        }

        // --- Pagination ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; // Default 15 records per page
        const skip = (page - 1) * limit;

        // --- Sorting --- (most recent first)
        const sort = { workDate: -1, clockInTime: -1 };

        // --- Database Query ---
        const logs = await TimeLog.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for read-only list

        // Get total count for pagination
        const totalLogs = await TimeLog.countDocuments(query);

        res.status(200).json({
            success: true,
            count: logs.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalLogs / limit),
                totalRecords: totalLogs
            },
            data: logs
        });

    } catch (error) {
        console.error("Error fetching attendance history:", error);
        res.status(500).json({ success: false, message: 'Server error fetching history.', error: error.message });
    }
};