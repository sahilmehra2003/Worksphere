import mongoose from 'mongoose';
import BonusType from './bonus.model.js';
const { Schema } = mongoose;


const bonusAwardSchema = new mongoose.Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, "Employee is required for a bonus award."],
            index: true,
        },
        bonusType: {
            type: Schema.Types.ObjectId,
            ref: 'BonusType',
            required: [true, "Bonus type is required."],
            index: true,
        },
        awardDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        effectiveDate: {
            type: Date,
            required: [true, "Effective date for the bonus is required."]
        },
        reason: {
            type: String,
            required: [true, "Reason for the bonus award is required."],
            trim: true,
            maxlength: [1000, "Reason cannot exceed 1000 characters."]
        },
        status: {
            type: String,
            required: true,
            enum: [
                'PendingApproval',
                'Approved',
                'Rejected',
                'ProcessingPayment',
                'PaidOut',
                'Delivered',
                'Claimed',
                'Credited',
                'Scheduled',
                'Cancelled'
            ],
            default: 'PendingApproval',
            index: true,
        },

        valueCategory: {// This will be populated based on the linked BonusType's category
            type: String,
            required: true,
            enum: [
                'Monetary', 'NonMonetary_Gift', 'NonMonetary_Experience',
                'LeaveCredit', 'WellnessBenefit', 'DevelopmentOpportunity',
                'Recognition', 'Mixed'
            ]
        },
        monetaryAmount: {
            type: Number,
            min: [0, "Monetary amount cannot be negative."]
        },
        currency: {
            type: String,
            maxlength: [3, "Currency code should be 3 characters (e.g., INR, USD)."],
            uppercase: true,
            trim: true
        },
        nonMonetaryDetails: {
            type: String,
            trim: true,
            maxlength: [1000, "Non-monetary details cannot exceed 1000 characters."]
        },
        leaveDaysGranted: {
            type: Number,
            min: [0, "Leave days cannot be negative."]
        },
        // --- Workflow & Tracking ---
        awardedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            index: true,
        },
        approvalDate: {
            type: Date
        },
        rejectionReason: {
            type: String,
            trim: true
        },
        // --- Integration & Linking ---
        relatedEntityId: {
            type: Schema.Types.ObjectId
        },
        relatedEntityType: {
            type: String,
            enum: [
                'PerformanceReview', 'Project', 'Referral',
                'LeaveConversionRequest', 'TrainingCourse', 'ClientFeedback',
                'OvertimeRecord', 'CSREventLog', 'TeamBuildingEventLog',
                'ManualAward',
                'None'
            ]
        },
        // --- Fulfillment Details (Optional) ---
        paymentDetails: {
            type: String,
            trim: true
        },
        deliveryDetails: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
    }
);

// Pre-save middleware
bonusAwardSchema.pre('save', async function (next) {
    // Populate valueCategory from the linked BonusType document
    if (this.isNew || this.isModified('bonusType')) {
        try {
            const bonusTypeDoc = await BonusType.findById(this.bonusType);

            if (bonusTypeDoc) {
                this.valueCategory = bonusTypeDoc.category;
            } else {
                return next(new Error(`BonusType with ID "${this.bonusType}" not found. Cannot set valueCategory.`));
            }
        } catch (error) {
            console.error("Error fetching BonusType in pre-save hook:", error);
            return next(new Error(`Error fetching BonusType: ${error.message}`));
        }
    }

    // Conditional validation for monetary fields
    if (this.valueCategory === 'Monetary' || this.valueCategory === 'Mixed') {
        if (typeof this.monetaryAmount !== 'number' || this.monetaryAmount < 0) {
            return next(new Error('A valid monetary amount is required for this bonus category.'));
        }
        if (!this.currency || this.currency.length !== 3) {
            return next(new Error('A valid 3-letter currency code is required for monetary bonuses.'));
        }
    } else {
        // If not monetary or mixed, ensure monetary fields are not set or are cleared
        if (this.monetaryAmount != null) this.monetaryAmount = undefined;
        if (this.currency != null) this.currency = undefined;
    }

    // Conditional validation for leaveDaysGranted
    if (this.valueCategory === 'LeaveCredit') {
        if (typeof this.leaveDaysGranted !== 'number' || this.leaveDaysGranted <= 0) {
            return next(new Error('Valid leave days granted (greater than 0) is required for LeaveCredit bonuses.'));
        }
    } else if (this.valueCategory !== 'LeaveCredit' && this.leaveDaysGranted != null) {
        this.leaveDaysGranted = undefined;
    }

    // Conditional validation for nonMonetaryDetails
    const nonMonetaryCategories = ['NonMonetary_Gift', 'NonMonetary_Experience', 'WellnessBenefit', 'DevelopmentOpportunity', 'Recognition'];
    if (nonMonetaryCategories.includes(this.valueCategory) || (this.valueCategory === 'Mixed' && !this.monetaryAmount)) {
        if (!this.nonMonetaryDetails || this.nonMonetaryDetails.trim() === '') {
            return next(new Error('Non-monetary details are required for this bonus category.'));
        }
    }

    // Adjust default status based on whether the bonus type requires approval
    if (this.isNew && this.status === 'PendingApproval') {
        try {
            const bonusTypeDoc = await BonusType.findById(this.bonusType);
            if (bonusTypeDoc && bonusTypeDoc.requiresApproval === false) {
                this.status = 'Approved';
            }
        } catch (error) {
            console.error("Error checking requiresApproval in pre-save hook:", error);
        }
    }

    next();
});


bonusAwardSchema.index({ employee: 1, effectiveDate: -1 });


const BonusAward = mongoose.model('BonusAward', bonusAwardSchema);

export default BonusAward;