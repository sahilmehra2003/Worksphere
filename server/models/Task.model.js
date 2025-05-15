import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required.'],
            trim: true,
            maxlength: [200, 'Task title cannot exceed 200 characters.']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Task description cannot exceed 1000 characters.']
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, 'Task must be assigned to an employee.'],
            index: true 
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            default: null
        },
        deadlineDate: {
            type: Date,
            default: null 
        },
        isCompleted: {
            type: Boolean,
            required: true,
            default: false,
            index: true,
        },

        completedDate: {
            type: Date,
            default: null
        },
        isReopened: {
            type: Boolean,
            default: false, 
            index: true 
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },

        relatedReview: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PerformanceReview',
            default: null
        },

    },
    {
        timestamps: true 
    }
);

taskSchema.index({ assignedTo: 1, isCompleted: 1, deadlineDate: 1 });

// Middleware to automatically set/unset completedDate when isCompleted changes
taskSchema.pre('save', function(next) {

    if (this.isModified('isCompleted') && this.isCompleted && !this.completedDate) {
        this.completedDate = new Date();
    }
    else if (this.isModified('isCompleted') && !this.isCompleted) {
        this.completedDate = null;
    }
    next();
});

// If using findByIdAndUpdate frequently to mark complete, add hook for that too (optional)
taskSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.isCompleted === true && !update.$set.completedDate) {
        update.$set.completedDate = new Date();
    } else if (update.$set && update.$set.isCompleted === false) {
        update.$set.completedDate = null;
    }
    next();
});


const Task = mongoose.model('Task', taskSchema);

export default Task;