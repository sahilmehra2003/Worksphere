// server/controllers/dashboardController.js

// ... other imports ...
import Employee from '../models/employeeSchema.js';
import Department from '../models/departmentSchema.js'; // Needed for employeesByDepartment
import LeaveRequest from '../models/leaveRequest.model.js';
import ReviewCycle from '../models/reviewCycle.model.js';
import PerformanceReview from '../models/employeePerformanceSchema.js';
import Announcement from '../models/announcement.model.js'; // Uncommented
// import OnboardingTask from '../models/onboardingTask.model.js'; // TODO: If onboarding module exists


// ... getEmployeeDashboardSummary, getManagerDashboardSummary and their helpers ...

export const getHrDashboardSummary = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);

        // --- 1. Overall Headcounts ---
        const totalEmployees = await Employee.countDocuments({ employmentStatus: 'working' });

        const employeesByDeptAggregation = await Employee.aggregate([
            { $match: { employmentStatus: 'working' } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'departmentDetails' } },
            { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
            { $project: { departmentName: { $ifNull: ['$departmentDetails.name', 'Unassigned'] }, count: 1, _id: 0 } }
        ]);

        const employeesByStatusAggregation = await Employee.aggregate([
            { $group: { _id: '$employmentStatus', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } }
        ]);

        // --- 2. Recruitment ---
        const newHiresThisMonth = await Employee.countDocuments({
            employmentStatus: 'working',
            createdAt: { $gte: startOfMonth, $lte: now }
        });

        // --- 3. Leave Management Overview ---
        const totalPendingLeaveRequests = await LeaveRequest.countDocuments({ status: 'Pending' });
        const totalApprovedLeaveToday = await LeaveRequest.countDocuments({
            status: 'Approved',
            startDate: { $lte: todayEnd },
            endDate: { $gte: todayStart }
        });

        // --- 4. Performance Management Overview ---
        const activeReviewCyclesCount = await ReviewCycle.countDocuments({ status: 'Active' });
        let reviewsPendingSelfAssessmentCount = 0;
        let reviewsPendingManagerReviewCount = 0;

        const activeCycles = await ReviewCycle.find({ status: 'Active' }).lean();
        if (activeCycles.length > 0) {
            const activeCycleIds = activeCycles.map(cycle => cycle._id);
            reviewsPendingSelfAssessmentCount = await PerformanceReview.countDocuments({
                reviewCycle: { $in: activeCycleIds },
                selfAssessmentComments: { $eq: null }
            });
            reviewsPendingManagerReviewCount = await PerformanceReview.countDocuments({
                reviewCycle: { $in: activeCycleIds },
                selfAssessmentComments: { $ne: null },
                managerComments: { $eq: null }
            });
        }

        // --- 5. Employee Engagement/Issues ---
        const upcomingAnniversaries = await Employee.find({
            employmentStatus: 'working',
            $expr: {
                $and: [
                    { $eq: [{ $dayOfMonth: '$createdAt' }, { $dayOfMonth: now }] },
                    { $eq: [{ $month: '$createdAt' }, { $month: now }] },
                    { $gt: [{ $year: '$createdAt' }, { $year: now }] }
                ]
            }
        }).countDocuments();

        const upcomingBirthdays = await Employee.find({
            employmentStatus: 'working',
            dateOfBirth: { $exists: true },
            $expr: {
                $let: {
                    vars: {
                        dobMonth: { $month: "$dateOfBirth" },
                        dobDay: { $dayOfMonth: "$dateOfBirth" },
                        currentMonth: { $month: now },
                        currentDay: { $dayOfMonth: now },
                        nextWeekDay: { $dayOfMonth: next7Days },
                        nextWeekMonth: { $month: next7Days }
                    },
                    in: {
                        $and: [
                            { $eq: ["$$dobMonth", "$$currentMonth"] },
                            { $eq: ["$$dobDay", "$$currentDay"] }
                        ]
                    }
                }
            }
        }).countDocuments();

        // --- 6. Announcements ---
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
            totalEmployees,
            employeesByDepartment: employeesByDeptAggregation,
            employeesByEmploymentStatus: employeesByStatusAggregation,
            newHiresThisMonth,
            totalPendingLeaveRequests,
            totalApprovedLeaveToday,
            activeReviewCyclesCount,
            reviewsPendingSelfAssessmentCount,
            reviewsPendingManagerReviewCount,
            upcomingAnniversariesCount: upcomingAnniversaries,
            upcomingBirthdaysCount: upcomingBirthdays,
            announcements
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("Error fetching HR dashboard summary:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching HR dashboard data.',
            error: error.message
        });
    }
};