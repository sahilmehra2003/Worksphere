import Attendance from '../models/attendance.model.js';
import Employee from '../models/employeeSchema.js';
import mongoose from 'mongoose';


export const markCheckIn = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        });

        if (existingAttendance) {
            return res.status(400).json({ success: false, error: 'You have already checked in today.' });
        }

        const now = new Date();
        const checkInHour = now.getHours();
        const checkInMinute = now.getMinutes();
        const currentTimeInMinutes = checkInHour * 60 + checkInMinute;

        const earliestCheckInTime = 9 * 60 + 30;  
        const latestCheckInTime = 11 * 60 + 30; 

        if (currentTimeInMinutes < earliestCheckInTime) {
            return res.status(400).json({ success: false, error: 'Check-in is only allowed after 9:30 AM.' });
        }

        let isHalfDay = false;
        if (currentTimeInMinutes > latestCheckInTime) {
            isHalfDay = true;
        }

        const newAttendance = new Attendance({
            employee: employeeId,
            date: today,
            checkInTime: now,
            isHalfDay: isHalfDay,
            status: 'Present',
            managerApproval: {
                manager: req.user.manager
            }
        });

        await newAttendance.save();

        return res.status(201).json({
            success: true,
            message: `Checked in successfully.${isHalfDay ? ' Note: Your check-in was marked as a half-day due to late arrival.' : ''}`,
            data: newAttendance
        });

    } catch (error) {
        console.error("Error during check-in:", error);
        return res.status(500).json({ success: false, error: 'Server error during check-in.' });
    }
};


export const markCheckOut = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceRecord = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        });

        if (!attendanceRecord) {
            return res.status(404).json({ success: false, error: "You have not checked in yet today." });
        }

        if (attendanceRecord.checkOutTime) {
            return res.status(400).json({ success: false, error: "You have already checked out today." });
        }

        const now = new Date();
        attendanceRecord.checkOutTime = now;

        const diffInMs = now - attendanceRecord.checkInTime;
        const totalHours = diffInMs / (1000 * 60 * 60);
        attendanceRecord.totalHours = parseFloat(totalHours.toFixed(2));

        const requiredHours = attendanceRecord.isHalfDay ? 5 : 9;
        if (attendanceRecord.totalHours < requiredHours) {
            attendanceRecord.status = 'Shortfall';
            attendanceRecord.managerApproval.status = 'Pending';
        } else {
            attendanceRecord.finalOutcome = attendanceRecord.isHalfDay ? 'Half Day' : 'Full Day';
            attendanceRecord.status = 'Present'; // Mark as present if hours are met
        }

        await attendanceRecord.save();

        return res.status(200).json({
            success: true,
            message: `Checked out successfully. You worked ${attendanceRecord.totalHours} hours today.`,
            data: attendanceRecord
        });

    } catch (error) {
        console.error("Error during check-out:", error);
        return res.status(500).json({ success: false, error: 'Server error during check-out.' });
    }
};



export const getAttendanceForEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { startDate, endDate } = req.query;

        const query = { employee: employeeId, isDelete: { $ne: true } };
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const records = await Attendance.find(query).sort({ date: -1 });

        return res.status(200).json({
            success: true,
            data: records
        });

    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return res.status(500).json({ success: false, error: 'Server error while fetching records.' });
    }
};

export const getCurrentAttendanceStatus = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceRecord = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today },
            isDelete: { $ne: true }
        });

        return res.status(200).json({
            success: true,
            data: attendanceRecord || null
        });

    } catch (error) {
        console.error("Error fetching current attendance status:", error);
        return res.status(500).json({ success: false, error: 'Server error while fetching current attendance status.' });
    }
};


export const getPendingApprovals = async (req, res) => {
    try {
        const managerId = req.user._id;

        const records = await Attendance.find({
            'managerApproval.manager': managerId,
            'managerApproval.status': 'Pending',
            status: 'Shortfall'
        }).populate('employee', 'name employeeId');

        return res.status(200).json({
            success: true,
            data: records
        });

    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        return res.status(500).json({ success: false, error: 'Server error while fetching pending approvals.' });
    }
};



export const approveOrRejectShortfall = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { status, comment } = req.body; // status should be 'Approved' or 'Rejected'
        const approverId = req.user._id;

        const record = await Attendance.findById(attendanceId);
        if (!record) {
            return res.status(404).json({ success: false, error: "Attendance record not found." });
        }

        record.managerApproval.status = status;
        record.managerApproval.comment = comment;
        record.managerApproval.approvedAt = new Date();

        if (status === 'Approved') {
            record.status = 'Present'; 
            record.finalOutcome = record.isHalfDay ? 'Half Day' : 'Full Day'; 
        } else { 
            record.status = 'Disputed'; 
            record.finalOutcome = 'Unpaid Leave';
        }

        await record.save();

        return res.status(200).json({
            success: true,
            message: `Attendance record has been ${status.toLowerCase()}.`,
            data: record
        });

    } catch (error) {
        console.error("Error approving/rejecting shortfall:", error);
        return res.status(500).json({ success: false, error: "Server error while processing approval." });
    }
};



export const flagIssueToHR = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { notes } = req.body;

        const record = await Attendance.findOneAndUpdate(
            { _id: attendanceId, employee: req.user._id, 'managerApproval.status': 'Rejected' },
            {
                status: 'Escalated to HR',
                'hrApproval.status': 'Pending',
                notes: `Dispute from employee: ${notes}` // Append to any existing notes
            },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ success: false, error: "Could not find a rejected attendance record to flag." });
        }

        // Here you would typically trigger a notification to the HR department

        return res.status(200).json({
            success: true,
            message: "Issue has been flagged for HR review.",
            data: record
        });

    } catch (error) {
        console.error("Error flagging issue to HR:", error);
        return res.status(500).json({ success: false, error: "Server error while flagging issue." });
    }
};


export const updateAttendanceByAdmin = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const updateData = req.body;

        const updatedRecord = await Attendance.findByIdAndUpdate(
            attendanceId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ success: false, error: "Attendance record not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Attendance record updated successfully.",
            data: updatedRecord
        });

    } catch (error) {
        console.error("Error updating attendance record:", error);
        return res.status(500).json({ success: false, error: "Server error while updating record." });
    }
};

export const requestHalfDay = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const { date, notes } = req.body;

        // Validate required fields
        if (!date) {
            return res.status(400).json({
                success: false,
                error: "Date is required for half-day requests."
            });
        }

        const requestDate = new Date(date);
        requestDate.setHours(0, 0, 0, 0);

        // Prevent creating a half-day request if a record for that day already exists
        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: requestDate }
        });

        if (existingAttendance) {
            return res.status(400).json({ success: false, error: 'An attendance record for this day already exists. Please use the "Request Correction" feature instead.' });
        }

        const newHalfDayRequest = new Attendance({
            employee: employeeId,
            date: requestDate,
            isHalfDay: true,
            status: 'Pending Approval', // Goes straight to manager
            notes,
            managerApproval: {
                manager: req.user.manager,
                status: 'Pending'
            }
        });

        await newHalfDayRequest.save();

        return res.status(201).json({
            success: true,
            message: 'Half-day request submitted successfully for manager approval.',
            data: newHalfDayRequest
        });

    } catch (error) {
        console.error("Error requesting half-day:", error);
        return res.status(500).json({ success: false, error: 'Server error while requesting half-day.' });
    }
};

export const requestCorrection = async (req, res) => {
    try {
        const { attendaceId } = req.params;
        const { type, reason, checkInTime, checkOutTime } = req.body;
        const employeeId = req.user._id;

        // Validate required fields
        if (!type || !reason) {
            return res.status(400).json({
                success: false,
                error: "Type and reason are required for correction requests."
            });
        }

        const record = await Attendance.findOne({ _id: attendaceId, employee: employeeId });
        console.log("record: ", record)
        if (!record) {
            return res.status(404).json({ success: false, error: "Attendance record not found or you do not have permission to edit it." });
        }

        // Populate the correction request sub-document
        record.correctionRequest = {
            type,
            requestedData: {
                checkInTime: checkInTime ? new Date(checkInTime) : record.checkInTime,
                checkOutTime: checkOutTime ? new Date(checkOutTime) : record.checkOutTime,
            },
            reason,
            status: 'Pending'
        };

        // Update the main status to indicate it needs attention
        record.status = 'Pending Approval';
        record.managerApproval.status = 'Pending';

        await record.save();

        return res.status(200).json({
            success: true,
            message: 'Correction request submitted successfully.',
            data: record
        });

    } catch (error) {
        console.error("Error requesting correction:", error);
        return res.status(500).json({ success: false, error: 'Server error while requesting correction.' });
    }
};
