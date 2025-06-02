import mongoose from 'mongoose';

export const BONUS_TYPE_CODES = [
    'PERFORMANCE',           
    'MILESTONE_EVENT',      
    'ANNUAL_COMPANY',       
    'RETENTION_LOYALTY',    
    'REFERRAL_RECRUITMENT',
    'INNOVATION_INITIATIVE',
    'OVERTIME_CONVERSION', 
    'LEAVE_CONVERSION',     
    'WELLNESS',              
    'LEARNING_DEVELOPMENT', 
    'CUSTOMER_FEEDBACK',    
    'CSR_SUSTAINABILITY',   
    'TEAM_BUILDING',       
    'SPOT_MANUAL',          
    'OTHER'                  
];

const bonusTypeSchema = new mongoose.Schema(
    {
        typeCode: {
            type: String,
            required: [true, "Bonus type code is required."],
            enum: BONUS_TYPE_CODES,
            unique: true,
            uppercase: true,
            trim: true
        },
        name: { 
            type: String,
            required: [true, "User-friendly bonus type name is required."],
            trim: true,
            maxlength: [100, "Bonus type name cannot exceed 100 characters."]
          
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters."]
        },
        category: {
            type: String,
            required: [true, "Bonus category is required."],
            enum: [
                'Monetary', 'NonMonetary_Gift', 'NonMonetary_Experience',
                'LeaveCredit', 'WellnessBenefit', 'DevelopmentOpportunity',
                'Recognition', 'Mixed'
            ],
        },
        defaultTriggerEvents: [{
            type: String,
            enum: [
                'PerformanceReview', 'ProjectCompletion', 'CompanyProfitability',
                'EmployeeAnniversary', 'SuccessfulReferral', 'InnovationImplemented',
                'OvertimeHoursApproved', 'LeaveBalanceConversion', 'WellnessGoalAchieved',
                'TrainingCertificationCompleted', 'PositiveCustomerFeedback',
                'CSREventParticipation', 'TeamBuildingParticipation', 'ManualAward'
            ]
        }],
        requiresApproval: {
            type: Boolean,
            default: true
        },
        defaultApproverRoles: [{
            type: String,
            enum: ['Admin', 'HR', 'Manager']
        }],
        isConfigurableByCompany: { 
            type: Boolean,
            default: true
        },
        isActive: { 
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
    }
);


bonusTypeSchema.index({ typeCode: 1 });
bonusTypeSchema.index({ name: 1 }); 
bonusTypeSchema.index({ category: 1 });
bonusTypeSchema.index({ isActive: 1 });


bonusTypeSchema.pre('save', function (next) {
    if (this.isNew && !this.name) {
        this.name = this.typeCode.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) + ' Bonus';
    }
    
    next();
});


const BonusType = mongoose.model('BonusType', bonusTypeSchema);

export default BonusType;