import Employee from '../models/employeeSchema.js';
import Task from '../models/Task.model.js';
import LeaveRequest from '../models/leaveRequest.model.js';
import CountryCalendar from '../models/calender.model.js';
import Timesheet from '../models/timesheet.model.js';
import Announcement from '../models/announcement.model.js';
import ReviewCycle from '../models/reviewCycle.model.js';
import PerformanceReview from '../models/employeePerformanceSchema.js';


export const getManagerDashboardSummary = async (req, res) => {
    try {
        const managerId = req.user._id;
        const now = new Date();
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);
        const next14Days = new Date();
        next14Days.setDate(now.getDate() + 14);

        const teamMembers = await Employee.find({ manager: managerId, employmentStatus: 'working' })
            .select('_id name position')
            .lean();

        const teamMemberIds = teamMembers.map(member => member._id);
        const teamMemberCount = teamMembers.length;

        let pendingLeaveApprovalsCount = 0;
        let pendingLeaveApprovalsList = [];
        let pendingTimesheetApprovalsCount = 0;
        let teamUpcomingLeaveCount = 0;
        let teamOverdueTasksCount = 0;
        let upcomingReviewDeadlines = [];
        let announcements = [];

        if (teamMemberCount > 0) {
            pendingLeaveApprovalsList = await LeaveRequest.find({
                employee: { $in: teamMemberIds },
                status: 'Pending'
            })
                .populate('employee', 'name')
                .select('employee leaveType startDate endDate numberOfDays')
                .sort({ createdAt: 1 })
                .limit(5)
                .lean();
            pendingLeaveApprovalsCount = await LeaveRequest.countDocuments({
                employee: { $in: teamMemberIds },
                status: 'Pending'
            });

            pendingTimesheetApprovalsCount = await Timesheet.countDocuments({
                employee: { $in: teamMemberIds },
                status: 'Submitted'
            });

            const upcomingTeamLeaves = await LeaveRequest.find({
                employee: { $in: teamMemberIds },
                status: 'Approved',
                startDate: { $lte: next7Days },
                endDate: { $gte: now }
            }).lean();

            upcomingTeamLeaves.forEach(leave => {
                teamUpcomingLeaveCount += leave.numberOfDays;
            });

            teamOverdueTasksCount = await Task.countDocuments({
                assignedTo: { $in: teamMemberIds },
                isCompleted: false,
                deadlineDate: { $lt: now }
            });

            const activeCycle = await ReviewCycle.findOne({ status: 'Active' }).lean();
            if (activeCycle) {
                if (activeCycle.selfAssessmentDueDate) {
                    const selfAssessmentDeadline = new Date(activeCycle.selfAssessmentDueDate);
                    if (selfAssessmentDeadline >= now && selfAssessmentDeadline <= next14Days) {
                        const pendingSelfAssessments = await PerformanceReview.find({
                            employee: { $in: teamMemberIds },
                            reviewCycle: activeCycle._id,
                            selfAssessmentComments: { $eq: null }
                        })
                            .populate('employee', 'name')
                            .select('employee')
                            .lean();

                        if (pendingSelfAssessments.length > 0) {
                            upcomingReviewDeadlines.push({
                                cycleName: `${activeCycle.name} ${activeCycle.year}`,
                                deadlineType: 'Self-Assessment Due',
                                dueDate: activeCycle.selfAssessmentDueDate,
                                employeesCount: pendingSelfAssessments.length,
                                employees: pendingSelfAssessments.map(pr => pr.employee.name).slice(0, 3)
                            });
                        }
                    }
                }
                if (activeCycle.managerReviewDueDate) {
                    const managerReviewDeadline = new Date(activeCycle.managerReviewDueDate);
                    if (managerReviewDeadline >= now && managerReviewDeadline <= next14Days) {
                        const pendingManagerReviews = await PerformanceReview.find({
                            employee: { $in: teamMemberIds },
                            reviewCycle: activeCycle._id,
                            managerComments: { $eq: null }
                        })
                            .populate('employee', 'name')
                            .select('employee')
                            .lean();

                        if (pendingManagerReviews.length > 0) {
                            upcomingReviewDeadlines.push({
                                cycleName: `${activeCycle.name} ${activeCycle.year}`,
                                deadlineType: 'Manager Review Due',
                                dueDate: activeCycle.managerReviewDueDate,
                                employeesCount: pendingManagerReviews.length,
                                employees: pendingManagerReviews.map(pr => pr.employee.name).slice(0, 3)
                            });
                        }
                    }
                }
            }
        }

        // Fetch announcements
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
            teamMemberCount,
            teamMembersQuickList: teamMembers.slice(0, 7),
            pendingLeaveApprovalsCount,
            pendingLeaveApprovalsList,
            pendingTimesheetApprovalsCount,
            teamUpcomingLeaveCount,
            teamOverdueTasksCount,
            upcomingReviewDeadlines,
            announcements
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("Error fetching manager dashboard summary:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching manager dashboard data.',
            error: error.message
        });
    }
};