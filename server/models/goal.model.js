import mongoose from 'mongoose';

const progressUpdateSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, "A description of the progress made is required."],
        trim: true,
        maxlength: [2000, 'Progress update description cannot exceed 2000 characters.'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    updatedProgress: {
        type: Number,
        required: true,
    }
});

const goalSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
            index: true,
        },
        reviewCycle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ReviewCycle',
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'A goal description is required.'],
            trim: true,
            maxlength: [1000, 'Goal description cannot exceed 1000 characters.'],
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
            default: 'Not Started',
        },
        progress: {
            type: Number,
            min: [0, 'Progress cannot be less than 0.'],
            max: [100, 'Progress cannot exceed 100.'],
            default: 0,
            description: 'The completion percentage of the goal.',
        },
        evidence: [{
            imageUrl: {
                type: String,
                required: true,
            },
            publicId: { 
                type: String,
            }
        }],
        progressUpdates: [progressUpdateSchema], 
        managerComments: [{
            type: String,
            trim: true,
        }],
        hrComments: [{
            type: String,
            trim: true,
        }],
    },

    {
        timestamps: true,
    }
);

// Index for efficient querying of goals for a specific user in a cycle
goalSchema.index({ employee: 1, reviewCycle: 1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
