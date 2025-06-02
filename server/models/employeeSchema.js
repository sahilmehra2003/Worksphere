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
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
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
    image: {
      type: String,
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
      ref: "Employee",
      default: null,
    },
    client: [
      {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    projectTeam: {

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
        "pending_approval",
      ],
      default: "working",
      index: true,
    },
    workingStatus: {
      type: String,
      enum: [
        "active",
        "onLeave",
        "workFromHome",
      ],
      default: 'active',
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    accessToken: String,
    refreshToken: String,
    accessTokenExpiry: Date,
    refreshTokenExpiry: Date,
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
