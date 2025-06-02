import Timesheet from '../models/timesheet.model.js';
import TimesheetEntry from '../models/timeSheetEntry.model.js';
import Employee from '../models/employeeSchema.js';
import Project from '../models/projectSchema.js';
import Client from '../models/clientSchema.js';
import Task from '../models/Task.model.js';
import mongoose from 'mongoose';
import { getStartOfWeek } from '../utility/getStartOfWeek.utility.js';


export const addTimesheetEntry = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const {
            date,
            hours,
            description,
            project,
            client,
            task,
            timesheet: timesheetId // <-- NEW: get timesheet from body if present
        } = req.body;

        // 1. --- Basic Input Validation ---
        if (!date || !hours || !description) {
            return res.status(400).json({ success: false, message: 'Missing required fields: date, hours, description are required.' });
        }

        const entryDate = new Date(date);
        if (isNaN(entryDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format provided.' });
        }
        const entryDateUTCStart = new Date(Date.UTC(entryDate.getUTCFullYear(), entryDate.getUTCMonth(), entryDate.getUTCDate()));
        const parsedHours = parseFloat(hours);

        if (isNaN(parsedHours) || parsedHours < 0.1 || parsedHours > 24) {
            return res.status(400).json({ success: false, message: 'Invalid hours value. Must be between 0.1 and 24.' });
        }

        if (project && !mongoose.Types.ObjectId.isValid(project)) return res.status(400).json({ success: false, message: 'Invalid Project ID format.' });
        if (client && !mongoose.Types.ObjectId.isValid(client)) return res.status(400).json({ success: false, message: 'Invalid Client ID format.' });
        if (task && !mongoose.Types.ObjectId.isValid(task)) return res.status(400).json({ success: false, message: 'Invalid Task ID format.' });

        // --- NEW: If timesheetId is provided, use it directly ---
        if (timesheetId) {
            if (!mongoose.Types.ObjectId.isValid(timesheetId)) {
                return res.status(400).json({ success: false, message: 'Invalid Timesheet ID format.' });
            }
            const parentTimesheet = await Timesheet.findById(timesheetId);
            if (!parentTimesheet) {
                return res.status(404).json({ success: false, message: 'Timesheet not found.' });
            }
            if (!parentTimesheet.employee.equals(employeeId)) {
                return res.status(403).json({ success: false, message: 'Forbidden: Cannot add entry to another employee\'s timesheet.' });
            }
            if (parentTimesheet.status !== 'Draft') {
                return res.status(400).json({ success: false, message: `Timesheet is already '${parentTimesheet.status}' and cannot be modified.` });
            }
            // Check entry date is within timesheet week
            const weekStartDate = parentTimesheet.weekStartDate;
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
            weekEndDate.setUTCHours(23, 59, 59, 999);
            if (entryDateUTCStart < weekStartDate || entryDateUTCStart > weekEndDate) {
                return res.status(400).json({ success: false, message: `Entry date ${entryDateUTCStart.toISOString().split('T')[0]} is outside the timesheet week (${weekStartDate.toISOString().split('T')[0]} to ${weekEndDate.toISOString().split('T')[0]}).` });
            }

            // --- Transaction for entry creation and totalHours update ---
            const session = await mongoose.startSession();
            let newEntry;
            try {
                session.startTransaction();
                [newEntry] = await TimesheetEntry.create(
                    [{
                        timesheet: parentTimesheet._id,
                        employee: employeeId,
                        date: entryDateUTCStart,
                        hours: parsedHours,
                        description,
                        project: project || null,
                        client: client || null,
                        task: task || null
                    }],
                    { session }
                );
                const updatedTimesheet = await Timesheet.findByIdAndUpdate(
                    parentTimesheet._id,
                    { $inc: { totalHours: newEntry.hours } },
                    { new: true, session }
                );
                if (!updatedTimesheet) {
                    throw new Error(`Failed to update total hours for timesheet ${parentTimesheet._id}`);
                }
                await session.commitTransaction();
                console.log(`Added entry ${newEntry._id}, updated timesheet ${parentTimesheet._id} total hours to ${updatedTimesheet.totalHours}`);
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
            return res.status(201).json({
                success: true,
                message: 'Timesheet entry added successfully.',
                data: newEntry
            });
        }

        // --- ELSE: Fallback to your current week-based logic ---
        const weekStartDate = getStartOfWeek(entryDateUTCStart, 1); // Assuming helper returns Date obj set to Monday 00:00 UTC

        let parentTimesheet = await Timesheet.findOneAndUpdate(
            {
                employee: employeeId,
                weekStartDate: weekStartDate,

            },
            {
                $setOnInsert: {
                    employee: employeeId,
                    weekStartDate: weekStartDate,
                    status: 'Draft',
                    totalHours: 0,
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                sort: { _id: 1 }
            }
        );

        if (parentTimesheet.status !== 'Draft') {
            return res.status(400).json({ success: false, message: `Timesheet for week starting ${weekStartDate.toISOString().split('T')[0]} is already '${parentTimesheet.status}' and cannot be modified.` });
        }

        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6); // Sunday end of the week
        weekEndDate.setUTCHours(23, 59, 59, 999); // End of Sunday
        if (entryDateUTCStart < weekStartDate || entryDateUTCStart > weekEndDate) {
            return res.status(400).json({ success: false, message: `Entry date ${entryDateUTCStart.toISOString().split('T')[0]} is outside the timesheet week (${weekStartDate.toISOString().split('T')[0]} to ${weekEndDate.toISOString().split('T')[0]}).` });
        }

        const session = await mongoose.startSession();
        let newEntry;
        try {
            session.startTransaction();

            [newEntry] = await TimesheetEntry.create(
                [{
                    timesheet: parentTimesheet._id,
                    employee: employeeId,
                    date: entryDateUTCStart,
                    hours: parsedHours,
                    description,
                    project: project || null,
                    client: client || null,
                    task: task || null
                }],
                { session }
            );

            const updatedTimesheet = await Timesheet.findByIdAndUpdate(
                parentTimesheet._id,
                { $inc: { totalHours: newEntry.hours } },
                { new: true, session }
            );

            if (!updatedTimesheet) {
                throw new Error(`Failed to update total hours for timesheet ${parentTimesheet._id}`);
            }

            await session.commitTransaction();
            console.log(`Added entry ${newEntry._id}, updated timesheet ${parentTimesheet._id} total hours to ${updatedTimesheet.totalHours}`);

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

        res.status(201).json({
            success: true,
            message: 'Timesheet entry added successfully.',
            data: newEntry
        });

    } catch (error) {
        console.error("Error adding timesheet entry:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({
            success: false,
            message: 'Server error adding timesheet entry.',
            error: error.message
        });
    }
};

// --- Add other controller functions below ---
export const getTimesheetEntries = async (req, res) => {
    try {
        const { timesheetId } = req.params;
        const requestingUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(timesheetId)) {
            return res.status(400).json({ success: false, message: 'Invalid Timesheet ID format.' });
        }

        // Find the parent timesheet to check ownership/manager status
        const timesheet = await Timesheet.findById(timesheetId).select('employee status').lean(); // Select only needed fields

        if (!timesheet) {
            return res.status(404).json({ success: false, message: 'Timesheet not found.' });
        }

        // Authorization: Allow if user is Admin/HR, the owner, or the owner's manager
        const employeeDoc = await Employee.findById(timesheet.employee).select('manager').lean(); // Get manager for comparison
        const isOwner = requestingUser._id.equals(timesheet.employee);
        const isManager = employeeDoc?.manager && requestingUser._id.equals(employeeDoc.manager);
        const isAdminOrHR = ['Admin', 'HR'].includes(requestingUser.role);

        if (!isOwner && !isManager && !isAdminOrHR) {
            return res.status(403).json({ success: false, message: 'Access denied: Not authorized to view these entries.' });
        }

        // Fetch the entries
        const entries = await TimesheetEntry.find({ timesheet: timesheetId })
            .populate('project', 'name') // Example population
            .populate('client', 'name') // Example population
            .populate('task', 'title') // Example population
            .sort({ date: 1, createdAt: 1 }) // Sort primarily by date
            .lean();

        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries
        });

    } catch (error) {
        console.error("Error fetching timesheet entries:", error);
        res.status(500).json({ success: false, message: 'Server error fetching entries.', error: error.message });
    }
};


export const updateTimesheetEntry = async (req, res) => {
    const { entryId } = req.params;
    const employeeId = req.user._id;
    const updateData = req.body; // Contains fields like date, hours, description, project, etc.

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        return res.status(400).json({ success: false, message: 'Invalid Timesheet Entry ID format.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the entry and verify ownership and draft status
        const entry = await TimesheetEntry.findById(entryId).populate({
            path: 'timesheet',
            select: 'status employee weekStartDate' // Need status, employee, and week dates
        }).session(session); // Use session

        if (!entry) {
            throw new Error('Timesheet entry not found.'); // Will be caught and rolled back
        }
        if (!entry.employee.equals(employeeId)) {
            throw new Error('Forbidden: Cannot update entry belonging to another employee.'); // Use custom error or status code
        }
        if (entry.timesheet?.status !== 'Draft') {
            throw new Error(`Cannot update entry: Timesheet is already ${entry.timesheet?.status}.`);
        }

        // --- Validate incoming data ---
        const oldHours = entry.hours; // Store old hours for calculating difference
        let newHours = oldHours;
        if (updateData.hasOwnProperty('hours')) {
            newHours = parseFloat(updateData.hours);
            if (isNaN(newHours) || newHours < 0.1 || newHours > 24) {
                throw new Error('Invalid hours value. Must be between 0.1 and 24.');
            }
        }
        if (updateData.hasOwnProperty('date')) {
            const newDate = new Date(updateData.date);
            if (isNaN(newDate.getTime())) throw new Error('Invalid date format provided.');
            const newDateUTCStart = new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth(), newDate.getUTCDate()));

            // Validate date is within the correct week
            const weekStartDate = entry.timesheet.weekStartDate;
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
            weekEndDate.setUTCHours(23, 59, 59, 999);
            if (newDateUTCStart < weekStartDate || newDateUTCStart > weekEndDate) {
                throw new Error(`New entry date is outside the timesheet week.`);
            }
            updateData.date = newDateUTCStart; // Standardize date
        }
        // Validate optional refs if provided...

        // --- Update the entry ---
        // Only allow updating specific fields
        const allowedFields = ['date', 'hours', 'description', 'project', 'client', 'task'];
        const finalUpdateData = {};
        allowedFields.forEach(field => {
            if (updateData.hasOwnProperty(field)) {
                finalUpdateData[field] = updateData[field];
            }
        });

        if (Object.keys(finalUpdateData).length === 0) {
            throw new Error("No valid fields provided for update.");
        }

        const updatedEntry = await TimesheetEntry.findByIdAndUpdate(
            entryId,
            { $set: finalUpdateData },
            { new: true, runValidators: true, session } // Use session
        );

        // --- Update Parent Timesheet Total Hours ---
        const hourDifference = updatedEntry.hours - oldHours;
        if (hourDifference !== 0) {
            const updatedTimesheet = await Timesheet.findByIdAndUpdate(
                entry.timesheet._id,
                { $inc: { totalHours: hourDifference } },
                { new: true, session } // Use session
            );
            if (!updatedTimesheet) throw new Error('Failed to update parent timesheet total hours.');
            console.log(`Updated timesheet ${entry.timesheet._id} total hours by ${hourDifference} to ${updatedTimesheet.totalHours}`);
        }

        await session.commitTransaction(); // Commit transaction
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Timesheet entry updated successfully.',
            data: updatedEntry
        });

    } catch (error) {
        await session.abortTransaction(); // Rollback on any error
        session.endSession();
        console.error("Error updating timesheet entry:", error);
        // Send specific error messages caught above
        if (error.message.startsWith('Forbidden') || error.message.startsWith('Cannot update entry') || error.message.startsWith('Timesheet entry not found') || error.message.startsWith('Invalid') || error.message.startsWith('New entry date')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error updating entry.', error: error.message });
    }
};


export const deleteTimesheetEntry = async (req, res) => {
    const { entryId } = req.params;
    const employeeId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        return res.status(400).json({ success: false, message: 'Invalid Timesheet Entry ID format.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the entry and verify ownership and draft status
        const entry = await TimesheetEntry.findById(entryId).populate({
            path: 'timesheet',
            select: 'status employee' // Need status and employee
        }).session(session);

        if (!entry) {
            throw new Error('Timesheet entry not found.');
        }
        if (!entry.employee.equals(employeeId)) {
            throw new Error('Forbidden: Cannot delete entry belonging to another employee.');
        }
        if (entry.timesheet?.status !== 'Draft') {
            throw new Error(`Cannot delete entry: Timesheet is already ${entry.timesheet?.status}.`);
        }

        const hoursToDelete = entry.hours; // Get hours before deleting
        const parentTimesheetId = entry.timesheet._id;

        // --- Delete the entry ---
        await TimesheetEntry.findByIdAndDelete(entryId, { session });

        // --- Update Parent Timesheet Total Hours ---
        const updatedTimesheet = await Timesheet.findByIdAndUpdate(
            parentTimesheetId,
            { $inc: { totalHours: -hoursToDelete } }, // Decrement total hours
            { new: true, session }
        );
        if (!updatedTimesheet) throw new Error('Failed to update parent timesheet total hours after deleting entry.');
        console.log(`Deleted entry ${entryId}, updated timesheet ${parentTimesheetId} total hours to ${updatedTimesheet.totalHours}`);


        await session.commitTransaction(); // Commit transaction
        session.endSession();

        res.status(204).send(); // Success, no content to return

    } catch (error) {
        await session.abortTransaction(); // Rollback on any error
        session.endSession();
        console.error("Error deleting timesheet entry:", error);
        if (error.message.startsWith('Forbidden') || error.message.startsWith('Cannot delete entry') || error.message.startsWith('Timesheet entry not found')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error deleting entry.', error: error.message });
    }
};


export const submitTimesheet = async (req, res) => {
    try {
        const { timesheetId } = req.params;
        const employeeId = req.user._id;
        const { employeeComments } = req.body; // Optional comments from employee

        if (!mongoose.Types.ObjectId.isValid(timesheetId)) {
            return res.status(400).json({ success: false, message: 'Invalid Timesheet ID format.' });
        }

        const timesheet = await Timesheet.findById(timesheetId);

        if (!timesheet) {
            return res.status(404).json({ success: false, message: 'Timesheet not found.' });
        }

        // Authorization: Only the owner can submit
        if (!timesheet.employee.equals(employeeId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Cannot submit timesheet belonging to another employee.' });
        }

        // Check status: Only drafts can be submitted
        if (timesheet.status !== 'Draft') {
            return res.status(400).json({ success: false, message: `Timesheet is already ${timesheet.status} and cannot be submitted.` });
        }

        // Optional: Add validation - e.g., ensure totalHours > 0 before submission?
        // if (timesheet.totalHours <= 0) {
        //     return res.status(400).json({ success: false, message: 'Cannot submit an empty timesheet. Please add time entries.' });
        // }

        // Update status and comments
        timesheet.status = 'Submitted';
        if (employeeComments !== undefined) {
            timesheet.employeeComments = employeeComments;
        }
        // The pre('save') hook will set the submittedDate automatically

        const updatedTimesheet = await timesheet.save();

        // TODO: Trigger notification to manager

        res.status(200).json({
            success: true,
            message: 'Timesheet submitted successfully for approval.',
            data: updatedTimesheet
        });

    } catch (error) {
        console.error("Error submitting timesheet:", error);
        res.status(500).json({ success: false, message: 'Server error submitting timesheet.', error: error.message });
    }
};


export const approveTimesheet = async (req, res) => {
    try {
        const { timesheetId } = req.params;
        const approver = req.user; // User object from authN
        const { managerComments } = req.body; // Optional comments from approver

        if (!mongoose.Types.ObjectId.isValid(timesheetId)) {
            return res.status(400).json({ success: false, message: 'Invalid Timesheet ID format.' });
        }

        const timesheet = await Timesheet.findById(timesheetId).populate('employee', 'manager'); // Populate employee's manager

        if (!timesheet) {
            return res.status(404).json({ success: false, message: 'Timesheet not found.' });
        }

        // Check status: Only submitted timesheets can be approved
        if (timesheet.status !== 'Submitted') {
            return res.status(400).json({ success: false, message: `Timesheet status is ${timesheet.status}. Only submitted timesheets can be approved.` });
        }

        // Authorization: Check if approver is Admin/HR or the Manager of the employee
        const isAdminOrHR = ['Admin', 'HR'].includes(approver.role);
        const isEmployeeManager = timesheet.employee?.manager && approver._id.equals(timesheet.employee.manager);

        if (!isAdminOrHR && !isEmployeeManager) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to approve this timesheet.' });
        }

        // Update status, processedBy, and comments
        timesheet.status = 'Approved';
        timesheet.processedBy = approver._id;
        if (managerComments !== undefined) {
            timesheet.managerComments = managerComments;
        }
        // The pre('save') hook will set processedDate and clear rejectionReason

        const updatedTimesheet = await timesheet.save();

        // TODO: Trigger notification to employee

        res.status(200).json({
            success: true,
            message: 'Timesheet approved successfully.',
            data: updatedTimesheet
        });

    } catch (error) {
        console.error("Error approving timesheet:", error);
        res.status(500).json({ success: false, message: 'Server error approving timesheet.', error: error.message });
    }
};


export const rejectTimesheet = async (req, res) => {
    try {
        const { timesheetId } = req.params;
        const rejector = req.user; // User object from authN
        const { rejectionReason, managerComments } = req.body; // Rejection reason is required

        if (!mongoose.Types.ObjectId.isValid(timesheetId)) {
            return res.status(400).json({ success: false, message: 'Invalid Timesheet ID format.' });
        }
        // Schema requires rejectionReason if status is 'Rejected'
        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting a timesheet.' });
        }


        const timesheet = await Timesheet.findById(timesheetId).populate('employee', 'manager'); // Populate employee's manager

        if (!timesheet) {
            return res.status(404).json({ success: false, message: 'Timesheet not found.' });
        }

        // Check status: Only submitted timesheets can be rejected
        if (timesheet.status !== 'Submitted') {
            return res.status(400).json({ success: false, message: `Timesheet status is ${timesheet.status}. Only submitted timesheets can be rejected.` });
        }

        // Authorization: Check if rejector is Admin/HR or the Manager of the employee
        const isAdminOrHR = ['Admin', 'HR'].includes(rejector.role);
        const isEmployeeManager = timesheet.employee?.manager && rejector._id.equals(timesheet.employee.manager);

        if (!isAdminOrHR && !isEmployeeManager) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to reject this timesheet.' });
        }

        // Update status, processedBy, comments, and reason
        timesheet.status = 'Rejected';
        timesheet.processedBy = rejector._id;
        timesheet.rejectionReason = rejectionReason; // Set the reason
        if (managerComments !== undefined) {
            timesheet.managerComments = managerComments;
        }
        // The pre('save') hook will set processedDate

        const updatedTimesheet = await timesheet.save();

        // TODO: Trigger notification to employee

        res.status(200).json({
            success: true,
            message: 'Timesheet rejected successfully.',
            data: updatedTimesheet
        });

    } catch (error) {
        console.error("Error rejecting timesheet:", error);
        if (error.name === 'ValidationError') { // Catch validation errors (e.g., missing rejectionReason if check failed somehow)
            return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error rejecting timesheet.', error: error.message });
    }
};


export const getSubmittedTimesheets = async (req, res) => {
    try {
        const approver = req.user;
        const query = { status: 'Submitted' }; // Base query

        // Filter by employees managed by the requester, unless they are Admin/HR
        if (!['Admin', 'HR'].includes(approver.role)) {
            const teamMemberIds = await Employee.find({ manager: approver._id }, '_id').lean().then(emps => emps.map(e => e._id));
            if (teamMemberIds.length === 0) {
                // Manager has no subordinates, return empty list
                return res.status(200).json({ success: true, count: 0, pagination: {}, data: [] });
            }
            query.employee = { $in: teamMemberIds };
        }
        // Add other filters from req.query if needed (e.g., specific employee, date range)

        // --- Pagination ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const timesheets = await Timesheet.find(query)
            .populate('employee', 'name email') // Populate who submitted it
            .sort({ submittedDate: 1 }) // Sort by oldest submitted first
            .skip(skip)
            .limit(limit)
            .lean();

        const totalTimesheets = await Timesheet.countDocuments(query);

        res.status(200).json({
            success: true,
            count: timesheets.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTimesheets / limit),
                totalRecords: totalTimesheets
            },
            data: timesheets
        });

    } catch (error) {
        console.error("Error fetching submitted timesheets:", error);
        res.status(500).json({ success: false, message: 'Server error fetching submitted timesheets.', error: error.message });
    }
};


export const getAllTimesheets = async (req, res) => {
    try {
        // Base query
        const query = {}; // Add isDeleted: false if soft delete is implemented later

        // --- Add Filtering based on req.query ---
        if (req.query.employeeId && mongoose.Types.ObjectId.isValid(req.query.employeeId)) {
            query.employee = req.query.employeeId;
        }
        if (req.query.status && ['Draft', 'Submitted', 'Approved', 'Rejected'].includes(req.query.status)) {
            query.status = req.query.status;
        }
        if (req.query.weekStartDate) { // Expecting YYYY-MM-DD
            try {
                const start = getStartOfWeek(new Date(req.query.weekStartDate), 1);
                if (!isNaN(start.getTime())) {
                    query.weekStartDate = start;
                }
            } catch (e) { console.warn("Invalid weekStartDate filter format"); }
        }
        // Add date range filters for weekStartDate if needed

        // --- Pagination ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // --- Sorting --- (Example: newest week first, then employee name)
        const sort = { weekStartDate: -1, 'employee.name': 1 }; // Requires population or lookup for name sort

        const tasks = await Timesheet.find(query)
            .populate('employee', 'name email') // Populate who submitted it
            .populate('processedBy', 'name email') // Populate who processed it
            .sort({ weekStartDate: -1, createdAt: -1 }) // Simpler sort
            .skip(skip)
            .limit(limit)
            .lean();

        const totalTasks = await Timesheet.countDocuments(query);

        res.status(200).json({
            success: true,
            count: tasks.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks: totalTasks
            },
            data: tasks
        });

    } catch (error) {
        console.error("Error fetching all timesheets:", error);
        res.status(500).json({ success: false, message: 'Server error fetching timesheets.', error: error.message });
    }
};


export const getTimesheetById = async (req, res) => {
    try {
        const { timesheetId } = req.params;
        const requestingUser = req.user; // From authN middleware

        if (!mongoose.Types.ObjectId.isValid(timesheetId)) {
            return res.status(400).json({ success: false, message: 'Invalid Timesheet ID format.' });
        }

        // 1. Find the Timesheet document and populate necessary details
        const timesheet = await Timesheet.findById(timesheetId)
            .populate('employee', 'name email manager') // Populate owner, need their manager ID for auth check
            .populate('processedBy', 'name email');     // Populate who approved/rejected it

        if (!timesheet) {
            return res.status(404).json({ success: false, message: 'Timesheet not found.' });
        }

        // 2. --- Authorization Check ---
        const isAdminOrHR = ['Admin', 'HR'].includes(requestingUser.role);
        const isOwner = requestingUser._id.equals(timesheet.employee?._id);
        // Check if the requester is the manager of the employee who owns the timesheet
        const isOwnerManager = timesheet.employee?.manager && requestingUser._id.equals(timesheet.employee.manager);

        if (!isAdminOrHR && !isOwner && !isOwnerManager) {
            // If user is not Admin/HR, not the owner, and not the owner's manager, deny access
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view this timesheet.' });
        }
        // --- End Authorization Check ---


        // 3. Find all associated Timesheet Entries if authorized
        const entries = await TimesheetEntry.find({ timesheet: timesheetId })
            .populate('project', 'name') // Optional: Adjust population as needed
            .populate('client', 'name')  // Optional
            .populate('task', 'title')   // Optional
            .sort({ date: 1, createdAt: 1 }) // Sort entries by date
            .lean();

        // 4. Respond with combined data
        res.status(200).json({
            success: true,
            // Return timesheet header info and the array of entries
            // Use .toObject() if you didn't use .lean() on the timesheet query above
            data: {
                timesheet: timesheet,
                entries: entries
            }
        });

    } catch (error) {
        console.error("Error fetching timesheet by ID:", error);
        res.status(500).json({ success: false, message: 'Server error fetching timesheet details.', error: error.message });
    }
};

export const getMyTimesheets = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const query = { employee: employeeId };

        if (req.query.status) {
            const statuses = req.query.status.split(',').filter(s => ['Draft', 'Submitted', 'Approved', 'Rejected'].includes(s));
            if (statuses.length > 0) {
                query.status = { $in: statuses };
            }
        }

        if (req.query.weekStartDate) {
            try {
                const date = new Date(req.query.weekStartDate);
                if (!isNaN(date.getTime())) {
                    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
                    query.weekStartDate = getStartOfWeek(utcDate, 1);
                }
            } catch (e) { console.warn("Invalid weekStartDate filter format"); }
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sort = { weekStartDate: -1 };

        // Updated population to include entries and their projects
        const timesheets = await Timesheet.find(query)
            .populate('processedBy', 'name email')
            .populate({
                path: 'entries',
                populate: {
                    path: 'project',
                    select: 'name description'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const totalTimesheets = await Timesheet.countDocuments(query);

        const isAdminOrHR = ['Admin', 'HR'].includes(req.user.role);
        const shouldCreateTimesheet = isAdminOrHR && totalTimesheets === 0;

        res.status(200).json({
            success: true,
            count: timesheets.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTimesheets / limit),
                totalRecords: totalTimesheets
            },
            data: timesheets,
            shouldCreateTimesheet,
            message: shouldCreateTimesheet ? 'No timesheets found. Please create a new timesheet.' : undefined
        });

    } catch (error) {
        console.error("Error fetching user's timesheets:", error);
        res.status(500).json({ success: false, message: 'Server error fetching timesheets.', error: error.message });
    }
};

export const deleteTimesheet = async (req, res) => {
    try {
        const { timesheetId } = req.params;
        const employeeId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(timesheetId)) {
            return res.status(400).json({ success: false, message: 'Invalid Timesheet ID format.' });
        }

        const timesheet = await Timesheet.findById(timesheetId);

        if (!timesheet) {
            return res.status(404).json({ success: false, message: 'Timesheet not found.' });
        }

        // Authorization: Only the owner or Admin/HR can delete
        const isAdminOrHR = ['Admin', 'HR'].includes(req.user.role);
        if (!timesheet.employee.equals(employeeId) && !isAdminOrHR) {
            return res.status(403).json({ success: false, message: 'Forbidden: Cannot delete timesheet belonging to another employee.' });
        }

        // Only allow deletion of Draft timesheets
        if (timesheet.status !== 'Draft') {
            return res.status(400).json({ success: false, message: `Cannot delete timesheet: Status is ${timesheet.status}. Only Draft timesheets can be deleted.` });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Delete all entries first
            await TimesheetEntry.deleteMany({ timesheet: timesheetId }, { session });

            // Then delete the timesheet
            await Timesheet.findByIdAndDelete(timesheetId, { session });

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                success: true,
                message: 'Timesheet and all its entries deleted successfully.'
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    } catch (error) {
        console.error("Error deleting timesheet:", error);
        res.status(500).json({ success: false, message: 'Server error deleting timesheet.', error: error.message });
    }
};