import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Abandoned', 'Not Assigned'],
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  teamId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectTeam',
    default: []
  }], // Empty if no team is assigned
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  // References to related revenues and expenses
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
  // Keep these fields for quick access to totals
  revenueGenerated: {
    type: Number,
    required: true,
    default: 0
  },
  isInternalProject: {
    type: Boolean,
    default: false
  },
  totalExpenses: {
    type: Number,
    default: 0,
    validate: {
      validator: function (value) {
        if (this.status === "Completed" && typeof value !== "number") {
          return false
        }
        if (this.status !== "Completed" && value !== null) {
          return false
        }
        return true;
      },
      message: "Value must be null in case project status is not completed"
    }
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for net profit/loss
projectSchema.virtual('netProfit').get(function () {
  return this.revenueGenerated - (this.totalExpenses || 0);
});

// Method to update project totals
projectSchema.methods.updateTotals = async function () {
  const Revenue = mongoose.model('Revenue');
  const Expense = mongoose.model('Expense');

  // Calculate total revenue
  const revenues = await Revenue.find({ _id: { $in: this.revenues } });
  this.revenueGenerated = revenues.reduce((sum, rev) => sum + (rev.amount || 0), 0);

  // Calculate total expenses
  const expenses = await Expense.find({ _id: { $in: this.expenses } });
  this.totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return this.save();
};

// Pre-save middleware to ensure totals are updated
projectSchema.pre('save', async function (next) {
  if (this.isModified('revenues') || this.isModified('expenses')) {
    await this.updateTotals();
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project

