import { model, Schema } from 'mongoose';

// Helper function for word count
const countWords = (str) => {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length; 
};

export const expenseSchema = new Schema({
    category: {
        type: String,
        required: true,
        enum: [
            "Salaries",
            "Software Subscriptions",
            "Office Supplies",
            "Marketing",
            "Project Expenses",
            "Client Expenses",
            "Miscellaneous",
            "Bonuses"

        ]
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"]
    },
    description: {
        type: String,
        required: true,
        trim: true, 
        validate: {
            validator: function (value) {
                return countWords(value) >= 3;
            },
            message: props => `Description ("${props.value}") must be at least 3 words long.`
        }
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
    },
    status: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Rejected",
        ],
        default: "Pending"
    },
    paymentMethod: {
        type: String,
        enum: [
            "Cash",
            "Credit Card",
            "Bank Transfer",
            "Check",
            "Other"
        ],
        default: "Bank Transfer", 
        required: true,
    },
    referenceNumber: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    paymentStatus: {
        type: String,
        enum: [
            'Unpaid',
            'Partially Paid', 
            'Paid',
            'Overdue'        
        ],
        default: "Unpaid",
    },
    paymentHistory: [{ 
        amountPaid: { type: Number, required: true }, 
        paymentDate: { type: Date, required: true, default: Date.now }, 
        method: {
            type: String, required: true, enum:
                [
                    "Cash",
                    "Credit Card",
                    "Bank Transfer",
                    "Check",
                    "Other"
                ],
        }, 
        reference: String,
        notes: String
    }],
    tax: {
        amount: {
            type: Number,
            default: 0,
            min: [0, "Tax amount cannot be negative"]
        },
        rate: {
            type: Number,
            default: 0,
            min: [0, "Tax rate cannot be negative"],
            max: [100, "Tax rate cannot exceed 100"]
        },
        type: {
            type: String,
            enum: ['VAT', 'GST', 'Sales Tax', 'Other', 'None'], 
            default: 'None' 
        }
    },
    currency: {
        type: String,
        required: [true, "Currency is required."],
        enum: [
            "USD",
            "EUR",
            "GBP",
            "INR",
            "Other"
        ],
        default: "INR" 
    },
    attachments: [{
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: String, 
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    recurring: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: [null, 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'], 
            default: null 
        },
        startDate: { 
            type: Date,
           
        },
        endDate: Date,
        lastProcessedDate: Date 
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department'
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },
    notes: {
        type: String,
        trim: true
    },


}, {
    timestamps: true
});

// Custom validator for recurring.startDate
expenseSchema.path('recurring.startDate').validate(function (value) {
    if (this.recurring && this.recurring.isRecurring) {
        return !!value; // Must have a startDate if it's a recurring expense
    }
    return true; // Not required if not recurring
}, 'Start date is required for recurring expenses.');

// Custom validator for recurring.frequency
expenseSchema.path('recurring.frequency').validate(function (value) {
    if (this.recurring && this.recurring.isRecurring) {
        return !!value;
    }
    return true;
}, 'Frequency is required for recurring expenses.');


// Suggested Indexes for the new fields
expenseSchema.index({ date: -1, category: 1 });
expenseSchema.index({ department: 1 });
expenseSchema.index({ project: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ paymentStatus: 1 });
expenseSchema.index({ tags: 1 });
expenseSchema.index({ 'recurring.isRecurring': 1, 'recurring.lastProcessedDate': 1 }); 
expenseSchema.index({ createdBy: 1 });


export const Expense = model('Expense', expenseSchema);