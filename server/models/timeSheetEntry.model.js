import mongoose from 'mongoose';

const timesheetEntrySchema = new mongoose.Schema(
    {
        timesheet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Timesheet', 
            required: [true, "Timesheet entry must belong to a timesheet."],
            index: true
        },
        employee: {
            // Denormalized from parent Timesheet for easier querying of entries by employee
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true, // Ensure consistency
            index: true
        },
        date: {
            // The specific calendar date this entry applies to
            type: Date,
            required: [true, "Date is required for timesheet entry."],
            index: true
            // Note: Validation that this date falls within the parent Timesheet's week
            // should ideally be handled in the controller logic before saving.
        },
        hours: {
            type: Number,
            required: [true, 'Hours are required for a timesheet entry.'],
            min: [0.1, 'Hours logged must be positive.'], // Smallest unit loggable (e.g., 6 mins). Adjust as needed. Set to 0 if logging 0 hours is valid.
            max: [24, 'Cannot log more than 24 hours in a single entry for a single day.']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters.'],
            required: [true, 'A brief description of the work performed is required.'] // Recommended
        },
        // Optional: Link to Project/Client/Task
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project', // Assuming you have a Project model
            default: null,
            index: true // Index if filtering by project is common
        },
        client: {
            // You might derive this from the linked Project, or allow direct linking
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client', // Assuming you have a Client model
            default: null,
            index: true
        },
        task: { // Optional link to a specific task from your Task model
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null,
            index: true
        }
    },
    {
        timestamps: true // Adds createdAt, updatedAt
    }
);


timesheetEntrySchema.index({ timesheet: 1, date: 1 });




const TimesheetEntry = mongoose.model('TimesheetEntry', timesheetEntrySchema);

export default TimesheetEntry;