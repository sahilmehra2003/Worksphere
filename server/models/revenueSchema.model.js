import { model, Schema } from 'mongoose';

// Helper function for word count (already provided by you)
const countWords = (str) => {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
};

export const revenueSchema = new Schema({
    category: {
        type: String,
        required: true,
        enum: [
            "Project Revenue",
            "Client Payment",
            "Service Fees",
            "Product Sales",
            "Interest Income",
            "Refund Received",
            "Other Income",
            "Software Licensed"
        ],
        default: "Client Payment",
    },
    amount: {
        type: Number,
        required: [true, "Revenue amount is required."],
        min: [0, "Amount cannot be negative"]
    },
    date: {
        type: Date,
        required: [true, "Date of revenue is required."],
        default: Date.now,
    },
    description: {
        type: String,
        required: [true, "Description is required."],
        trim: true,
        validate: {
            validator: function (value) {
                return countWords(value) >= 3;
            },
            message: props => `Description ("${props.value}") must be at least 3 words long.`
        }
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, "Client is required for revenue entries."]
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
    },

    status: {
        type: String,
        enum: ['Expected', 'Received', 'Partially Received', 'Overdue', 'Cancelled'],
        default: 'Expected'
    },
    receivedMethod: {
        type: String,
        enum: ['Bank Transfer', 'Credit Card', 'Cash', 'Check', 'Online Payment Gateway', 'Other'],
        required: function () { return this.status === 'Received' || this.status === 'Partially Received'; }
    },
    referenceNumber: {
        type: String,
        trim: true,
        unique: true,
        sparse: true  // Allows multiple nulls if not provided, but if provided, must be unique
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },

    approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    approvalDate: { type: Date },
    attachments: [{ 
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    recurringRevenue: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: [null, 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
            default: null
        },
        startDate: Date,
        endDate: Date,
        lastGeneratedDate: Date,
    },
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
        enum: ["USD", "EUR", "GBP", "INR"],
        default: "INR"
    },
    exchangeRate: {
        type: Number,
        default: 1
    },
    dueDate: Date,
    paymentHistory: [{
        amountReceived: { type: Number, required: true },
        paymentDate: { type: Date, required: true, default: Date.now },
        method: String,
        reference: String,
        notes: String
    }]
}, {
    timestamps: true,
});

// --- Indexes ---
revenueSchema.index({ date: -1, category: 1 });
revenueSchema.index({ client: 1, date: -1 });
revenueSchema.index({ project: 1 });
revenueSchema.index({ department: 1 });
revenueSchema.index({ status: 1 });
revenueSchema.index({ 'recurringRevenue.isRecurring': 1, 'recurringRevenue.lastGeneratedDate': 1 });
revenueSchema.index({ createdBy: 1 });

revenueSchema.path('receivedMethod').validate(function (value) {
    if (this.status === 'Received' || this.status === 'Partially Received') {
        return !!value; // Must have a receivedMethod if status indicates payment
    }
    return true;
}, 'Received method is required when status is Received or Partially Received.');

revenueSchema.path('recurringRevenue.startDate').validate(function (value) {
    if (this.recurringRevenue && this.recurringRevenue.isRecurring) {
        return !!value;
    }
    return true;
}, 'Start date is required for recurring revenue.');

revenueSchema.path('recurringRevenue.frequency').validate(function (value) {
    if (this.recurringRevenue && this.recurringRevenue.isRecurring) {
        return !!value;
    }
    return true;
}, 'Frequency is required for recurring revenue.');

export const Revenue = model('Revenue', revenueSchema);