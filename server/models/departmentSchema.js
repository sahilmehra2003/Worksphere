import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  departmentHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  totalMembers: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: true
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    required: true
  },
  // Financial tracking
  departmentExpense: {
    type: Number,
    default: 0,
    required: true
  },
  revenueGenerated: {
    type: Number,
    default: 0,
    required: true
  },
  // References to financial records
  revenues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Revenue',
    default: []
  }],
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: []
  }],
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
  ],
  clientsAllocated: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  ],
  currentProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectTeam',
    },
  ],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for net profit/loss
departmentSchema.virtual('netProfit').get(function () {
  return this.revenueGenerated - this.departmentExpense;
});

// Pre-save middleware to update total members
departmentSchema.pre("save", function (next) {
  this.totalMembers = this.employees.length;
  next();
});

// Method to update financial totals
departmentSchema.methods.updateFinancials = async function () {
  const Revenue = mongoose.model('Revenue');
  const Expense = mongoose.model('Expense');

  // Calculate total revenue
  const revenues = await Revenue.find({ _id: { $in: this.revenues } });
  this.revenueGenerated = revenues.reduce((sum, rev) => sum + (rev.amount || 0), 0);

  // Calculate total expenses
  const expenses = await Expense.find({ _id: { $in: this.expenses } });
  this.departmentExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return this.save();
};

const Department = mongoose.model('Department', departmentSchema);
export default Department;