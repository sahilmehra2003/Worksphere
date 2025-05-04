
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    departmentHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Reference to the Employee model
      // required: true,
    },
    totalMembers: {
      type: Number,
      default: 0, // Can be computed based on the length of `employees` array
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      required:true
    },
    avgRating: {
      type: Number,
      default: 0, // Average rating for the department
      min: 0,
      max: 5,
      required:true
    },
    budgetAllocated: {
      type: Number,
      default: 0, // Budget in numeric format
      required:true
    },
    revenueGenerated: {
      type: Number,
      default: 0, // Revenue in numeric format
      required:true
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
        ref: 'Client', // Reference to the Client model
      },
    ],
      currentProjects: [
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:'Project'
        }
      ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  
});

departmentSchema.pre("save",function(next){
   this.totalMembers=this.employees.length;
   next();
})

const Department = mongoose.model('Department', departmentSchema);
export default Department