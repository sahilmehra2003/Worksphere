import mongoose from 'mongoose';

const performanceReviewSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
            index: true
        },
        reviewCycle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ReviewCycle',
            required: true,
            index: true
        },
        // ADDED: An array to hold references to the goals for this cycle
        goals: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Goal'
        }],
        status: {
            type: String,
            enum: [
                'Not Started',
                'Pending Self-Assessment',
                'Pending Manager Review',
                'Completed',
                'Closed'
            ],
            default: 'Not Started',
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        selfAssessmentComments: {
            type: String,
            trim: true
        },
        managerComments: {
            type: String,
            trim: true
        },
        managerRating: {
            type: Number,
            min: 1,
            max: 5
        },
        strengths: [{
            type: String,
            trim: true
        }],
        areasForDevelopment: [{
            type: String,
            trim: true
        }],
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

performanceReviewSchema.index({ employee: 1, reviewCycle: 1 }, { unique: true });

const PerformanceReview = mongoose.model('PerformanceReview', performanceReviewSchema);

export default PerformanceReview;
