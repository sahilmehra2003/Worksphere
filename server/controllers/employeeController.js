import Employee from "../models/employeeSchema.js";
import Department from "../models/departmentSchema.js";
import Project from "../models/projectSchema.js";
import ProjectTeam from "../models/projectTeamSchema.js";

export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === "Employee" && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only view your own profile"
      });
    }

    const employee = await Employee.findById(id)
      .populate('department', 'name ')
      .populate('currentProjects', 'name status') // Only include necessary project fields
      .populate('projectTeam', 'name') // Only include necessary team fields
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Remove sensitive information for non-admin users
    if (req.user.role !== "Admin") {
      delete employee.salary;
      delete employee.performanceReviews;
      delete employee.sensitiveNotes;
    }

    return res.status(200).json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      department,
      employmentStatus,
      workingStatus,
      sortField = 'name',
      sortDirection = 'asc'
    } = req.query;

    // Build query object
    let query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply filters
    if (role) query.role = role;
    if (department) query.department = department;
    if (employmentStatus) query.employmentStatus = employmentStatus;
    if (workingStatus) query.workingStatus = workingStatus;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Regular employees can only see basic info of other employees
    const projection = req.user?.role === "Admin" ? {} : {
      name: 1,
      role: 1,
      department: 1,
      email: 1,
      employmentStatus: 1,
      workingStatus: 1
    };

    // Execute query with pagination and sorting
    const [employees, totalRecords] = await Promise.all([
      Employee.find(query)
        .populate('department', 'name')
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Employee.countDocuments(query)
    ]);

    if (!employees.length) {
      return res.status(200).json({
        success: true,
        message: 'No employees found matching the criteria',
        data: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalRecords: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecords / parseInt(limit)),
        totalRecords
      }
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createEmployee = async (req, res) => {
  console.log("createEmployee: Received req.body ->", JSON.stringify(req.body, null, 2));
  try {

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can create employees"
      });
    }

    const {
      name, email, password,
      phoneNumber, city, state, country,
      department, position, role, salary,
      manager,
      googleId,
      isProfileComplete,
      employmentStatus,
      workingStatus,
      dateOfBirth,
      emergencyContact

    } = req.body;
    // Enhanced Required Fields Check
    const requiredFields = ['name', 'email', 'phoneNumber', 'city', 'state', 'country', 'position', 'role', 'salary'];
    const missingFields = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        // For salary, we need to check its sub-fields
        if (field === 'salary' && (!salary || salary.amount === undefined || !salary.currency)) {
          missingFields.push('salary (with amount and currency)');
        } else if (field !== 'salary') {
          missingFields.push(field);
        }
      }
    }
    // Password is required only if googleId is not provided
    if (!googleId && !password) {
      missingFields.push('password (required if not signing up with Google)');
    }


    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Specific Salary Structure Validation (already good, but let's ensure it's hit correctly)
    if (!salary || typeof salary.amount !== 'number' || !salary.currency) {
      return res.status(400).json({
        success: false,
        message: "Salary amount (number) and currency (string) are required within the salary object."
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee with this email already exists"
      });
    }

    // Prepare salary sub-document
    const nextReviewDate = new Date();
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);

    const salaryData = {
      amount: salary.amount,
      currency: salary.currency,
      lastReviewDate: salary.lastReviewDate ? new Date(salary.lastReviewDate) : new Date(),
      nextReviewDate: salary.nextReviewDate ? new Date(salary.nextReviewDate) : nextReviewDate,
      reviewHistory: salary.reviewHistory || []
    };

    const employeeData = {
      name,
      email: email.toLowerCase(),
      password,
      googleId,
      phoneNumber,
      city,
      state,
      country: country.toUpperCase(),
      department,
      position,
      manager: manager || null,
      role,
      salary: salaryData,
      isProfileComplete: isProfileComplete !== undefined ? isProfileComplete : true,
      employmentStatus: employmentStatus || undefined,
      workingStatus: workingStatus || undefined,
      isVerified: false,

      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      emergencyContact: emergencyContact || undefined
    };

    console.log("Attempting to create employee with data:", JSON.stringify(employeeData, null, 2));

    const newEmployee = await Employee.create(employeeData);


    if (newEmployee.department) {
      await Department.findByIdAndUpdate(
        newEmployee.department,
        { $addToSet: { employees: newEmployee._id } }
      );

    }


    const populatedEmployee = await Employee.findById(newEmployee._id)
      .populate('department', 'name')
      .populate('manager', 'name email');


    return res.status(201).json({ // 201 Created
      success: true,
      message: "Employee created successfully",
      data: populatedEmployee
    });

  } catch (error) {
    console.error("Error creating employee:", error);
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: "Employee validation failed.",
        errors: validationErrors
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value error. Email or Google ID might already exist.",
        error: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create employee due to server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Authorization check - Employees can only update their own profile
    if (req.user.role === "Employee" && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own profile"
      });
    }

    // Prevent role changes unless admin
    if (req.body.role && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can change roles"
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee
    });

  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const completeExistingUserProfile = async (req, res) => {
  try {
    const { name, position, country, state, city, phoneNumber, image } = req.body;
    const userId = req.user._id; // Get user ID from authN middleware

    // Validate required fields (email is already part of req.user, name might be too)
    // Name might be updated, but email should typically not change here or be validated against req.user.email
    if (!name || !position || !phoneNumber || !country || !state || !city || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, position, country, state, city, and phoneNumber are required.'
      });
    }

    const employeeToUpdate = await Employee.findById(userId);

    if (!employeeToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Cannot complete profile.'
      });
    }

    // Optionally check if profile is already complete
    if (employeeToUpdate.isProfileComplete) {
      // You might allow updates even if complete, or return a specific message
      console.log(`User ${employeeToUpdate.email} profile is already complete but attempting update.`);
    }

    // Update the employee's profile
    employeeToUpdate.name = name; // Allow name update if desired
    employeeToUpdate.position = position;
    employeeToUpdate.country = country;
    employeeToUpdate.state = state;
    employeeToUpdate.city = city;
    employeeToUpdate.phoneNumber = phoneNumber;
    employeeToUpdate.isProfileComplete = true; // Mark profile as complete
    employeeToUpdate.updatedAt = new Date();
    // employeeToUpdate.role = employeeToUpdate.role || 'Employee'; // Role should ideally be set at signup or by admin
    // employeeToUpdate.employmentStatus = employeeToUpdate.employmentStatus || 'working'; // Status might be managed elsewhere

    const updatedEmployee = await employeeToUpdate.save();

    // Remove sensitive data before sending back
    updatedEmployee.password = undefined;
    updatedEmployee.refreshToken = undefined;
    updatedEmployee.refreshTokenExpiry = undefined;


    res.status(200).json({ // 200 OK for update
      success: true,
      message: 'Profile completed/updated successfully',
      user: updatedEmployee // Send back the updated user object
    });

  } catch (err) {
    console.error('Error in completeExistingUserProfile:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error while completing profile.',
      error: err.message
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: currentPassword, newPassword, confirmPassword."
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation password do not match."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long."
      });
    }
    const employeeId = req.user?._id;
    if (!employeeId) {
      console.error("Update Password Error: req.user._id not found after authN.");
      return res.status(401).json({ success: false, message: "Authentication error: User ID not found." });
    }
    const employee = await Employee.findById(employeeId).select("+password");
    if (!employee) {
      console.error(`Update Password Error: Authenticated employee ${employeeId} not found in DB.`);
      return res.status(404).json({ success: false, message: "Authenticated user not found." });
    }

    const isCurrentPasswordCorrect = await employee.matchPassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password."
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password."
      });
    }
    employee.password = newPassword;
    await employee.save();

    console.log(`Password updated successfully for employee ${employee.email}`);
    return res.status(200).json({
      success: true,
      message: "Password updated successfully."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating password.',
      error: error.message
    });
  }
};

export const setEmployeeInactive = async (req, res) => {
  try {
    const { id } = req.params;
    const { employmentStatus } = req.body
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee id provided"
      })
    }
    if (!employmentStatus) {
      return res.status(400).json({
        success: false,
        message: "Please provide the employment status"
      })
    }

    if (!['Terminated', 'Resigned'].includes(employmentStatus)) {
      return res.status(404).json({
        success: false,
        message: "This controller is to set employee inactive"
      })
    }
    const employeeToCleanup = await Employee.findById(id);
    if (!employeeToCleanup) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      })
    }
    if (!['working', 'pending_approval']) {
      return res.status(404).json({

        success: false,
        message: "Employee is already incactive"
      })
    }
    const updateEmployee = await Employee.findByIdAndUpdate(id, {
      employmentStatus: employmentStatus
    }, { new: true, runValidators: true }).select("-password");
    if (!updateEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Remove employee references from related documents
    const updatePromises = [];

    if (updateEmployee.department) {
      updatePromises.push(
        Department.findByIdAndUpdate(
          employeeToCleanup.department,
          { $pull: { employees: id } }
        )
      );
    }

    if (employeeToCleanup.currentProjects && employeeToCleanup.currentProjects.length > 0) {
      // Use updateMany for arrays
      updatePromises.push(
        Project.updateMany(
          { _id: { $in: employeeToCleanup.currentProjects } },
          { $pull: { members: id } }
        )
      );
    }

    if (updateEmployee.projectTeam) {
      updatePromises.push(
        ProjectTeam.findByIdAndUpdate(
          updateEmployee.projectTeam,
          { $pull: { members: id } }
        )
      );
    }

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add new function for salary review
export const reviewSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { newAmount, reason } = req.body;

    // Only HR and Admin can review salaries
    if (!['HR', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only HR and Admin can review salaries"
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const previousAmount = employee.salary.amount;
    const percentageChange = ((newAmount - previousAmount) / previousAmount) * 100;

    // Create new review entry
    const reviewEntry = {
      reviewDate: new Date(),
      previousAmount,
      newAmount,
      percentageChange,
      reviewedBy: req.user._id,
      reason,
      status: "Pending"
    };

    // Update employee salary and review history
    employee.salary.reviewHistory.push(reviewEntry);
    employee.salary.lastReviewDate = new Date();
    employee.salary.nextReviewDate = new Date();
    employee.salary.nextReviewDate.setMonth(employee.salary.nextReviewDate.getMonth() + 6);

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Salary review submitted successfully",
      data: {
        employee: employee._id,
        review: reviewEntry
      }
    });

  } catch (error) {
    console.error("Error reviewing salary:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review salary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add new function to approve/reject salary review
export const updateSalaryReviewStatus = async (req, res) => {
  try {
    const { employeeId, reviewId } = req.params;
    const { status } = req.body;

    // Only HR and Admin can approve/reject salary reviews
    if (!['HR', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only HR and Admin can approve/reject salary reviews"
      });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be either 'Approved' or 'Rejected'"
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Find the review in the history
    const review = employee.salary.reviewHistory.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Salary review not found"
      });
    }

    // Update review status
    review.status = status;

    // If approved, update the actual salary
    if (status === 'Approved') {
      employee.salary.amount = review.newAmount;
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: `Salary review ${status.toLowerCase()} successfully`,
      data: {
        employee: employee._id,
        review
      }
    });

  } catch (error) {
    console.error("Error updating salary review status:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update salary review status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Assign department heads as managers to employees based on their department
 * @route   POST /api/employees/assign-department-heads-as-managers
 * @access  Private (Admin/HR only)
 */
export const assignDepartmentHeadsAsManagers = async (req, res) => {
  try {
    // Only Admin and HR can perform this action
    if (!['Admin', 'HR'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Admin and HR can perform this action.'
      });
    }

    // Get all departments with their department heads
    const departments = await Department.find({
      departmentHead: { $exists: true, $ne: null },
      status: 'Active'
    }).populate('departmentHead', '_id name email');

    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No departments found with assigned department heads.'
      });
    }

    let totalUpdated = 0;
    let totalSkipped = 0;
    const results = [];

    // Process each department
    for (const department of departments) {
      const departmentHeadId = department.departmentHead._id;
      const departmentId = department._id;

      // Find employees in this department who don't have a manager or have a different manager
      const employeesToUpdate = await Employee.find({
        department: departmentId,
        $or: [
          { manager: { $exists: false } },
          { manager: null },
          { manager: { $ne: departmentHeadId } }
        ],
        employmentStatus: 'working' // Only update active employees
      });

      if (employeesToUpdate.length > 0) {
        // Update employees to set department head as their manager
        const updateResult = await Employee.updateMany(
          { _id: { $in: employeesToUpdate.map(emp => emp._id) } },
          { manager: departmentHeadId }
        );

        totalUpdated += updateResult.modifiedCount;
        totalSkipped += employeesToUpdate.length - updateResult.modifiedCount;

        results.push({
          department: department.name,
          departmentHead: department.departmentHead.name,
          employeesUpdated: updateResult.modifiedCount,
          employeesSkipped: employeesToUpdate.length - updateResult.modifiedCount
        });
      } else {
        results.push({
          department: department.name,
          departmentHead: department.departmentHead.name,
          employeesUpdated: 0,
          employeesSkipped: 0,
          message: 'No employees found that need manager assignment'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully assigned department heads as managers to ${totalUpdated} employees.`,
      summary: {
        totalUpdated,
        totalSkipped,
        departmentsProcessed: departments.length
      },
      details: results
    });

  } catch (error) {
    console.error('Error assigning department heads as managers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning department heads as managers.',
      error: error.message
    });
  }
};