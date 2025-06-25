import mongoose from 'mongoose';
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    checkInTime: {
        type: Date,
        required: true,
    },
    checkOutTime: {
        type: Date,
    },
    totalHours: { 
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: [
            'Present',
            'On Leave',
            'Holiday',
            'Absent',
            'Shortfall', 
            'Pending Approval', 
            'Disputed', 
            'Escalated to HR' 
        ],
        required: true,
        default: 'Present',
    },
    isHalfDay: { 
        type: Boolean,
        default: false,
    },
    notes: { 
        type: String,
        trim: true,
    },
    managerApproval: {
        manager: { type: Schema.Types.ObjectId, ref: 'Employee' },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        comment: { type: String, trim: true },
        approvedAt: Date,
    },
    hrApproval: {
        hrManager: { type: Schema.Types.ObjectId, ref: 'Employee' },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
        },
        comment: { type: String, trim: true },
        approvedAt: Date,
    },
    correctionRequest: {
        requestedData: {
            checkInTime: Date,
            checkOutTime: Date,
        },
        reason: String,
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        }
    },
    finalOutcome: { 
        type: String,
        enum: ['Full Day', 'Half Day', 'Unpaid Leave'],
    },
}, {
    timestamps: true
});

// Compound index to prevent duplicate attendance records for the same employee on the same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

