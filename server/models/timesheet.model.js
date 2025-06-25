import mongoose from 'mongoose';
const { Schema } = mongoose;

const timeLogSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        index: true,
    },
    // Link to the specific attendance record for the day
    attendance: {
        type: Schema.Types.ObjectId,
        ref: 'Attendance',
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task', 
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
  
    weekStartDate: {
        type: Date,
        required: true,
        index: true,
    },
    hours: {
        type: Number,
        required: true,
        min: 0.1,
        max: 24,
    },
    notes: { 
        type: String,
        trim: true,
        required: true,
    },
    approval: {
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        manager: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        approvedAt: {
            type: Date,
        },
    },
    // Flag for HR intervention if needed
    isFlagged: {
        type: Boolean,
        default: false,
    },
    flaggedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
    },
    flagReason: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true
});

// Compound index to speed up fetching a specific employee's logs for a specific week
timeLogSchema.index({ employee: 1, weekStartDate: 1 });

// Index to help find pending approvals for a manager
timeLogSchema.index({ 'approval.manager': 1, 'approval.status': 1 });


const TimeLog = mongoose.model('TimeLog', timeLogSchema);

export default TimeLog;
