import mongoose from "mongoose";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensure email is unique
      lowercase: true, // Store emails consistently in lowercase
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      trim: true,
      index: true, // Index for faster lookups/login
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      }, // Password required only if not a Google signup
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Hide password by default when querying employees
    },
    googleId: {
      // Added for Google OAuth linking
      type: String,
      unique: true,
      sparse: true,
    },
    isProfileComplete: {
      // Added to track profile completion (esp. after OAuth signup)
      type: Boolean,
      default: true, // Assume complete unless set otherwise (e.g., during Google signup)
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"], // Adjust regex if needed
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country code is required"],
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z]{2}$/,
        "Please provide a valid 2-letter uppercase country code (ISO 3166-1 alpha-2)",
      ],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Self-reference
      default: null,
    },
    client: [
      {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    projectTeam: {
      // Assigned project team (if applicable)
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectTeam",
      default: null,
    },
    currentProjects: [
      {
  
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    role: {
      type: String,
      enum: [
        "TeamHead",
        "Employee",
        "DepartmentHead",
        "HR",
        "Manager",
        "Admin",
      ],
      default: "Employee",
      required: true,
    },
    employmentStatus: {
      type: String,
      enum: [
        "working",
        "resigned",
        "terminated",
        "on_leave",
        "pending_verification",
      ], 
      default: "working",
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpires: {
      type: Date,
    },

    dateOfBirth: { type: Date },
    emergencyContact: { name: String, phone: String, relation: String },
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

employeeSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
