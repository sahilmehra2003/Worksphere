// server/controllers/dashboardController.js

// ... other imports ...
import Employee from '../models/employeeSchema.js';
import Department from '../models/departmentSchema.js';
import Project from '../models/projectSchema.js'; // Assuming you have a Project model
import Client from '../models/clientSchema.js';   // Assuming you have a Client model
import LeaveRequest from '../models/leaveRequest.model.js';
import Timesheet from '../models/timesheet.model.js';
import ReviewCycle from '../models/reviewCycle.model.js';
// import Transaction from '../models/transactionSchema.js';
import Announcement from '../models/announcement.model.js'; // Uncommented
// import SystemLog from '../models/systemLog.model.js'; // TODO: For systemErrorsCount & scheduled job status
import mongoose from 'mongoose';

// ... getEmployeeDashboardSummary, getManagerDashboardSummary and their helpers ...


export const getAdminDashboardSummary = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();

        // --- 1. System & User Statistics ---
        const totalActiveEmployees = await Employee.countDocuments({ employmentStatus: 'working' });
        const totalDepartments = await Department.countDocuments();
        const totalProjects = await Project.countDocuments({ status: 'In Progress' });
        const totalClients = await Client.countDocuments({ status: true });

        const newSignupsToday = await Employee.countDocuments({
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });
        const unverifiedAccountsCount = await Employee.countDocuments({ isVerified: false });

        // --- 2. Administrative Alerts & Overviews ---
        const systemWidePendingLeaveRequests = await LeaveRequest.countDocuments({ status: 'Pending' });
        const systemWidePendingTimesheets = await Timesheet.countDocuments({ status: 'Submitted' });

        const autoRejectedLeavesToday = await LeaveRequest.countDocuments({
            status: 'Auto-Rejected',
            updatedAt: { $gte: todayStart, $lte: todayEnd }
        });

        const activePerformanceCycles = await ReviewCycle.find({ status: 'Active' })
            .select('name year endDate')
            .lean();

        // const systemErrorsCount = 0; // TODO: Implement system logging for this

        // --- 3. Financial Snapshot ---
        let totalRevenueThisMonth = 0;
        let totalExpensesThisMonth = 0;
        let netProfitThisMonth = 0;
        const currentMonthTransaction = await Transaction.findOne({ month: currentMonth, year: currentYear }).lean();
        if (currentMonthTransaction) {
            totalRevenueThisMonth = currentMonthTransaction.revenue || 0;
            totalExpensesThisMonth = currentMonthTransaction.expenses || 0;
            netProfitThisMonth = currentMonthTransaction.profit || 0;
        }

        // --- 4. Scheduled Job Status ---
        const lastRunAutoRejectLeaves = "N/A (Logging not implemented)"; // TODO
        const lastRunYearEndBalanceUpdate = "N/A (Logging not implemented)"; // TODO

        // --- 5. Announcements ---
        let announcements = [];
        try {
            announcements = await Announcement.find({
                status: 'Published',
                $or: [
                    { publishDate: { $exists: false } },
                    { publishDate: { $lte: now } }
                ],
                $or: [
                    { expiryDate: { $exists: false } },
                    { expiryDate: { $gt: now } }
                ]
            })
                .sort({ isSticky: -1, publishDate: -1 })
                .limit(3)
                .select('title content publishDate isSticky views')
                .lean();
        } catch (announcementError) {
            console.warn("Error fetching announcements:", announcementError.message);
        }

        const dashboardData = {
            totalActiveEmployees,
            totalDepartments,
            totalProjects,
            totalClients,
            newSignupsToday,
            unverifiedAccountsCount,
            systemWidePendingLeaveRequests,
            systemWidePendingTimesheets,
            autoRejectedLeavesToday,
            activePerformanceCycles,
            // systemErrorsCount, // TODO
            financials: {
                month: `${currentMonth} ${currentYear}`,
                totalRevenueThisMonth,
                totalExpensesThisMonth,
                netProfitThisMonth,
            },
            scheduledJobStatus: {
                lastRunAutoRejectLeaves,
                lastRunYearEndBalanceUpdate
            },
            announcements
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("Error fetching admin dashboard summary:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching admin dashboard data.',
            error: error.message
        });
    }
};

