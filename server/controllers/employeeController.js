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
    const { departmentId } = req.query;
    let query = {};

    // Department filter
    if (departmentId) {
      query.department = departmentId;
    }

    // Regular employees can only see basic info of other employees
    const projection = req.user.role === "Admin" ? {} : {
      name: 1,
      position: 1,
      department: 1,
      email: 1
    };

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .select(projection)
      .lean();

    if (!employees.length) {
      return res.status(404).json({
        success: false,
        message: departmentId 
          ? `No employees found in department ${departmentId}`
          : 'No employees found'
      });
    }

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
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
  try {
    // Only admins can create employees
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can create employees"
      });
    }

    const requiredFields = ['name', 'email', 'phoneNumber', 'city', 'state', 'country', 'department', 'position', 'role'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: req.body.email });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee with this email already exists"
      });
    }

    const newEmployee = await Employee.create(req.body);

    // Update related documents
    const updatePromises = [];
    
    if (req.body.department) {
      updatePromises.push(
        Department.findByIdAndUpdate(
          req.body.department,
          { $push: { employees: newEmployee._id } },
          { new: true }
        )
      );
    }

    if (req.body.currentProjects) {
      updatePromises.push(
        Project.findByIdAndUpdate(
          req.body.currentProjects,
          { $push: { teamMembers: newEmployee._id } },
          { new: true }
        )
      );
    }

    if (req.body.projectTeam) {
      updatePromises.push(
        ProjectTeam.findByIdAndUpdate(
          req.body.projectTeam,
          { $push: { members: newEmployee._id } },
          { new: true }
        )
      );
    }

    await Promise.all(updatePromises);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee
    });

  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create employee',
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
    const { name, position, country, state, city, phoneNumber } = req.body;
    const userId = req.user._id; // Get user ID from authN middleware

    // Validate required fields (email is already part of req.user, name might be too)
    // Name might be updated, but email should typically not change here or be validated against req.user.email
    if (!name || !position || !phoneNumber || !country || !state || !city) {
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
    const {employmentStatus}=req.body
    if (!id) {
       return res.status(400).json({
          success:false,
          message:"Invalid employee id provided"
       })
    }
    if (!employmentStatus) {
       return res.status(400).json({
          success:false,
          message:"Please provide the employment status"
       })
    }
    
    if (!['Terminated','Resigned'].includes(employmentStatus)) {
        return res.status(404).json({
            success:false,
            message:"This controller is to set employee inactive"
        })
    }
    const employeeToCleanup = await Employee.findById(id);
    if (!employeeToCleanup) {
       return res.status(404).json({
          success:false,
          message:"Employee not found"
       })
    }
    if (!['working','pending_approval']) {
       return res.status(404).json({
        
          success:false,
          message:"Employee is already incactive"
       })
    }
    const updateEmployee = await Employee.findByIdAndUpdate(id,{
      employmentStatus:employmentStatus
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