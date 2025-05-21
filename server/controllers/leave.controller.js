
import mongoose from 'mongoose';
import Employee from '../models/employeeSchema.js';
import Leave from '../models/leaveRequest.model.js'
import LeaveBalance from '../models/leaveBalance.model.js'
import CountryCalendar from '../models/calender.model.js'; // Adjust path (using the name from your previous code)
// Employee model might be needed for future permission checks or populating manager info
// import Employee from '../models/employee.model.js';

// --- Helper Function to Calculate Working Days ---
// Calculates days between start and end, excluding weekends/holidays for a given country
async function calculateWorkingDays(startDate, endDate, countryCode) {
    let count = 0;
    // Clone dates to avoid modifying originals
    const start = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
    const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        throw new Error("Invalid date range provided to calculateWorkingDays.");
    }

    let currentDate = new Date(start);

    while (currentDate <= end) {
        const isNonWorking = await CountryCalendar.isNonWorkingDay(currentDate, countryCode);
        if (!isNonWorking) {
            count++;
        }
        // Move to the next day in UTC
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Basic half-day logic could be added here if start/end times matter,
    // but current model assumes full days. Returns 0 if start/end are same non-working day.
    console.log(`Calculated working days between ${startDate.toISOString().split('T')[0]} and ${endDate.toISOString().split('T')[0]} for ${countryCode}: ${count}`);
    return count;
}


// --- Controller Functions ---


export const applyLeave = async (req, res, next) => {
    try {
        // Assuming authN middleware provides req.user
        if (!req.user?._id || !req.user?.country) {
            return res.status(401).json({ message: "User data incomplete. Cannot apply for leave." });
        }
        const employeeId = req.user._id;
        const employeeCountry = req.user.country; // Get country from logged-in user

        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: "Missing required fields: leaveType, startDate, endDate, reason." });
        }

        // --- Date Validation & Processing ---
        let startDt, endDt;
        try {
            startDt = new Date(startDate);
            endDt = new Date(endDate);
            if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) throw new Error();
            if (startDt > endDt) return res.status(400).json({ message: "Start date cannot be after end date." });
        } catch (e) {
            return res.status(400).json({ success:false,message: "Invalid date format. Use YYYY-MM-DD." });
        }

        // Policy: Disallow starting or ending on a non-working day
        const isStartNonWorking = await CountryCalendar.isNonWorkingDay(startDt, employeeCountry);
        const isEndNonWorking = await CountryCalendar.isNonWorkingDay(endDt, employeeCountry);
        if (isStartNonWorking || isEndNonWorking) {
            return res.status(400).json({ success: false, message: "Leave cannot start or end on a weekend or public holiday." });
        }

        // Calculate the number of *working* days for the leave request
        const numberOfDays = await calculateWorkingDays(startDt, endDt, employeeCountry);
        if (numberOfDays <= 0) {
             // This can happen if the range only includes non-working days
            return res.status(400).json({ success: false, message: "Selected leave duration does not contain any working days." });
        }
        // --- End Date Validation & Processing ---


        // --- Balance Check ---
        const balance = await LeaveBalance.findOne({ employee: employeeId });
        if (!balance) {
            return res.status(404).json({ success: false, message: "Leave balance record not found." });
        }

        let balanceField = '';
        let currentBalance = 0;
        // Map leaveType to the corresponding field in LeaveBalance schema
        switch (leaveType) {
            case 'Casual': balanceField = 'casualLeaves'; currentBalance = balance.casualLeaves.current; break;
            case 'Sick': balanceField = 'sickLeaves'; currentBalance = balance.sickLeaves.current; break;
            case 'Earned': balanceField = 'earnedLeaves'; currentBalance = balance.earnedLeaves.current; break;
            case 'Maternity': balanceField = 'maternityLeaves'; currentBalance = balance.maternityLeaves.current; break;
            case 'Paternity': balanceField = 'paternityLeaves'; currentBalance = balance.paternityLeaves.current; break;
            case 'Compensatory': balanceField = 'compensatoryLeaves'; currentBalance = balance.compensatoryLeaves.current; break;
            case 'Unpaid': break; // No balance check needed
            default: return res.status(400).json({ success: false, message: "Invalid leave type specified." });
        }

        // Perform balance check only for leave types that require it
        if (balanceField && currentBalance < numberOfDays) {
            return res.status(400).json({ success: false, message: `Insufficient ${leaveType} leave balance. Available: ${currentBalance}, Required: ${numberOfDays}` });
        }
        // --- End Balance Check ---


        // --- Create Leave Document ---
        const leave = new Leave({
            employee: employeeId,
            leaveType,
            startDate: startDt,
            endDate: endDt,
            numberOfDays, // Store calculated working days
            reason,
            status: 'Pending', // Initial status
        });

        const createdLeave = await leave.save();
        // --- End Create Leave Document ---

        // TODO: Notify manager logic here

        res.status(201).json({ success: true, message: "Leave application submitted successfully.", leave: createdLeave });

    } catch (error) {
        console.error("Error applying for leave:", error);
        // Pass to global error handler or send generic message
        res.status(500).json({ success: false, message: "Server error during leave application.", error: error.message });
        // next(error); // Alternative: use global error handler
    }
};


/**
 * @desc    Approve a pending leave request
 * @route   PUT /api/leaves/:leaveId/approve
 * @access  Private (Manager/HR/Admin - Requires Authorization)
 */
export const approveLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const approverId = req.user._id; // Assuming authN provides the approver's ID

        if (!mongoose.Types.ObjectId.isValid(leaveId)) {
            return res.status(400).json({ success: false, message: "Invalid leave ID format." });
        }

        const leave = await Leave.findById(leaveId);

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found." });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ success: false, message: `Leave request is already ${leave.status}. Cannot approve.` });
        }

        // --- Authorization Check (Deferred - Placeholder) ---
        // TODO: Verify if req.user (approver) is allowed to approve leave for leave.employee
        // E.g., check if req.user.role is HR/Admin OR if req.user._id is leave.employee's manager
        console.log(`User ${approverId} attempting to approve leave ${leaveId} for employee ${leave.employee}`);
        // --- End Authorization Check ---


        // --- Re-check Balance & Deduct ---
        const balance = await LeaveBalance.findOne({ employee: leave.employee });
        if (!balance) {
             console.error(`CRITICAL: Leave balance record not found for employee ${leave.employee} during approval.`);
            return res.status(500).json({ success: false, message: "Leave balance record not found for employee. Cannot approve." });
        }

        let balanceField = '';
        let currentBalance = 0;
        switch (leave.leaveType) {
            case 'Casual': balanceField = 'casualLeaves'; currentBalance = balance.casualLeaves.current; break;
            case 'Sick': balanceField = 'sickLeaves'; currentBalance = balance.sickLeaves.current; break;
            case 'Earned': balanceField = 'earnedLeaves'; currentBalance = balance.earnedLeaves.current; break;
            case 'Maternity': balanceField = 'maternityLeaves'; currentBalance = balance.maternityLeaves.current; break;
            case 'Paternity': balanceField = 'paternityLeaves'; currentBalance = balance.paternityLeaves.current; break;
            case 'Compensatory': balanceField = 'compensatoryLeaves'; currentBalance = balance.compensatoryLeaves.current; break;
            case 'Unpaid': break;
            default: return res.status(400).json({ success: false, message: "Invalid leave type found in request." });
        }

         if (balanceField && currentBalance < leave.numberOfDays) {
              // Balance might have changed since application, reject approval
             return res.status(400).json({
                 success: false,
                  message: `Cannot approve: Insufficient ${leave.leaveType} leave balance. Available: ${currentBalance}, Required: ${leave.numberOfDays}`
              });
         }

        // --- Update Leave and Balance ---
        // 1. Update Leave Status
        leave.status = 'Approved';
        leave.approvedBy = approverId;
        leave.approvedAt = new Date();
        const updatedLeave = await leave.save();

        // 2. Deduct balance if it's not 'Unpaid' leave
        if (balanceField) {
            const update = {};
            const newBalance = currentBalance - leave.numberOfDays;
            update[`${balanceField}.current`] = newBalance < 0 ? 0 : newBalance; // Ensure balance doesn't go below 0

            const balanceUpdateResult = await LeaveBalance.updateOne({ _id: balance._id }, { $set: update });
            if (balanceUpdateResult.modifiedCount === 1) {
                console.log(`Deduced ${leave.numberOfDays} days from ${balanceField} for employee ${leave.employee}. New balance: ${update[`${balanceField}.current`]}`);
            } else {
                 console.error(`Failed to update leave balance for employee ${leave.employee} after approving leave ${leaveId}`);
                 // Potentially roll back leave status or log critical error
            }
        }
        // --- End Update ---

        // TODO: Notify employee logic here

        res.status(200).json({ success: true, message: "Leave request approved successfully.", leave: updatedLeave });

    } catch (error) {
        console.error("Error approving leave:", error);
        res.status(500).json({ success: false, message: "Server error during leave approval.", error: error.message });
        // next(error);
    }
};



export const rejectLeave = async (req, res, next) => {
     try {
        const { leaveId } = req.params;
        const { rejectionReason } = req.body; // Get reason from request body
        const rejectorId = req.user._id; // Assuming authN middleware provides user ID

        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: "Rejection reason is required." });
        }

        if (!mongoose.Types.ObjectId.isValid(leaveId)) {
            return res.status(400).json({ success: false, message: "Invalid leave ID format." });
        }

        const leave = await Leave.findById(leaveId);

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found." });
        }

         if (leave.status !== 'Pending') {
             return res.status(400).json({ success: false, message: `Leave request is already ${leave.status}. Cannot reject.` });
         }

        // --- Authorization Check (Deferred - Placeholder) ---
        // TODO: Verify if req.user (rejector) is allowed to reject leave for leave.employee
        console.log(`User ${rejectorId} attempting to reject leave ${leaveId} for employee ${leave.employee}`);
        // --- End Authorization Check ---

        // --- Update Leave Status ---
        leave.status = 'Rejected';
        leave.rejectionReason = rejectionReason;
        // Optional: Store who rejected it
        // leave.rejectedBy = rejectorId;
        const updatedLeave = await leave.save();
        // --- End Update ---

        // TODO: Notify employee logic here

         res.status(200).json({ success: true, message: "Leave request rejected.", leave: updatedLeave });

    } catch (error) {
        console.error("Error rejecting leave:", error);
         res.status(500).json({ success: false, message: "Server error during leave rejection.", error: error.message });
        // next(error);
    }
};


/**
 * @desc    Get leave history (for self or others based on role)
 * @route   GET /api/leaves
 * @access  Private (Authenticated)
 */
export const getLeaveHistory = async (req, res, next) => {
    try {
        const loggedInUserId = req.user._id;
        const loggedInUserRole = req.user.role;

        let query = {};

        // --- Authorization / Filtering Logic (Simplified for now) ---
        // By default, users see their own leaves
        query.employee = loggedInUserId;

        // TODO: Implement actual role/permission based access later
        // Example: If HR or Admin, allow viewing all or filtering by employeeId query param
        // if (['HR', 'Admin'].includes(loggedInUserRole)) {
        //    if (req.query.employeeId) {
        //        query.employee = req.query.employeeId;
        //    } else {
        //        delete query.employee; // Allow viewing all if no specific employee requested by HR/Admin
        //    }
        // } else if (loggedInUserRole === 'Manager') {
        //     // Find employees managed by this user
        //     const subordinates = await Employee.find({ manager: loggedInUserId }, '_id').lean();
        //     const subordinateIds = subordinates.map(e => e._id);
        //     // Allow manager to see own leaves AND subordinates' leaves
        //     query.employee = { $in: [loggedInUserId, ...subordinateIds] };
        // }
        // --- End Authorization / Filtering Logic ---


        // Add optional filtering from query parameters
        if (req.query.status) {
            // Allow filtering by multiple statuses? e.g., status=Pending,Approved
            const statuses = req.query.status.split(',');
            query.status = { $in: statuses };
        }
         if (req.query.leaveType) {
            query.leaveType = req.query.leaveType;
         }
         if (req.query.startDate) {
             query.startDate = { $gte: new Date(req.query.startDate) }; // Find leaves starting on or after this date
         }
         if (req.query.endDate) {
              // Find leaves ending on or before this date (adjust if needed for range query)
              query.endDate = { $lte: new Date(req.query.endDate) };
         }
         // More robust date range query: find leaves that overlap with the query range
         // if (req.query.rangeStart && req.query.rangeEnd) {
         //    query.startDate = { $lte: new Date(req.query.rangeEnd) };
         //    query.endDate = { $gte: new Date(req.query.rangeStart) };
         // }


        // Pagination (example)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const leaves = await Leave.find(query)
            .populate('employee', 'name employeeId') // Populate basic employee info
            .populate('approvedBy', 'name') // Populate approver name if exists
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean if not modifying docs

        // Get total count for pagination info
        const totalLeaves = await Leave.countDocuments(query);

        res.status(200).json({
            success: true,
            message:'leave history fetched',
            count: leaves.length,
            total: totalLeaves,
            page,
            pages: Math.ceil(totalLeaves / limit),
            leaves
        });

    } catch (error) {
        console.error("Error fetching leave history:", error);
        res.status(500).json({ success: false, message: "Server error fetching leave history.", error: error.message });
        // next(error);
    }
};


/**
 * @desc    Get leave balance (for self or specific employee if authorized)
 * @route   GET /api/leaves/balance   OR   GET /api/leaves/balance/:employeeId
 * @access  Private (Authenticated)
 */
export const getLeaveBalance = async (req, res, next) => {
     try {
        let employeeIdToFetch = req.user._id; // Default to logged-in user

        // --- Authorization Check (Simplified for now) ---
        // Allow fetching specific employee's balance if requested via param
        // TODO: Add role/permission check here later to ensure only authorized users can view others' balances
        if (req.params.employeeId) {
            // Basic check: ensure param is valid ObjectId before proceeding
             if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
                 return res.status(400).json({ success: false, message: "Invalid employee ID format in URL." });
             }
             // TODO: Add check: Is req.user Admin/HR OR is req.user the manager of req.params.employeeId?
             // If not authorized: return res.status(403).json({ message: "Forbidden to access this balance." });
             employeeIdToFetch = req.params.employeeId;
        }
         // --- End Authorization Check ---

         const balance = await LeaveBalance.findOne({ employee: employeeIdToFetch })
             .populate('employee', 'name employeeId'); // Populate basic info

         if (!balance) {
             // If balance doesn't exist, maybe create it? Or just report not found.
             // For now, report not found. Creation could be part of employee onboarding.
             console.log(`Leave balance record not found for employee: ${employeeIdToFetch}`);
             return res.status(404).json({ success: false, message: "Leave balance record not found for this employee." });
         }

         // NOTE: We are NOT calling balance.performYearEndUpdate() here in a GET request.
         // That should be handled by a scheduled job or a dedicated admin action.

         res.status(200).json({ success: true, message: 'Leave balance is', balance });

     } catch (error) {
         console.error("Error fetching leave balance:", error);
         res.status(500).json({ success: false, message: "Server error fetching leave balance.", error: error.message });
         // next(error);
     }
};


// --- NEW: Cancel Leave Request Controller ---

/**
 * @desc    Cancel a leave request (by the employee who submitted it)
 * @route   PUT /api/leaves/:leaveId/cancel
 * @access  Private (Authenticated Employee who owns the request)
 */
export const cancelLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const employeeId = req.user._id; // ID of the employee cancelling the request

        if (!mongoose.Types.ObjectId.isValid(leaveId)) {
            return res.status(400).json({ success: false, message: "Invalid leave ID format." });
        }

        const leave = await Leave.findById(leaveId);

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found." });
        }

        // --- Authorization Check: Ensure the requester owns this leave ---
        if (leave.employee.toString() !== employeeId.toString()) {
            console.warn(`Forbidden: User ${employeeId} attempted to cancel leave ${leaveId} owned by ${leave.employee}`);
            return res.status(403).json({ success: false, message: "Forbidden: You can only cancel your own leave requests." });
        }
        // --- End Authorization Check ---

        // --- Status Check: Can only cancel Pending or Approved leaves ---
        if (!['Pending', 'Approved'].includes(leave.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel leave request with status '${leave.status}'.` });
        }
        // --- End Status Check ---


        const originalStatus = leave.status; // Store original status before changing

        // --- Update Leave Status ---
        leave.status = 'Cancelled';
        // Optionally add a cancellation reason or timestamp if needed in schema
        // leave.cancellationReason = "Cancelled by employee";
        // leave.cancelledAt = new Date();
        const updatedLeave = await leave.save();
        // --- End Update Leave Status ---


        // --- Refund Leave Balance if it was previously Approved ---
        if (originalStatus === 'Approved' && leave.leaveType !== 'Unpaid') {
            const balance = await LeaveBalance.findOne({ employee: employeeId });
            if (!balance) {
                // This is problematic - balance should exist if leave was approved
                console.error(`CRITICAL: Leave balance record not found for employee ${employeeId} during leave cancellation refund for leave ${leaveId}.`);
                // Continue cancellation but maybe log error for admin intervention?
                // Or return an error? Let's log and continue for now.
            } else {
                let balanceField = '';
                // Determine which balance field to refund
                 switch (leave.leaveType) {
                    case 'Casual': balanceField = 'casualLeaves'; break;
                    case 'Sick': balanceField = 'sickLeaves'; break;
                    case 'Earned': balanceField = 'earnedLeaves'; break;
                    case 'Maternity': balanceField = 'maternityLeaves'; break;
                    case 'Paternity': balanceField = 'paternityLeaves'; break;
                    case 'Compensatory': balanceField = 'compensatoryLeaves'; break;
                    default: console.warn(`Cannot refund balance for unknown leave type ${leave.leaveType} on leave ${leaveId}`); break; // Should not happen
                 }

                if (balanceField) {
                    const currentBalanceValue = balance[balanceField]?.current || 0;
                    const update = {};
                    // Add the leave days back to the current balance
                    update[`${balanceField}.current`] = currentBalanceValue + leave.numberOfDays;

                    const balanceUpdateResult = await LeaveBalance.updateOne({ _id: balance._id }, { $set: update });
                    if (balanceUpdateResult.modifiedCount === 1) {
                        console.log(`Refunded ${leave.numberOfDays} days to ${balanceField} for employee ${employeeId} due to cancellation of leave ${leaveId}. New balance: ${update[`${balanceField}.current`]}`);
                    } else {
                         console.error(`Failed to refund leave balance for employee ${employeeId} after cancelling leave ${leaveId}`);
                         // Log critical error - leave is cancelled but balance not refunded
                    }
                }
            }
        }
        // --- End Refund Logic ---

        // TODO: Notify manager logic here (optional, notify that leave was cancelled)

        res.status(200).json({ success: true, message: "Leave request cancelled successfully.", leave: updatedLeave });

    } catch (error) {
        console.error("Error cancelling leave:", error);
        res.status(500).json({ success: false, message: "Server error during leave cancellation.", error: error.message });
        // next(error);
    }
};