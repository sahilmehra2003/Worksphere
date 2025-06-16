import mongoose from 'mongoose';
const { Schema } = mongoose;

const financialPeriodRecordSchema = new Schema({
  month: {
    type: String,
    required: [true, "Month is required for the financial record."],
    enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },
  year: {
    type: Number,
    required: [true, "Year is required for the financial record."],
    min: [2020, 'Year must be 2020 or later']
  },
  department: { 
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  
  expenses: [{
    type: Schema.Types.ObjectId,
    ref: 'Expense' 
  }],
  revenues: [{
    type: Schema.Types.ObjectId,
    ref: 'Revenue' 
  }],
  
  summary: {
    totalExpenses: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    netProfitOrLoss: { type: Number, default: 0 }
  },
  status: { 
    type: String,
    enum: ['Open', 'ReviewPending', 'Closed', 'Archived'],
    default: 'Open'
  },
  company: { // If you plan for multi-tenancy later
    type: Schema.Types.ObjectId,
    ref: 'Company' 
  },
  
  preparedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  closedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  closingDate: Date,
}, {
  timestamps: true 
});

// Compound index to ensure uniqueness for year, month (and department/company if used)
financialPeriodRecordSchema.index({ year: 1, month: 1, department: 1, company: 1 }, { unique: true });

// Pre-save hook to calculate netProfitOrLoss if summary totals are manually updated
// More robustly, summary fields should be updated by methods that add/remove expenses/revenues.
financialPeriodRecordSchema.pre('save', function (next) {
  if (this.isModified('summary.totalExpenses') || this.isModified('summary.totalRevenue')) {
    this.summary.netProfitOrLoss = (this.summary.totalRevenue || 0) - (this.summary.totalExpenses || 0);
  }
  next();
});

// --- Static Methods ---

// Method to find or create a financial period record
financialPeriodRecordSchema.statics.findOrCreateRecord = async function ({ year, monthName, departmentId = null, companyId = null }) {
  const query = { year, month: monthName };
  if (departmentId) query.department = departmentId;
  if (companyId) query.company = companyId;

  let record = await this.findOne(query);
  if (!record) {
    console.log(`Creating new FinancialPeriodRecord for ${monthName} ${year}`);
    record = await this.create(query); // Defaults will apply for summary, status etc.
  }
  return record;
};



// Method to add an expense and update summary
financialPeriodRecordSchema.methods.addExpenseReference = async function (expenseDoc) {
  if (!this.expenses.includes(expenseDoc._id)) {
    this.expenses.push(expenseDoc._id);
    this.summary.totalExpenses = (this.summary.totalExpenses || 0) + expenseDoc.amount;
    // netProfitOrLoss will be updated by pre-save hook after totals change
    return this.save();
  }
  console.warn(`Expense ${expenseDoc._id} already linked to FinancialPeriodRecord ${this._id}`);
  return this;
};

// Method to add a revenue and update summary
financialPeriodRecordSchema.methods.addRevenueReference = async function (revenueDoc) {
  if (!this.revenues.includes(revenueDoc._id)) {
    this.revenues.push(revenueDoc._id);
    this.summary.totalRevenue = (this.summary.totalRevenue || 0) + revenueDoc.amount;
    return this.save();
  }
  console.warn(`Revenue ${revenueDoc._id} already linked to FinancialPeriodRecord ${this._id}`);
  return this;
};

// (Consider methods for removing expenses/revenues and recalculating totals if needed)


const FinancialPeriodRecord = mongoose.model('FinancialPeriodRecord', financialPeriodRecordSchema);

export default FinancialPeriodRecord;