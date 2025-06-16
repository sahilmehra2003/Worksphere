import mongoose from "mongoose";

// Client schema
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactPersonName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  latLng: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  clientCreationDate: {
    type: Date,
    default: Date.now
  },
  clientFinishDate: {
    type: Date,
    default: null
  },
  project: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    default: []
  }],
  projectTeam: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectTeam",
    default: []
  }],
  department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: []
    }
  ],
  status: {
    type: Boolean,
    default: false
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
  clientExpenses: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  paymentAfterCompletion: {
    type: Number,
    default: null,
    validate: {
      validator: function (value) {
        if (this.status && (value === null || value <= 0)) {
          return false;
        }
        return true;
      },
      message: "Payment after completion must be a positive number if client status indicates completion/finalization.",
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for net profit/loss
clientSchema.virtual('netProfit').get(function () {
  return this.totalRevenue - this.clientExpenses;
});

// Method to update client totals
clientSchema.methods.updateTotals = async function () {
  const Revenue = mongoose.model('Revenue');
  const Expense = mongoose.model('Expense');

  // Calculate total revenue
  const revenues = await Revenue.find({ _id: { $in: this.revenues } });
  this.totalRevenue = revenues.reduce((sum, rev) => sum + (rev.amount || 0), 0);

  // Calculate total expenses
  const expenses = await Expense.find({ _id: { $in: this.expenses } });
  this.clientExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return this.save();
};

// Pre-save middleware to ensure totals are updated
clientSchema.pre('save', async function (next) {
  if (this.isModified('revenues') || this.isModified('expenses')) {
    await this.updateTotals();
  }
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
