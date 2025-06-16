import FinancialPeriodRecord from "../models/financialPeriod.model.js";
import { Expense } from "../models/expenseSchema.model.js";
import { Revenue } from "../models/revenueSchema.model.js";
import { hasPermission } from "../config/permission.config.js";
import mongoose from 'mongoose';
import Client from '../models/clientSchema.js';
import Project from '../models/projectSchema.js';

// Helper function to get month name from date
const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long' });
};

// Helper function to check if user is in Finance department
const isFinanceDepartment = async (userId) => {
    try {
        const user = await mongoose.model('Employee').findById(userId)
            .populate('department');
        return user?.department?.name === 'Finance Department';
    } catch (error) {
        console.error('Error checking department:', error);
        return false;
    }
};

// Helper function to validate expense access
const validateExpenseAccess = async (user) => {
    if (!user) return false;

    // Check if user has permission
    if (!hasPermission(user.role, 'CREATE_EXPENSE')) return false;

    // If user is not in Finance department, they can't create expenses
    if (!await isFinanceDepartment(user._id)) return false;

    return true;
};

// Helper function to validate expense approval
const validateExpenseApproval = async (user) => {
    if (!user) return false;

    // Check if user has permission
    if (!hasPermission(user.role, 'APPROVE_EXPENSE')) return false;

    // If user is in Finance department and is a manager or higher, they can approve
    if (await isFinanceDepartment(user._id) &&
        ['Manager', 'DepartmentHead', 'HR', 'Admin'].includes(user.role)) {
        return true;
    }

    // HR and Admin can approve regardless of department
    if (['HR', 'Admin'].includes(user.role)) return true;

    return false;
};

// Create a new expense
export const createExpense = async (req, res) => {
    try {
        // Validate user access
        if (!await validateExpenseAccess(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to create expenses"
            });
        }

        const expenseData = {
            ...req.body,
            createdBy: req.user._id,
            status: "Pending"
        };

        const expense = new Expense(expenseData);
        await expense.save();

        // Update financial period
        const expenseDate = new Date(expenseData.date);
        const monthName = expenseDate.toLocaleString('default', { month: 'long' });
        const year = expenseDate.getFullYear();

        const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
            year,
            monthName,
            departmentId: expenseData.department
        });

        await financialPeriod.addExpenseReference(expense);

        // Update related documents
        if (expenseData.project) {
            // Update project's expenses array and totalExpenses
            await Project.findByIdAndUpdate(
                expenseData.project,
                {
                    $push: { expenses: expense._id },
                    $inc: { totalExpenses: expenseData.amount }
                }
            );
        }

        if (expenseData.client) {
            // Update client's expenses array and clientExpenses
            await Client.findByIdAndUpdate(
                expenseData.client,
                {
                    $push: { expenses: expense._id },
                    $inc: { clientExpenses: expenseData.amount }
                }
            );
        }

        return res.status(201).json({
            success: true,
            data: expense,
            message: "Expense created successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Create a new revenue
export const createRevenue = async (req, res) => {
    try {
        // Validate user access
        if (!await validateExpenseAccess(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to create revenue entries"
            });
        }

        const revenueData = {
            ...req.body,
            createdBy: req.user._id,
            status: "Expected"
        };

        const revenue = new Revenue(revenueData);
        await revenue.save();

        // Update financial period
        const revenueDate = new Date(revenueData.date);
        const monthName = revenueDate.toLocaleString('default', { month: 'long' });
        const year = revenueDate.getFullYear();

        const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
            year,
            monthName,
            departmentId: revenueData.department
        });

        await financialPeriod.addRevenueReference(revenue);

        // Update related documents
        if (revenueData.project) {
            // Update project's revenues array and revenueGenerated
            await Project.findByIdAndUpdate(
                revenueData.project,
                {
                    $push: { revenues: revenue._id },
                    $inc: { revenueGenerated: revenueData.amount }
                }
            );
        }

        if (revenueData.client) {
            // Update client's revenues array and totalRevenue
            await Client.findByIdAndUpdate(
                revenueData.client,
                {
                    $push: { revenues: revenue._id },
                    $inc: { totalRevenue: revenueData.amount }
                }
            );
        }

        return res.status(201).json({
            success: true,
            data: revenue,
            message: "Revenue created successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Approve an expense
export const approveExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { status, notes } = req.body;

        // Validate user access
        if (!await validateExpenseApproval(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to approve expenses"
            });
        }

        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({
                success: false,
                error: "Expense not found"
            });
        }

        expense.status = status;
        expense.approvedBy = req.user._id;
        expense.approvalDate = new Date();
        if (notes) expense.notes = notes;

        await expense.save();

        return res.status(200).json({
            success: true,
            data: expense,
            message: "Expense status updated successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Approve a revenue
export const approveRevenue = async (req, res) => {
    try {
        const { revenueId } = req.params;
        const { status, notes } = req.body;

        // Validate user access
        if (!await validateExpenseApproval(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to approve revenue entries"
            });
        }

        const revenue = await Revenue.findById(revenueId);
        if (!revenue) {
            return res.status(404).json({
                success: false,
                error: "Revenue entry not found"
            });
        }

        revenue.status = status;
        revenue.approvedBy = req.user._id;
        revenue.approvalDate = new Date();
        if (notes) revenue.notes = notes;

        await revenue.save();

        return res.status(200).json({
            success: true,
            data: revenue,
            message: "Revenue status updated successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get monthly report
export const getMonthlyReport = async (req, res) => {
    try {
        const { year, month, departmentId } = req.query;

        // Validate required parameters
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                error: "Year and month are required"
            });
        }

        const query = { year: parseInt(year), month };
        if (departmentId) {
            query.department = departmentId;
        }

        const period = await FinancialPeriodRecord.findOne(query)
            .populate('expenses')
            .populate('revenues')
            .populate('department', 'name');

        if (!period) {
            return res.status(404).json({
                success: false,
                message: "Financial period not found"
            });
        }

        // Format the response
        const report = {
            year: period.year,
            month: period.month,
            department: period.department?.name,
            summary: period.summary,
            expenses: period.expenses.map(expense => ({
                id: expense._id,
                amount: expense.amount,
                description: expense.description,
                category: expense.category,
                status: expense.status,
                date: expense.date
            })),
            revenues: period.revenues.map(revenue => ({
                id: revenue._id,
                amount: revenue.amount,
                description: revenue.description,
                category: revenue.category,
                status: revenue.status,
                date: revenue.date
            }))
        };

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get department-wise financial summary
export const getDepartmentFinancialSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validate date range
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: "Start date and end date are required"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Invalid date format"
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                error: "Start date must be before end date"
            });
        }

        // Validate user access
        if (!validateExpenseAccess(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to view financial summaries"
            });
        }

        const summary = await FinancialPeriodRecord.aggregate([
            {
                $match: {
                    closingDate: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: "$department",
                    totalExpenses: { $sum: "$summary.totalExpenses" },
                    totalRevenue: { $sum: "$summary.totalRevenue" },
                    netProfit: { $sum: "$summary.netProfitOrLoss" }
                }
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "_id",
                    foreignField: "_id",
                    as: "departmentInfo"
                }
            },
            {
                $unwind: "$departmentInfo"
            },
            {
                $project: {
                    departmentName: "$departmentInfo.name",
                    totalExpenses: 1,
                    totalRevenue: 1,
                    netProfit: 1
                }
            }
        ]);

        // Update department records with new financial data
        const Department = mongoose.model('Department');
        for (const deptSummary of summary) {
            await Department.findByIdAndUpdate(
                deptSummary._id,
                {
                    $set: {
                        departmentExpense: deptSummary.totalExpenses,
                        revenueGenerated: deptSummary.totalRevenue
                    }
                },
                { new: true }
            );
        }

        return res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get financial period summary
export const getFinancialPeriodSummary = async (req, res) => {
    try {
        const { year, month, departmentId } = req.query;

        // Validate required parameters
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                error: "Year and month are required"
            });
        }

        // Validate year format
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 2020) {
            return res.status(400).json({
                success: false,
                error: "Invalid year (must be 2020 or later)"
            });
        }

        // Validate month
        const validMonths = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        if (!validMonths.includes(month)) {
            return res.status(400).json({
                success: false,
                error: "Invalid month"
            });
        }

        // Validate user access
        if (!validateExpenseAccess(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to view financial periods"
            });
        }

        const query = { year: yearNum, month };
        if (departmentId) {
            if (!mongoose.Types.ObjectId.isValid(departmentId)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid department ID"
                });
            }
            query.department = new mongoose.Types.ObjectId(departmentId);
        }

        const period = await FinancialPeriodRecord.findOne(query)
            .populate('expenses')
            .populate('revenues')
            .populate('department', 'name');

        if (!period) {
            return res.status(404).json({
                success: false,
                message: "Financial period not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: period
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update financial period status
export const updateFinancialPeriodStatus = async (req, res) => {
    try {
        const { periodId } = req.params;
        const { status, closedBy } = req.body;

        // Validate period ID
        if (!mongoose.Types.ObjectId.isValid(periodId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid period ID"
            });
        }

        // Validate status
        const validStatuses = ['Open', 'ReviewPending', 'Closed', 'Archived'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Valid status is required"
            });
        }

        // Validate user access for status change
        if (!validateExpenseApproval(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to update financial period status"
            });
        }

        const period = await FinancialPeriodRecord.findById(periodId);
        if (!period) {
            return res.status(404).json({
                success: false,
                message: "Financial period not found"
            });
        }

        period.status = status;
        if (status === 'Closed') {
            if (!closedBy) {
                return res.status(400).json({
                    success: false,
                    error: "closedBy is required when closing a period"
                });
            }
            period.closedBy = closedBy;
            period.closingDate = new Date();
        }

        await period.save();

        return res.status(200).json({
            success: true,
            data: period,
            message: "Financial period status updated successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all financial periods with pagination
export const getAllFinancialPeriods = async (req, res) => {
    try {
        // Validate user access
        if (!validateExpenseAccess(req.user)) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to view financial periods"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate pagination parameters
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                error: "Invalid pagination parameters"
            });
        }

        const skip = (page - 1) * limit;

        const periods = await FinancialPeriodRecord.find()
            .populate('department', 'name')
            .sort({ year: -1, month: -1 })
            .skip(skip)
            .limit(limit);

        const total = await FinancialPeriodRecord.countDocuments();

        return res.status(200).json({
            success: true,
            data: periods,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Add new function to get client financial summary
export const getClientFinancialSummary = async (req, res) => {
    try {
        const { clientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid client ID"
            });
        }

        const client = await Client.findById(clientId)
            .populate('revenues')
            .populate('expenses');

        if (!client) {
            return res.status(404).json({
                success: false,
                error: "Client not found"
            });
        }

        // Calculate totals from populated documents
        const totalRevenue = client.revenues.reduce((sum, rev) => sum + (rev.amount || 0), 0);
        const totalExpenses = client.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        const summary = {
            clientId: client._id,
            clientName: client.name,
            totalRevenue,
            totalExpenses,
            netProfit,
            revenueCount: client.revenues.length,
            expenseCount: client.expenses.length,
            recentTransactions: {
                revenues: client.revenues.slice(-5).map(rev => ({
                    id: rev._id,
                    amount: rev.amount,
                    date: rev.date,
                    category: rev.category,
                    status: rev.status
                })),
                expenses: client.expenses.slice(-5).map(exp => ({
                    id: exp._id,
                    amount: exp.amount,
                    date: exp.date,
                    category: exp.category,
                    status: exp.status
                }))
            }
        };

        return res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
