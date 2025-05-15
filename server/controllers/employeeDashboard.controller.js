import Employee from '../models/employeeSchema.js';
import Task from '../models/Task.model.js';
import LeaveRequest from '../models/leaveRequest.model.js';
import CountryCalendar from '../models/calender.model.js'; // Assuming this is your holiday calendar model
import Announcement from '../models/announcement.model.js'; // Uncommented
import { getStartOfWeek } from '../utils/dateUtils.js'; // If needed for date manipulations
import mongoose from 'mongoose';


export const getEmployeeDashboardSummary = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const userCountry = req.user.country;
        const now = new Date();

        // Fetch announcements
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

        const upcomingHolidays = await getUpcomingHolidays(userCountry, now);

        const incompleteTasks = await Task.find({
            assignedTo: employeeId,
            isCompleted: false
        })
            .populate('createdBy', 'name')
            .sort({ deadlineDate: 1, priority: -1, createdAt: 1 })
            .limit(10)
            .lean();

        const { upcomingTasks, overdueTasks } = categorizeTasks(incompleteTasks, now);

        const recentLeaveRequests = await LeaveRequest.find({ employee: employeeId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('leaveType startDate endDate numberOfDays status rejectionReason')
            .lean();

        const dashboardData = {
            announcements,
            upcomingHolidays,
            pendingTasks: {
                upcoming: upcomingTasks.slice(0, 5),
                overdue: overdueTasks.slice(0, 5)
            },
            recentLeaveRequests
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("Error fetching employee dashboard summary:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching dashboard data.',
            error: error.message
        });
    }
};

const getUpcomingHolidays = async (userCountry, now) => {
    if (!userCountry) return [];

    const calendar = await CountryCalendar.findOne({ country: userCountry });
    if (!calendar?.holidays) return [];

    return calendar.holidays
        .filter(holiday => new Date(holiday.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
        .map(h => ({ name: h.name, date: h.date }));
};

const categorizeTasks = (tasks, now) => {
    const upcomingTasks = [];
    const overdueTasks = [];

    tasks.forEach(task => {
        if (task.deadlineDate && new Date(task.deadlineDate) < now) {
            overdueTasks.push(task);
        } else {
            upcomingTasks.push(task);
        }
    });

    return { upcomingTasks, overdueTasks };
};