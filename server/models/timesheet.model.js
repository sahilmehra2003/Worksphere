import mongoose from 'mongoose';
const timesheetSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, "Timesheet must belong to an employee."],
            index: true
        },
        weekStartDate: {
            type: Date,
            required: [true, "Week start date is required."],
            index: true,
            validate: {
                validator: function(value) {
                    return value.getUTCDay() === 1; 
                },
                message: 'Week start date must be a Monday.' 
            }
        },
        status: {
            type: String,
            enum: {
                values: ['Draft', 'Submitted', 'Approved', 'Rejected'],
                message: 'Invalid timesheet status `{VALUE}`.' 
            },
            required: true,
            default: 'Draft',
            index: true
        },
        totalHours: {
            type: Number,
            default: 0,
            min: [0, 'Total hours cannot be negative.']
        },

        submittedDate: {
            type: Date,
            default: null
        },

        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            default: null
        },

        processedDate: {
            type: Date,
            default: null
        },

        rejectionReason: {
            type: String,
            trim: true,
            maxlength: [500, 'Rejection reason cannot exceed 500 characters.'],
            required: [
                function() { return this.status === 'Rejected'; }, 
                'Rejection reason is required when rejecting a timesheet.'
            ]
        },

        managerComments: { 
            type: String,
            trim: true,
            maxlength: [1000, 'Manager comments cannot exceed 1000 characters.']
        },
        employeeComments: {
            type: String,
            trim: true,
            maxlength: [1000, 'Employee comments cannot exceed 1000 characters.']
        },
    },
    {
        timestamps: true 
    }
);


timesheetSchema.index({ employee: 1, weekStartDate: 1 }, { unique: true });
timesheetSchema.index({ employee: 1, status: 1 });


timesheetSchema.pre('save', function(next) {
    // If status changed to Submitted and submittedDate isn't already set
    if (this.isModified('status') && this.status === 'Submitted' && !this.submittedDate) {
        this.submittedDate = new Date();
    }
    if (this.isModified('status') && ['Approved', 'Rejected'].includes(this.status) && !this.processedDate) {
         this.processedDate = new Date();
    }
  
     if (this.isModified('status') && this.status !== 'Rejected') {
         this.rejectionReason = undefined; // Use undefined to remove the field if not set
     }
    next();
});


timesheetSchema.pre('findOneAndUpdate', function(next) {
    // 'this' refers to the query object
    const update = this.getUpdate(); // Get the update operations, e.g., { $set: { status: 'Approved', ... } }

    // Ensure $set is being used, as other operators might need different handling
    if (!update.$set) {
        return next();
    }

    const newStatus = update.$set.status; // Get the new status being set

    // If status is being changed
    if (newStatus) {
        // Set submittedDate if status becomes Submitted and date isn't already being set
        if (newStatus === 'Submitted' && !update.$set.hasOwnProperty('submittedDate')) {
            update.$set.submittedDate = new Date();
        }

        // Set processedDate if status becomes Approved or Rejected and date isn't already being set
        if (['Approved', 'Rejected'].includes(newStatus) && !update.$set.hasOwnProperty('processedDate')) {
            update.$set.processedDate = new Date();
            // NOTE: 'processedBy' must still be set explicitly in the controller's update call,
            // as middleware doesn't have access to req.user here.
        }

        // If status is changing TO something other than 'Rejected'
        if (newStatus !== 'Rejected') {
            // If rejectionReason is not being explicitly set in this same update...
             if (!update.$set.hasOwnProperty('rejectionReason')) {
                 // ...ensure it gets cleared using $unset
                 if (!update.$unset) update.$unset = {}; // Initialize $unset if needed
                 update.$unset.rejectionReason = ""; // Value for $unset doesn't matter
            }
            // Note: This doesn't prevent setting a reason when status is NOT Rejected.
            // Schema validation handles requiring reason *when* status IS Rejected.
        }
    }

    next(); // Continue with the update operation
});

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

export default Timesheet;
