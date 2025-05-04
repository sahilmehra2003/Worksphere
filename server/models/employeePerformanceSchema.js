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
 
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
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
            required: [true, 'Manager rating is required.'],
            min: 1,
            max: 5 
        },

   
        strengths: { 
            type: String,
            trim: true
        },
        areasForDevelopment: { 
            type: String,
            trim: true
        },


        clientRating: {
            type: Number,
            min: 1,
            max: 5 
        },
        clientComments: {
             type: String,
             trim: true
        },


        departmentHeadRating: {
            type: Number,
            min: 1,
            max: 5 
        },
         departmentHeadComments: {
             type: String,
             trim: true
        },
        teamHeadRating: { 
            type: Number,
            min: 1,
            max: 5 
        },
         teamLeadComments: { 
             type: String,
             trim: true
        },
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

// Compound index for efficient querying
performanceReviewSchema.index({ employee: 1, reviewCycle: 1 }, { unique: true });

const PerformanceReview = mongoose.model('PerformanceReview', performanceReviewSchema);

export default PerformanceReview;