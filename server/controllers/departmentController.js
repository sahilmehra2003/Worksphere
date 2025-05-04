import Department from '../models/departmentSchema.js'
import Employee from '../models/employeeSchema.js';
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('departmentHead', 'name email') 
      .populate('employees', 'name role') 
      .populate('clientsAllocated', 'name company') 
      .populate('currentProjects', 'title description'); 

    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};



// { departmentId, name, departmentHead, totalMembers, budgetAllocated, status, averageRating, totalRevenueGenerated }

export const createDepartment = async (req, res) => {
  try {
    const { name, budgetAllocated, status, averageRating, revenueGenerated, employees } = req.body;

    // Check for missing required fields
    if (!name || !budgetAllocated || !status || !averageRating || !revenueGenerated) {
      return res.status(400).json({
        success: false,
        message: "Fill all the required fields",
      });
    }

    // Create the new department
    const newDepartment = await Department.create({
      name: name,
      budgetAllocated: budgetAllocated,
      status: status,
      revenueGenerated: revenueGenerated,
      employees: employees,
      avgRating: averageRating,
    });

    // Update employees' department reference
    if (employees && employees.length > 0) {
      await Employee.updateMany(
        { _id: { $in: employees } }, // Find employees with IDs in the 'employees' array
        { $set: { department: newDepartment._id } } // Set their department reference to the new department ID
      );
    }

    return res.status(200).json({
      success: true,
      message: "New Department Created",
      department: newDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error in creating new Department, ${error}`,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    // Update department data
    const updatedDepartmentData = await Department.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // Returns the updated document and runs schema validators
    );

    if (!updatedDepartmentData) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department: updatedDepartmentData,
    });
  } catch (error) {
    console.error("Error updating department:", error); // Log error for debugging
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};
// get department by id
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    // Find department with references populated
    const department = await Department.findById(id)
      .populate("departmentHead", "name email") // Populate department head details
      .populate("employees", "name email position") // Populate employees details
      .populate("clientsAllocated", "name contactInfo") // Populate clients details
      .populate("currentProjecs", "title description"); // Populate project details

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    console.error("Error fetching department by ID:", error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

// delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    // Check if the department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Delete the department
    const deletedDepartment = await Department.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Department deleted successfully and references updated",
      deleteDepartment:deletedDepartment
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

