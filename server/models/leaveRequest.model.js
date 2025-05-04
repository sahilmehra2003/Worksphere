// models/leave.model.js
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        index: true 
    },
    leaveType: {
        type: String,
        required: [true, "Leave type is required"],
        enum: {
            values: ['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Compensatory', 'Unpaid'],
            message: '{VALUE} is not a supported leave type'
        }
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"]
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"]
    },
    // Stores the calculated number of WORKING days (excluding weekends/holidays)
    numberOfDays: {
        type: Number,
        required: [true, "Number of leave days calculation failed or is missing"],
        min: [0.5, "Minimum leave duration is a half day (0.5)"] // Allow half-days if applicable
    },
    reason: {
        type: String,
        required: [true, "Reason for leave is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Auto-Rejected'],
        default: 'Pending',
        required: true,
        index: true // Index for querying by status
    },
    rejectionReason: { // Reason provided by manager/HR/system
        type: String,
        trim: true
    },
    approvedBy: { // Who approved the leave
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    approvedAt: { // When the leave was approved
        type: Date
    },
    // You might add more fields like comments, attachments etc. later
}, { timestamps: true }); // Adds createdAt, updatedAt

// Middleware to validate that endDate is not before startDate
leaveSchema.pre('validate', function(next) {
  // Ensure dates exist and are valid Date objects before comparing
  if (this.startDate && this.endDate && (this.startDate instanceof Date && !isNaN(this.startDate)) && (this.endDate instanceof Date && !isNaN(this.endDate))) {
    if (this.startDate > this.endDate) {
      // Create an error object compatible with Mongoose validation
      const err = new Error('Start date must be before or the same as end date.');
      // Attach it to the validation error object if possible, or just pass it
      next(err);
    } else {
      next(); // Dates are valid
    }
  } else if (this.startDate || this.endDate) {
      // If one date exists but maybe isn't valid yet (e.g., during creation before full validation)
      next(new Error('Invalid start or end date object.'))
  }
  else {
    next(); // No dates yet, or validation handled elsewhere
  }
});

// Compound index for efficient overlap checking
leaveSchema.index({ employee: 1, status: 1, startDate: 1, endDate: 1 });
// Index for sorting by creation date
leaveSchema.index({ createdAt: -1 });


const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;