import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Revenue', 'Expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Salary',
      'Project Revenue',
      'Client Payment',
      'Office Supplies',
      'Equipment',
      'Software Licenses',
      'Marketing',
      'Training',
      'Maintenance',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Credit Card', 'Cash', 'Check', 'Other'],
    required: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvalDate: {
    type: Date
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
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
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
      default: 'Monthly'
    },
    startDate: Date,
    endDate: Date,
    lastProcessed: Date
  },
  tax: {
    amount: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ['VAT', 'GST', 'Sales Tax', 'Other'],
      default: 'Other'
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  dueDate: Date,
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'],
    default: 'Unpaid'
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    method: String,
    reference: String,
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
transactionSchema.index({ date: -1, type: 1, category: 1 });
transactionSchema.index({ month: 1, year: 1 });
transactionSchema.index({ department: 1, project: 1, client: 1 });
transactionSchema.index({ status: 1, paymentStatus: 1 });
transactionSchema.index({ tags: 1 });
transactionSchema.index({ 'recurring.isRecurring': 1 });

// Virtual for profit/loss calculation
transactionSchema.virtual('isProfit').get(function () {
  return this.type === 'Revenue';
});

// Method to calculate monthly totals
transactionSchema.statics.getMonthlyTotals = async function (month, year) {
  const result = await this.aggregate([
    {
      $match: {
        month: month,
        year: year
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  const totals = {
    revenue: 0,
    expenses: 0,
    profit: 0
  };

  result.forEach(item => {
    if (item._id === 'Revenue') {
      totals.revenue = item.total;
    } else if (item._id === 'Expense') {
      totals.expenses = item.total;
    }
  });

  totals.profit = totals.revenue - totals.expenses;
  return totals;
};

// Method to get transactions by date range
transactionSchema.statics.getTransactionsByDateRange = async function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Method to get transactions by status
transactionSchema.statics.getTransactionsByStatus = async function (status) {
  return this.find({ status }).sort({ date: -1 });
};

// Method to get transactions by payment status
transactionSchema.statics.getTransactionsByPaymentStatus = async function (paymentStatus) {
  return this.find({ paymentStatus }).sort({ date: -1 });
};

// Method to get recurring transactions
transactionSchema.statics.getRecurringTransactions = async function () {
  return this.find({ 'recurring.isRecurring': true }).sort({ date: -1 });
};

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;