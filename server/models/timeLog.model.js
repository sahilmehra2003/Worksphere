import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, "Log must belong to an employee."],
            index: true // Quickly find logs for a specific employee
        },
        clockInTime: {
            type: Date,
            required: [true, "Clock-in time is required."]
        },
        clockOutTime: {
            type: Date,
            default: null // Null until the user clocks out
        },
        // Stores the specific calendar date (at UTC midnight) this work log pertains to.
        // Derived from clockInTime for easy daily queries.
        workDate: {
            type: Date,
            required: true,
            index: true // Quickly find logs for a specific date
        },
        // Stores the calculated duration in minutes for this log entry.
        // Calculated and set when clocking out.
        durationMinutes: {
            type: Number,
            default: 0,
            min: 0
        },
        // Tracks the state of this specific entry. Mostly for internal logic.
        status: {
            type: String,
            enum: ['ClockedIn', 'ClockedOut'],
            required: true,
            default: 'ClockedIn',
            index: true // Quickly find currently ClockedIn entries
        },
       
        notes: { 
            type: String,
            trim: true,
            maxlength: [500, "Notes cannot exceed 500 characters."]
        }
    },
    {
        timestamps: true 
    }
);


timeLogSchema.index({ employee: 1, workDate: 1 });

timeLogSchema.index({ employee: 1, status: 1 });


// --- Middleware ---
// Automatically set the 'workDate' field to the start of the UTC day
// based on the 'clockInTime' whenever a new log is created or clockInTime changes.
timeLogSchema.pre('save', function(next) {
    // 'this' refers to the document being saved
    if (this.isNew || this.isModified('clockInTime')) {
        const clockIn = this.clockInTime;
        // Ensure workDate is set to midnight UTC of the clock-in day
        this.workDate = new Date(Date.UTC(clockIn.getUTCFullYear(), clockIn.getUTCMonth(), clockIn.getUTCDate()));
    }
    next();
});


const TimeLog = mongoose.model('TimeLog', timeLogSchema);

export default TimeLog;