import Employee from '../models/employeeSchema.js';
import Task from '../models/Task.model.js';
import LeaveRequest from '../models/leaveRequest.model.js';
import Timesheet from '../models/timesheet.model.js';
import Project from '../models/projectSchema.js';
import ReviewCycle from '../models/reviewCycle.model.js';
import PerformanceReview from '../models/employeePerformanceSchema.js';
import Notification from '../models/notification.model.js';

// Get common dashboard data
export const getCommonDashboardData = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const now = new Date();

        // Get performance metrics
        const tasksCompleted = await Task.countDocuments({
            assignedTo: employeeId,
            isCompleted: true
        });

        const tasksPending = await Task.countDocuments({
            assignedTo: employeeId,
            isCompleted: false
        });

        // Calculate attendance rate (assuming 8 hours per day, 5 days per week)
        const totalWorkingHours = 40; // 8 hours * 5 days
        const timesheet = await Timesheet.findOne({
            employee: employeeId,
            weekStartDate: { $lte: now },
            weekEndDate: { $gte: now }
        });

        const attendanceRate = timesheet ?
            Math.round((timesheet.totalHours / totalWorkingHours) * 100) : 0;

        // Calculate project contribution
        const employeeProjects = await Project.find({
            'team.members': employeeId
        });

        const projectContribution = employeeProjects.length > 0 ?
            Math.round((tasksCompleted / (tasksCompleted + tasksPending)) * 100) : 0;

        // Get leave stats
        const leaveStats = await LeaveRequest.aggregate([
            {
                $match: {
                    employee: employeeId,
                    status: { $in: ['Approved', 'Pending'] }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const availableLeaves = 20; // Assuming 20 days per year
        const takenLeaves = leaveStats.find(stat => stat._id === 'Approved')?.count || 0;
        const pendingRequests = leaveStats.find(stat => stat._id === 'Pending')?.count || 0;

        // Get timesheet stats
        const timesheetStats = await Timesheet.aggregate([
            {
                $match: {
                    employee: employeeId,
                    weekStartDate: { $lte: now },
                    weekEndDate: { $gte: now }
                }
            },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: '$totalHours' },
                    billableHours: { $sum: '$billableHours' },
                    nonBillableHours: { $sum: '$nonBillableHours' },
                    overtimeHours: { $sum: '$overtimeHours' }
                }
            }
        ]);

        const dashboardData = {
            performanceMetrics: {
                tasksCompleted,
                tasksPending,
                attendanceRate,
                projectContribution
            },
            leaveStats: {
                availableLeaves,
                takenLeaves,
                pendingRequests
            },
            timesheetStats: timesheetStats[0] || {
                totalHours: 0,
                billableHours: 0,
                nonBillableHours: 0,
                overtimeHours: 0
            }
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("Error fetching common dashboard data:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching common dashboard data.',
            error: error.message
        });
    }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        // Get recent tasks
        const recentTasks = await Task.find({
            assignedTo: employeeId,
            createdAt: { $gte: thirtyDaysAgo }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt')
            .lean();

        // Get recent leave requests
        const recentLeaves = await LeaveRequest.find({
            employee: employeeId,
            createdAt: { $gte: thirtyDaysAgo }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('leaveType startDate endDate status createdAt')
            .lean();

        // Get recent timesheet submissions
        const recentTimesheets = await Timesheet.find({
            employee: employeeId,
            createdAt: { $gte: thirtyDaysAgo }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('weekStartDate weekEndDate status createdAt')
            .lean();

        // Combine and format activities
        const activities = [
            ...recentTasks.map(task => ({
                id: task._id,
                type: 'task',
                title: `Task "${task.title}" was assigned`,
                timestamp: task.createdAt
            })),
            ...recentLeaves.map(leave => ({
                id: leave._id,
                type: 'leave',
                title: `${leave.leaveType} leave request ${leave.status.toLowerCase()}`,
                timestamp: leave.createdAt
            })),
            ...recentTimesheets.map(timesheet => ({
                id: timesheet._id,
                type: 'timesheet',
                title: `Timesheet for ${new Date(timesheet.weekStartDate).toLocaleDateString()} - ${new Date(timesheet.weekEndDate).toLocaleDateString()} ${timesheet.status.toLowerCase()}`,
                timestamp: timesheet.createdAt
            }))
        ].sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: activities
        });

    } catch (error) {
        console.error("Error fetching recent activities:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching recent activities.',
            error: error.message
        });
    }
};

// Get notifications
export const getNotifications = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const notifications = await Notification.find({
            recipient: employeeId
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.status(200).json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching notifications.',
            error: error.message
        });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const employeeId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: employeeId
            },
            {
                read: true
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });

    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            message: 'Server error marking notification as read.',
            error: error.message
        });
    }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
    try {
        const employeeId = req.user._id;

        await Notification.deleteMany({
            recipient: employeeId
        });

        res.status(200).json({
            success: true,
            message: 'All notifications cleared successfully'
        });

    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({
            success: false,
            message: 'Server error clearing notifications.',
            error: error.message
        });
    }
}; 