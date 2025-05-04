import mongoose from 'mongoose';

const reviewCycleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Review cycle name (Q1, Q2, Q3, Q4) is required.'],
            enum: {
                values: ['Q1', 'Q2', 'Q3', 'Q4'],
                message: 'Name must be one of Q1, Q2, Q3, Q4.'
            },
            description: 'The quarter this review cycle represents.'
        },
        year: {
            type: Number,
            required: [true, 'The year for the review cycle is required.'],
            min: [2020, 'Year must be 2020 or later.'], 
            max: [2099, 'Year seems too far in the future.'], 
            description: 'The calendar year this review cycle belongs to.'
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters.'],
            description: 'Optional detailed description (e.g., "Focus on Q1 Goals", "Mid-Year Check-in"). You might use this since the name is now less descriptive.'
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required.'],
            description: 'The date when the review cycle officially begins.'
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required.'],
            validate: [
                function(value) {
                    return this.startDate <= value;
                },
                'End date must be on or after the start date.'
            ],
            description: 'The date when the review cycle officially ends.'
        },
        selfAssessmentDueDate: {
            type: Date,
            validate: [
                function(value) {
                    return !value || (this.startDate <= value && value <= this.endDate);
                },
                'Self-assessment due date must be within the cycle start and end dates.'
            ],
            description: 'Optional deadline for employee self-assessment.'
        },
        managerReviewDueDate: {
            type: Date,
            validate: [
                function(value) {
                    const lowerBound = this.selfAssessmentDueDate || this.startDate;
                    return !value || (lowerBound <= value && value <= this.endDate);
                },
                'Manager review due date must be on or after the self-assessment due date  and within the cycle dates.'
            ],
            description: 'Optional deadline for manager review sections.'
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ['Planned', 'Active', 'Closed'],
                message: 'Status must be either Planned, Active, or Closed.'
            },
            default: 'Planned',
            description: 'The current status of the review cycle (Managed by HR/Admin).'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt automatically
    }
);

// Create a compound unique index on 'name' and 'year'
reviewCycleSchema.index({ name: 1, year: 1 }, { unique: true });

// Optional: Indexing other frequently queried fields
reviewCycleSchema.index({ status: 1, startDate: -1 });

const ReviewCycle = mongoose.model('ReviewCycle', reviewCycleSchema);

export default ReviewCycle;