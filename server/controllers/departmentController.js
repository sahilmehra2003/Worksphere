import Department from '../models/departmentSchema.js'
import Employee from '../models/employeeSchema.js';
import { Revenue } from '../models/revenueSchema.model.js';
import { Expense } from '../models/expenseSchema.model.js';

// Helper function to normalize department data
function normalizeDepartment(department) {
  if (!department) return null;
  const dept = department.toObject ? department.toObject() : department;
  return {
    ...dept,
    netProfit: dept.revenueGenerated - dept.departmentExpense
  };
}

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('departmentHead', 'name email')
      .populate('employees', 'name role')
      .populate('clientsAllocated', 'name company')
      .populate('currentProjects', 'title description')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    const departmentsWithMembers = await Promise.all(departments.map(async (dept) => {
      const totalMembers = await Employee.countDocuments({ department: dept._id });
      return {
        ...normalizeDepartment(dept),
        totalMembers,
        currentProjects: dept.currentProjects || []
      };
    }));

    res.status(200).json({
      success: true,
      data: departmentsWithMembers
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, departmentExpense, status, averageRating, revenueGenerated, employees } = req.body;

    if (!name || averageRating === undefined || revenueGenerated === undefined || !status || !averageRating || departmentExpense === undefined) {
      return res.status(400).json({
        success: false,
        message: "Fill all the required fields",
      });
    }

    const newDepartment = await Department.create({
      name,
      departmentExpense,
      status,
      revenueGenerated,
      employees,
      avgRating: averageRating,
      revenues: [],
      expenses: []
    });

    if (employees && employees.length > 0) {
      await Employee.updateMany(
        { _id: { $in: employees } },
        { $set: { department: newDepartment._id } }
      );
    }

    const populatedDepartment = await Department.findById(newDepartment._id)
      .populate('departmentHead', 'name email')
      .populate('employees', 'name role')
      .populate('clientsAllocated', 'name company')
      .populate('currentProjects', 'title description')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    return res.status(200).json({
      success: true,
      message: "New Department Created",
      department: normalizeDepartment(populatedDepartment),
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const updateData = req.body;

    // If revenues or expenses are being updated, recalculate totals
    if (updateData.hasOwnProperty('revenues') || updateData.hasOwnProperty('expenses')) {
      const department = await Department.findById(id);
      if (department) {
        if (updateData.hasOwnProperty('revenues')) {
          department.revenues = updateData.revenues;
        }
        if (updateData.hasOwnProperty('expenses')) {
          department.expenses = updateData.expenses;
        }
        await department.updateFinancials();
      }
    }

    const updatedDepartmentData = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('departmentHead', 'name email')
      .populate('employees', 'name role')
      .populate('clientsAllocated', 'name company')
      .populate('currentProjects', 'title description')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    if (!updatedDepartmentData) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department: normalizeDepartment(updatedDepartmentData),
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const department = await Department.findById(id)
      .populate("departmentHead", "name email")
      .populate("employees", "name email position")
      .populate("clientsAllocated", "name contactInfo")
      .populate("currentProjects", "title description")
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department: normalizeDepartment(department),
    });
  } catch (error) {
    console.error("Error fetching department by ID:", error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

export const setDepartmentInactive = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const departmentInactive = await Department.findByIdAndUpdate(
      id,
      { status: 'Inactive' },
      { new: true }
    ).populate('departmentHead', 'name email')
      .populate('employees', 'name role')
      .populate('clientsAllocated', 'name company')
      .populate('currentProjects', 'title description')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    return res.status(200).json({
      success: true,
      message: "Department set to inactive successfully",
      department: normalizeDepartment(departmentInactive)
    });
  } catch (error) {
    console.error("Error setting department inactive:", error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

