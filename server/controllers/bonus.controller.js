import BonusAward from '../models/awardBonus.model.js';
import BonusType from '../models/bonus.model.js';
import Employee from '../models/employeeSchema.js';
import { Expense } from '../models/expenseSchema.model.js';
import mongoose from 'mongoose';


export const awardBonus = async (req, res) => {
    try {
        const {
            employee,
            bonusType,
            effectiveDate,
            reason,
            monetaryAmount,
            currency,
            nonMonetaryDetails,
            leaveDaysGranted,
            relatedEntityId,
            relatedEntityType,
            notes
        } = req.body;

        const awardedBy = req.user._id;

        if (!employee || !bonusType || !effectiveDate || !reason) {
            return res.status(400).json({ success: false, error: "Employee, bonus type, effective date, and reason are required." });
        }

        const newBonusAward = new BonusAward({
            employee,
            bonusType,
            effectiveDate,
            reason,
            monetaryAmount,
            currency,
            nonMonetaryDetails,
            leaveDaysGranted,
            relatedEntityId,
            relatedEntityType,
            notes,
            awardedBy
        });

        await newBonusAward.save();

        // Future step: Trigger a notification to the manager/employee.

        return res.status(201).json({
            success: true,
            message: "Bonus has been awarded and is pending approval.",
            data: newBonusAward
        });

    } catch (error) {
        console.error("Error awarding bonus:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};


export const getPendingBonusApprovals = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let pendingBonuses;

        // Admin and HR can see all pending bonus approvals
        if (userRole === 'Admin' || userRole === 'HR') {
            pendingBonuses = await BonusAward.find({
                status: 'PendingApproval'
            })
                .populate('employee', 'name employeeId')
                .populate('bonusType', 'name category')
                .populate('awardedBy', 'name')
                .sort({ createdAt: -1 });
        } else if (userRole === 'Manager') {
            // Managers can only see pending approvals for their team members
            const teamMembers = await Employee.find({ manager: userId }).select('_id');
            const teamMemberIds = teamMembers.map(member => member._id);

            pendingBonuses = await BonusAward.find({
                employee: { $in: teamMemberIds },
                status: 'PendingApproval'
            })
                .populate('employee', 'name employeeId')
                .populate('bonusType', 'name category')
                .populate('awardedBy', 'name')
                .sort({ createdAt: -1 });
        } else {
            // Other roles don't have access to pending approvals
            return res.status(403).json({
                success: false,
                error: "Access denied: You don't have permission to view pending bonus approvals."
            });
        }

        return res.status(200).json({
            success: true,
            data: pendingBonuses
        });

    } catch (error) {
        console.error("Error fetching pending bonus approvals:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching pending approvals." });
    }
};


export const approveOrRejectBonus = async (req, res) => {
    try {
        const { awardId } = req.params;
        const { status, rejectionReason } = req.body; 
        const approverId = req.user._id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status. Must be 'Approved' or 'Rejected'." });
        }

        const bonusAward = await BonusAward.findById(awardId);
        if (!bonusAward) {
            return res.status(404).json({ success: false, error: "Bonus award not found." });
        }

        // Add logic here to ensure the approver is authorized (e.g., is the employee's manager or HR)

        bonusAward.status = status;
        bonusAward.approvedBy = approverId;
        bonusAward.approvalDate = new Date();
        if (status === 'Rejected') {
            bonusAward.rejectionReason = rejectionReason;
        }

        // If approved and it's not a monetary bonus, update status accordingly
        if (status === 'Approved') {
            if (bonusAward.valueCategory === 'LeaveCredit') bonusAward.status = 'Credited';
            if (bonusAward.valueCategory === 'NonMonetary_Gift') bonusAward.status = 'ProcessingPayment'; // Or similar status for procurement
        }

        await bonusAward.save();

        return res.status(200).json({
            success: true,
            message: `Bonus award has been ${status.toLowerCase()}.`,
            data: bonusAward
        });

    } catch (error) {
        console.error("Error processing bonus approval:", error);
        return res.status(500).json({ success: false, error: "Server error while processing bonus approval." });
    }
};


export const markBonusAsPaid = async (req, res) => {
    try {
        const { awardId } = req.params;
        const { paymentDetails, notes } = req.body;

        const bonusAward = await BonusAward.findById(awardId).populate('employee', 'name department');

        if (!bonusAward) {
            return res.status(404).json({ success: false, error: "Bonus award not found." });
        }

        if (bonusAward.status !== 'Approved' || bonusAward.valueCategory !== 'Monetary') {
            return res.status(400).json({ success: false, error: "This bonus is not an approved monetary award and cannot be marked as paid." });
        }

        // --- Create a corresponding Expense record ---
        const expense = new Expense({
            category: 'Bonuses',
            amount: bonusAward.monetaryAmount,
            currency: bonusAward.currency,
            description: `Bonus payout for ${bonusAward.employee.name}: ${bonusAward.reason}`,
            date: new Date(),
            status: 'Approved', // System-generated expenses are pre-approved
            paymentStatus: 'Paid',
            paymentMethod: 'Bank Transfer', // Or get from request body
            createdBy: req.user._id, // The user processing the payment
            department: bonusAward.employee.department, // Assign expense to the employee's department
            notes: `Linked to BonusAward ID: ${bonusAward._id}. ${notes || ''}`
        });

        await expense.save();

        // --- Update the BonusAward status ---
        bonusAward.status = 'PaidOut';
        bonusAward.paymentDetails = `Paid via Expense record: ${expense._id}. ${paymentDetails || ''}`;

        await bonusAward.save();

        return res.status(200).json({
            success: true,
            message: 'Bonus has been marked as paid and an expense record has been created.',
            data: { bonusAward, expense }
        });

    } catch (error) {
        console.error("Error marking bonus as paid:", error);
        return res.status(500).json({ success: false, error: "Server error while marking bonus as paid." });
    }
};

export const fetchBonusTypes = async (req, res) => {
    try {
        const bonusTypes = await BonusType.find({ isActive: true })
            .select('typeCode name description category requiresApproval defaultApproverRoles')
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            message: "Bonus types fetched successfully",
            data: bonusTypes
        });
    } catch (error) {
        console.error("Error fetching bonus types:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching bonus types. Please try again later."
        });
    }
};

export const fetchMyBonusAwards = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const bonusAwards = await BonusAward.find({ employee: employeeId })
            .populate('bonusType', 'typeCode name description category')
            .populate('awardedBy', 'name employeeId')
            .populate('approvedBy', 'name employeeId')
            .sort({ awardDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Bonus awards fetched successfully",
            data: bonusAwards
        });
    } catch (error) {
        console.error("Error fetching bonus awards:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching bonus awards. Please try again later."
        });
    }
};

export const createBonusAward = async (req, res) => {
    try {
        const { employeeId, bonusTypeId, effectiveDate, reason, monetaryAmount, currency, nonMonetaryDetails, leaveDaysGranted } = req.body;
        const awardedBy = req.user._id;

        // Validate required fields
        if (!employeeId || !bonusTypeId || !effectiveDate || !reason) {
            return res.status(400).json({
                success: false,
                message: "Employee ID, bonus type ID, effective date, and reason are required."
            });
        }

        // Fetch the bonus type to get the category
        const bonusType = await BonusType.findById(bonusTypeId);
        if (!bonusType) {
            return res.status(400).json({
                success: false,
                message: "Invalid bonus type ID."
            });
        }

        const newBonusAward = new BonusAward({
            employee: employeeId,
            bonusType: bonusTypeId,
            effectiveDate: new Date(effectiveDate),
            reason,
            monetaryAmount,
            currency,
            nonMonetaryDetails,
            leaveDaysGranted,
            awardedBy,
            valueCategory: bonusType.category // Explicitly set the valueCategory
        });

        await newBonusAward.save();

        const populatedAward = await BonusAward.findById(newBonusAward._id)
            .populate('bonusType', 'typeCode name description category')
            .populate('employee', 'name employeeId')
            .populate('awardedBy', 'name employeeId');

        return res.status(201).json({
            success: true,
            message: "Bonus award created successfully",
            data: populatedAward
        });
    } catch (error) {
        console.error("Error creating bonus award:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation Error: " + error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error creating bonus award. Please try again later."
        });
    }
};

export const seedBonusTypes = async (req, res) => {
    try {
        // Check if bonus types already exist
        const existingCount = await BonusType.countDocuments();
        if (existingCount > 0) {
            return res.status(200).json({
                success: true,
                message: "Bonus types already exist in the database",
                count: existingCount
            });
        }

        const initialBonusTypes = [
            {
                typeCode: 'PERFORMANCE',
                name: 'Performance Bonus',
                description: 'Awarded for exceptional performance and achievements',
                category: 'Monetary',
                defaultTriggerEvents: ['PerformanceReview'],
                requiresApproval: true,
                defaultApproverRoles: ['Manager', 'HR']
            },
            {
                typeCode: 'MILESTONE_EVENT',
                name: 'Milestone Event Bonus',
                description: 'Awarded for reaching significant milestones or completing major projects',
                category: 'Monetary',
                defaultTriggerEvents: ['ProjectCompletion'],
                requiresApproval: true,
                defaultApproverRoles: ['Manager', 'HR']
            },
            {
                typeCode: 'ANNUAL_COMPANY',
                name: 'Annual Company Bonus',
                description: 'Year-end company performance bonus',
                category: 'Monetary',
                defaultTriggerEvents: ['CompanyProfitability'],
                requiresApproval: false,
                defaultApproverRoles: ['Admin']
            },
            {
                typeCode: 'RETENTION_LOYALTY',
                name: 'Retention & Loyalty Bonus',
                description: 'Awarded for long-term commitment and loyalty to the company',
                category: 'Monetary',
                defaultTriggerEvents: ['EmployeeAnniversary'],
                requiresApproval: true,
                defaultApproverRoles: ['HR', 'Admin']
            },
            {
                typeCode: 'REFERRAL_RECRUITMENT',
                name: 'Referral & Recruitment Bonus',
                description: 'Awarded for successful employee referrals',
                category: 'Monetary',
                defaultTriggerEvents: ['SuccessfulReferral'],
                requiresApproval: true,
                defaultApproverRoles: ['HR']
            },
            {
                typeCode: 'INNOVATION_INITIATIVE',
                name: 'Innovation & Initiative Bonus',
                description: 'Awarded for innovative ideas and initiatives',
                category: 'Mixed',
                defaultTriggerEvents: ['InnovationImplemented'],
                requiresApproval: true,
                defaultApproverRoles: ['Manager', 'HR']
            },
            {
                typeCode: 'OVERTIME_CONVERSION',
                name: 'Overtime Conversion Bonus',
                description: 'Convert overtime hours to bonus compensation',
                category: 'Monetary',
                defaultTriggerEvents: ['OvertimeHoursApproved'],
                requiresApproval: true,
                defaultApproverRoles: ['Manager']
            },
            {
                typeCode: 'LEAVE_CONVERSION',
                name: 'Leave Conversion Bonus',
                description: 'Convert unused leave to bonus compensation',
                category: 'LeaveCredit',
                defaultTriggerEvents: ['LeaveBalanceConversion'],
                requiresApproval: true,
                defaultApproverRoles: ['HR']
            },
            {
                typeCode: 'WELLNESS',
                name: 'Wellness Bonus',
                description: 'Awarded for achieving wellness goals and maintaining healthy lifestyle',
                category: 'WellnessBenefit',
                defaultTriggerEvents: ['WellnessGoalAchieved'],
                requiresApproval: false,
                defaultApproverRoles: ['HR']
            },
            {
                typeCode: 'LEARNING_DEVELOPMENT',
                name: 'Learning & Development Bonus',
                description: 'Awarded for completing training programs and certifications',
                category: 'DevelopmentOpportunity',
                defaultTriggerEvents: ['TrainingCertificationCompleted'],
                requiresApproval: true,
                defaultApproverRoles: ['Manager', 'HR']
            },
            {
                typeCode: 'CUSTOMER_FEEDBACK',
                name: 'Customer Feedback Bonus',
                description: 'Awarded for positive customer feedback and satisfaction',
                category: 'Recognition',
                defaultTriggerEvents: ['PositiveCustomerFeedback'],
                requiresApproval: true,
                defaultApproverRoles: ['Manager']
            },
            {
                typeCode: 'CSR_SUSTAINABILITY',
                name: 'CSR & Sustainability Bonus',
                description: 'Awarded for participation in corporate social responsibility activities',
                category: 'NonMonetary_Experience',
                defaultTriggerEvents: ['CSREventParticipation'],
                requiresApproval: false,
                defaultApproverRoles: ['HR']
            },
            {
                typeCode: 'TEAM_BUILDING',
                name: 'Team Building Bonus',
                description: 'Awarded for active participation in team building activities',
                category: 'NonMonetary_Experience',
                defaultTriggerEvents: ['TeamBuildingParticipation'],
                requiresApproval: false,
                defaultApproverRoles: ['Manager']
            },
            {
                typeCode: 'SPOT_MANUAL',
                name: 'Spot Manual Bonus',
                description: 'On-the-spot recognition for immediate achievements',
                category: 'Mixed',
                defaultTriggerEvents: ['ManualAward'],
                requiresApproval: true,
                defaultApproverRoles: ['Manager', 'HR']
            }
        ];

        const createdBonusTypes = await BonusType.insertMany(initialBonusTypes);

        return res.status(201).json({
            success: true,
            message: "Bonus types seeded successfully",
            count: createdBonusTypes.length,
            data: createdBonusTypes
        });
    } catch (error) {
        console.error("Error seeding bonus types:", error);
        return res.status(500).json({
            success: false,
            message: "Error seeding bonus types. Please try again later."
        });
    }
};
