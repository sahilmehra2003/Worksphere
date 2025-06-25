import FinancialPeriodRecord from "../models/financialPeriod.model.js";
import { Expense } from "../models/expenseSchema.model.js";
import { hasPermission } from "../config/permission.config.js";
import mongoose from 'mongoose';
import Client from '../models/clientSchema.js';
import Project from '../models/projectSchema.js';
import Department from "../models/departmentSchema.js";
import Employee from "../models/employeeSchema.js";

// Helper functions (consider moving these to a separate utility file)
const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long' });
};

const isFinanceDepartment = async (userId) => {
    try {
        const user = await mongoose.model('Employee').findById(userId).populate('department');
        return user?.department?.name === 'Finance Department';
    } catch (error) {
        console.error('Error checking department:', error);
        return false;
    }
};

const validateExpenseAccess = async (user) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'CREATE_EXPENSE')) return false;
    if (!await isFinanceDepartment(user._id)) return false;
    return true;
};

const validateExpenseApproval = async (user) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'APPROVE_EXPENSE')) return false;
    if (await isFinanceDepartment(user._id) && ['Manager', 'DepartmentHead', 'HR', 'Admin'].includes(user.role)) {
        return true;
    }
    if (['HR', 'Admin'].includes(user.role)) return true;
    return false;
};

export const createExpense = async (req, res) => {
    try {
        if (!await validateExpenseAccess(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to create expenses"
            });
        }
        const expenseData = { ...req.body, createdBy: req.user._id, status: "Pending" };
        const expense = new Expense(expenseData);
        await expense.save();

        const expenseDate = new Date(expenseData.date);
        const monthName = getMonthName(expenseDate);
        const year = expenseDate.getFullYear();
        const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
            year,
            monthName,
            departmentId: expenseData.department
        });
        await financialPeriod.addExpenseReference(expense);

        if (expenseData.project) {
            await Project.findByIdAndUpdate(expenseData.project, {
                $push: { expenses: expense._id },
                $inc: { totalExpenses: expenseData.amount }
            });
        }
        if (expenseData.client) {
            await Client.findByIdAndUpdate(expenseData.client, {
                $push: { expenses: expense._id },
                $inc: { clientExpenses: expenseData.amount }
            });
        }
        return res.status(201).json({ success: true, data: expense, message: "Expense created successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const createProjectExpense = async (req, res) => {
    try {
        const { projectId, ...expenseDetails } = req.body;
        if (!projectId) {
            return res.status(400).json({ success: false, error: "Project ID is required to create a project expense." });
        }

        // 1. Find the project and populate the client details to get the name for tagging
        const project = await Project.findById(projectId).populate('clientId', 'name');
        if (!project) {
            return res.status(404).json({ success: false, error: "Project not found." });
        }

        // 2. Automatically generate tags based on project and expense details
        const autoTags = [project.name, expenseDetails.category];
        if (project.isInternalProject) {
            autoTags.push("internal");
        } else if (project.clientId) {
            autoTags.push(`${project.clientId.name}`); 
        }

        // Combine auto-generated tags with any tags manually provided in the request
        const finalTags = [...new Set([...autoTags, ...(expenseDetails.tags || [])])];

        // 3. Create the new expense document with the generated tags
        const expense = new Expense({
            ...expenseDetails,
            project: projectId,
            client: project.isInternalProject ? null : project.clientId,
            tags: finalTags, // Add the final tags array
            createdBy: req.user._id,
            status: "Pending"
        });
        await expense.save();

        // 4. Conditionally associate the expense with either the project or the client
        if (project.isInternalProject) {
            await Project.findByIdAndUpdate(projectId, { $push: { expenses: expense._id }, $inc: { totalExpenses: expense.amount } });
            console.log(`Expense ${expense._id} added to internal project ${projectId}`);
        } else {
            if (!project.clientId) {
                return res.status(400).json({ success: false, error: `Project "${project.name}" is a client project but has no client associated with it.` });
            }
            await Client.findByIdAndUpdate(project.clientId._id, { $push: { expenses: expense._id }, $inc: { clientExpenses: expense.amount } });
            console.log(`Expense ${expense._id} added to client ${project.clientId._id} via project ${projectId}`);
        }

        // 5. Update the financial period record
        const expenseDate = new Date(expense.date);
        const monthName = getMonthName(expenseDate);
        const year = expenseDate.getFullYear();
        const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
            year,
            monthName,
            departmentId: expense.department
        });
        await financialPeriod.addExpenseReference(expense);

        // 6. Send response
        return res.status(201).json({ success: true, message: "Project expense created and allocated successfully.", data: expense });

    } catch (error) {
        console.error("Error creating project expense:", error);
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const approveExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { status, notes } = req.body;
        // if (!await validateExpenseApproval(req.user)) {
        //     return res.status(403).json({ success: false, error: "You don't have permission to approve expenses" });
        // }
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ success: false, error: "Expense not found" });
        }
        expense.status = status;
        expense.approvedBy = req.user._id;
        expense.approvalDate = new Date();
        if (notes) expense.notes = notes;
        await expense.save();
        return res.status(200).json({ success: true, data: expense, message: "Expense status updated successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const updateExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const updateData = req.body;

        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ success: false, error: "Expense not found." });
        }

        // --- Handle financial adjustments if amount is changed ---
        if (updateData.amount && updateData.amount !== expense.amount) {
            const amountDifference = updateData.amount - expense.amount;

            // Adjust the total on the associated project or client
            if (expense.project) {
                const project = await Project.findById(expense.project);
                if (project) {
                    if (project.isInternalProject) {
                        await Project.findByIdAndUpdate(expense.project, { $inc: { totalExpenses: amountDifference } });
                    } else if (project.clientId) {
                        await Client.findByIdAndUpdate(project.clientId, { $inc: { clientExpenses: amountDifference } });
                    }
                }
            }
            // Note: Also adjust FinancialPeriodRecord if necessary. This can get complex.
            // A simpler approach for now is to focus on Project/Client totals.
        }

        // Update the expense document with new data
        const updatedExpense = await Expense.findByIdAndUpdate(expenseId, updateData, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json({
            success: true,
            message: "Expense updated successfully.",
            data: updatedExpense
        });

    } catch (error) {
        console.error("Error updating expense:", error);
        return res.status(500).json({ success: false, error: "Server error while updating expense." });
    }
};



export const deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;

        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ success: false, error: "Expense not found." });
        }

        // --- Reverse the financial impact before deleting ---
        if (expense.project) {
            const project = await Project.findById(expense.project);
            if (project) {
                const updateQuery = {
                    $pull: { expenses: expense._id }, // Remove reference from array
                    $inc: { totalExpenses: -expense.amount } // Decrement total
                };
                if (project.isInternalProject) {
                    await Project.findByIdAndUpdate(expense.project, updateQuery);
                } else if (project.clientId) {
                    await Client.findByIdAndUpdate(project.clientId, {
                        $pull: { expenses: expense._id },
                        $inc: { clientExpenses: -expense.amount }
                    });
                }
            }
        } else if (expense.client) {
            await Client.findByIdAndUpdate(expense.client, {
                $pull: { expenses: expense._id },
                $inc: { clientExpenses: -expense.amount }
            });
        }

        // Also remove from financial period record
        await FinancialPeriodRecord.updateMany(
            { expenses: expenseId },
            {
                $pull: { expenses: expenseId },
                $inc: { 'summary.totalExpenses': -expense.amount }
            }
        );

        // Finally, delete the expense document
        await Expense.findByIdAndDelete(expenseId);

        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting expense:", error);
        return res.status(500).json({ success: false, error: "Server error while deleting expense." });
    }
};

export const getDepartmentMonthlySalaryExpense = async (req, res) => {
    try {
        const { departmentId } = req.params;

        // Validate department ID
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid department ID"
            });
        }

        const user = req.user;
        let canView = false;

        if (!user) {
            return res.status(403).json({
                success: false,
                error: "Authentication required to view this report."
            });
        }

        // Rule 1: HR or Admin can view (they have VIEW_FINANCE_REPORTS permission)
        // Rule 2: Managers and Department Heads also have VIEW_FINANCE_REPORTS
        if (hasPermission(user.role, Permissions.VIEW_FINANCE_REPORTS)) {
            canView = true;
        } else if (user.role === 'Employee') {
            // Special case for Employee role: they can view if they belong to the Finance department
            const isFinance = await isFinanceDepartment(user._id);
            if (isFinance) {
                canView = true;
            }
        }

        if (!canView) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to view this department's salary expense."
            });
        }

        // Find all employees in the specified department
        const employees = await Employee.find({ department: departmentId, 'salary.amount': { $exists: true, $ne: null } });

        // Calculate total monthly salary expense
        const totalMonthlySalary = employees.reduce((sum, employee) => {
            return sum + (employee.salary?.amount || 0);
        }, 0);

        // NOTE: This currently sums the 'amount' field directly.
        // If 'salary.amount' is annual, you would divide by 12 here.
        // For monthly payroll, it's assumed 'salary.amount' is the monthly gross.
        // Further tax/deduction calculations would go here if needed.

        return res.status(200).json({
            success: true,
            data: {
                departmentId,
                totalMonthlySalary,
                employeeCount: employees.length,
                currency: employees.length > 0 ? employees[0].salary.currency : 'INR' // Assuming consistent currency
            },
            message: "Department monthly salary expense fetched successfully."
        });

    } catch (error) {
        console.error("Error fetching department monthly salary expense:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const generateMonthlySalaryExpenses = async (startDate, endDate) => {
    try {
        console.log(`Starting monthly salary expense generation for period ${startDate.toISOString()} to ${endDate.toISOString()}...`);
        const departments = await Department.find({}); // Get all departments

        const targetMonthName = startDate.toLocaleString('default', { month: 'long' });
        const targetYear = startDate.getFullYear();

        for (const department of departments) {
            const departmentId = department._id;

            // Check if a "Salaries" expense for this department and current month/year already exists
            const existingExpense = await Expense.findOne({
                department: departmentId,
                category: "Salaries",
                'recurring.isRecurring': true,
                'date': {
                    $gte: new Date(targetYear, startDate.getMonth(), 1), // Start of the target month
                    $lt: new Date(targetYear, startDate.getMonth() + 1, 1) // Start of the next month
                }
            });

            if (existingExpense) {
                console.log(`Salary expense for Department ${department.name} for ${targetMonthName} ${targetYear} already exists. Skipping.`);
                continue; // Skip to the next department
            }

            // Calculate total monthly salary for the department
            const employees = await Employee.find({
                department: departmentId,
                'salary.amount': { $exists: true, $ne: null },
                employmentStatus: 'working' // Only include actively working employees
            });

            const totalMonthlySalary = employees.reduce((sum, employee) => {
                return sum + (employee.salary?.amount || 0);
            }, 0);

            if (totalMonthlySalary > 0) {
                // Determine a suitable 'createdBy' user for automated expense (e.g., an Admin or System user)
                const systemAdmin = await Employee.findOne({ role: 'Admin' });

                if (!systemAdmin) {
                    console.error("No Admin user found to create salary expense. Please ensure an Admin user exists.");
                    continue; // Skip if no admin user
                }

                const newSalaryExpense = new Expense({
                    category: "Salaries",
                    amount: totalMonthlySalary,
                    description: `Monthly salaries for ${department.name} - ${targetMonthName} ${targetYear}`,
                    date: new Date(targetYear, startDate.getMonth(), 1), // Use the first day of the target month for the expense date
                    createdBy: systemAdmin._id,
                    status: "Approved", // Automatically approved as it's a system-generated expense
                    paymentMethod: "Bank Transfer", // Default method
                    paymentStatus: "Paid", // Assume paid if system generated
                    currency: employees.length > 0 ? employees[0].salary.currency : 'INR', // Infer from employees
                    recurring: {
                        isRecurring: true,
                        frequency: 'Monthly',
                        startDate: new Date(targetYear, startDate.getMonth(), 1), // Start of the target month
                        lastProcessedDate: new Date() // Date when it was actually processed
                    },
                    department: departmentId,
                    notes: `System-generated monthly salary expense for ${targetMonthName} ${targetYear}`
                });

                await newSalaryExpense.save();

                // Link to financial period record
                const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
                    year: targetYear,
                    monthName: targetMonthName,
                    departmentId: departmentId
                });
                await financialPeriod.addExpenseReference(newSalaryExpense);

                console.log(`Successfully created monthly salary expense for Department ${department.name}: ${totalMonthlySalary} ${newSalaryExpense.currency}`);
            } else {
                console.log(`No employees with salary found in Department ${department.name}. Skipping salary expense creation.`);
            }
        }
        console.log("Monthly salary expense generation completed.");
        return { success: true, message: "Monthly salary expenses generated." };

    } catch (error) {
        console.error("Error during monthly salary expense generation:", error);
        return { success: false, error: error.message };
    }
};


// This wrapper is for exposing the scheduled task via an API endpoint for manual triggering/testing
export const triggerMonthlySalaryExpenseGeneration = async (req, res) => {
    try {
        const { startDate } = req.body;

        let startOfMonth;
        if (startDate) {
            startOfMonth = new Date(startDate);
            if (isNaN(startOfMonth.getTime())) {
                return res.status(400).json({ success: false, error: "Invalid startDate format. Use YYYY-MM-DD." });
            }
            // Ensure it's the first day of the month for consistency
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0); // Set to start of the day
        } else {
            // Default to the first day of the current month if no startDate is provided
            const now = new Date();
            startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            startOfMonth.setHours(0, 0, 0, 0);
        }

        // Calculate end of the month
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0); // Last day of the month
        endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

        const result = await generateMonthlySalaryExpenses(startOfMonth, endOfMonth);
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: "Monthly salary expenses generated successfully.",
                data: result
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate monthly salary expenses.',
                error: result.error // Pass the specific error message from generateMonthlySalaryExpenses
            });
        }
    } catch (error) {
        console.error("Error triggering monthly salary expense generation:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getPendingExpenses = async (req, res) => {
    try {
        const pendingExpenses = await Expense.find({ status: 'Pending' })
            .populate('createdBy', 'name')
            .populate('project', 'name')
            .populate('department', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: pendingExpenses
        });

    } catch (error) {
        console.error("Error fetching pending expenses:", error);
        return res.status(500).json({
            success: false,
            error: "Server error while fetching pending expenses."
        });
    }
};

export const createRecurringExpense = async (req, res) => {
    try {
        const {
            category,
            amount,
            description,
            frequency,
            startDate,
            endDate,
            departmentId,
            currency,
            tags,
            notes,
            paymentMethod
        } = req.body;

        // 1. --- Validation ---
        if (!category || !amount || !frequency || !startDate || !departmentId) {
            return res.status(400).json({ success: false, error: "Category, amount, frequency, start date, and department are required." });
        }

        // 2. --- Construct the Expense Object ---
        const newRecurringExpense = new Expense({
            category,
            amount: parseFloat(amount),
            description: description || `Recurring expense: ${category}`,
            date: new Date(), // The date the rule is created
            department: departmentId,
            currency: currency || 'INR',
            tags: tags || [],
            notes,
            paymentMethod: paymentMethod || 'Bank Transfer',
            status: 'Pending', // All new recurring rules must be approved
            createdBy: req.user._id,
            recurring: {
                isRecurring: true,
                frequency,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
            },
            // The payment status will be updated when the scheduler runs and creates the actual transaction
            paymentStatus: 'Unpaid'
        });

        // 3. --- Save to Database ---
        await newRecurringExpense.save();

        // 4. --- Link to Financial Period (Optional for recurring rules) ---
        // Note: You might decide not to link the *rule* itself to a financial period,
        // but rather link the *instances* created by the scheduler.
        // For now, we will link the rule's creation to the current period.
        const creationDate = new Date();
        const monthName = creationDate.toLocaleString('default', { month: 'long' });
        const year = creationDate.getFullYear();
        const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
            year,
            monthName,
            departmentId: departmentId
        });
        // We add a reference, but it does not impact the financial summary until an instance is created.
        await financialPeriod.addExpenseReference(newRecurringExpense);


        // 5. --- Send Success Response ---
        return res.status(201).json({
            success: true,
            data: newRecurringExpense,
            message: "Recurring expense rule created successfully. It will await approval."
        });

    } catch (error) {
        console.error("Error creating recurring expense:", error);
        return res.status(500).json({
            success: false,
            error: "Server error while creating recurring expense."
        });
    }
};

export const getRecurringExpenses = async (req, res) => {
    try {
        const recurringExpenses = await Expense.find({ 'recurring.isRecurring': true })
            .populate('department', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: recurringExpenses
        });
    } catch (error) {
        console.error("Error fetching recurring expenses:", error);
        return res.status(500).json({
            success: false,
            error: "Server error while fetching recurring expenses."
        });
    }
};