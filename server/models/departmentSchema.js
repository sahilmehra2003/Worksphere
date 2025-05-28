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
    required: true, 
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
  budgetAllocated: {
    type: Number,
    default: 0, 
    required: true
  },
  revenueGenerated: {
    type: Number,
    default: 0, // Revenue in numeric format
    required: true
  },
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Reference to the Employee model
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
},
  {
    timestamps: true,
  });

departmentSchema.pre("save", function (next) {
  this.totalMembers = this.employees.length;
  next();
})

const Department = mongoose.model('Department', departmentSchema);
export default Department;