import FinancialPeriodRecord from "../models/financialPeriod.model.js";
import { Expense } from "../models/expenseSchema.model.js";
import { Revenue } from "../models/revenueSchema.model.js";
import { hasPermission } from "../config/permission.config.js";
import mongoose from 'mongoose';
import Client from '../models/clientSchema.js';

import Department from "../models/departmentSchema.js";
import Employee from "../models/employeeSchema.js";


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

export const getAvailableYears = async (req, res) => {
    try {
        const years = await FinancialPeriodRecord.distinct('year');

        // If no years are found, return an empty array.
        if (!years || years.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No years with financial data found."
            });
        }

        
        const sortedYears = years.sort((a, b) => b - a);

        return res.status(200).json({
            success: true,
            data: sortedYears
        });

    } catch (error) {
        console.error("Error fetching available years:", error);
        return res.status(500).json({
            success: false,
            error: "Server error while fetching available years."
        });
    }
};

export const updateFinancialPeriod = async (req, res) => {
    try {
        const { periodId } = req.params;
        const updateData = req.body;

        const period = await FinancialPeriodRecord.findByIdAndUpdate(
            periodId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!period) {
            return res.status(404).json({ success: false, message: "Financial period not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Financial period updated successfully.",
            data: period
        });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};



export const deleteFinancialPeriod = async (req, res) => {
    try {
        const { periodId } = req.params;

        const period = await FinancialPeriodRecord.findByIdAndUpdate(
            periodId,
            { isDelete: true },
            { new: true }
        );

        if (!period) {
            return res.status(404).json({ success: false, message: "Financial period not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Financial period deleted successfully."
        });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
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



export const getAnnualTransactions = async (req, res) => {
    try {
        const { year } = req.query;

        // 1. Validate input
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            return res.status(400).json({ success: false, error: "Valid year (e.g., 2023) is required." });
        }

        // 2. Permission check: Only users with VIEW_FINANCE_REPORTS can access this
        const user = req.user;
        if (!user) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to view annual transaction reports."
            });
        }

        // Define the date range for the entire year
        const startDate = new Date(yearNum, 0, 1); // January 1st of the specified year
        const endDate = new Date(yearNum + 1, 0, 1); // January 1st of the next year (exclusive)

        // 3. Fetch all expenses and revenues for the specified year
        const annualExpenses = await Expense.find({
            date: { $gte: startDate, $lt: endDate }
        })
            .populate('department', 'name')
            .populate('project', 'title')
            .populate('client', 'name')
            .populate('createdBy', 'name');

        const annualRevenues = await Revenue.find({
            date: { $gte: startDate, $lt: endDate }
        })
            .populate('department', 'name')
            .populate('project', 'title')
            .populate('client', 'name')
            .populate('createdBy', 'name');

        // 4. Aggregate summary information
        const totalAnnualExpenses = annualExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const totalAnnualRevenues = annualRevenues.reduce((sum, rev) => sum + (rev.amount || 0), 0);
        const annualNetProfit = totalAnnualRevenues - totalAnnualExpenses;

        return res.status(200).json({
            success: true,
            data: {
                year: yearNum,
                summary: {
                    totalAnnualExpenses,
                    totalAnnualRevenues,
                    annualNetProfit
                },
                expenses: annualExpenses.map(exp => ({
                    _id: exp._id,
                    category: exp.category,
                    amount: exp.amount,
                    description: exp.description,
                    date: exp.date,
                    status: exp.status,
                    department: exp.department ? { _id: exp.department._id, name: exp.department.name } : null,
                    project: exp.project ? { _id: exp.project._id, title: exp.project.title } : null,
                    client: exp.client ? { _id: exp.client._id, name: exp.client.name } : null,
                    createdBy: exp.createdBy ? { _id: exp.createdBy._id, name: exp.createdBy.name } : null,
                    type: 'expense'
                })),
                revenues: annualRevenues.map(rev => ({
                    _id: rev._id,
                    category: rev.category,
                    amount: rev.amount,
                    description: rev.description,
                    date: rev.date,
                    status: rev.status,
                    client: rev.client ? { _id: rev.client._id, name: rev.client.name } : null,
                    project: rev.project ? { _id: rev.project._id, title: rev.project.title } : null,
                    department: rev.department ? { _id: rev.department._id, name: rev.department.name } : null,
                    createdBy: rev.createdBy ? { _id: rev.createdBy._id, name: rev.createdBy.name } : null,
                    type: 'revenue'
                }))
            },
            message: `Annual transaction data for ${yearNum} fetched successfully.`
        });

    } catch (error) {
        console.error("Error fetching annual transactions:", error);
        return res.status(500).json({
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



export const getPendingFinancialPeriodReports = async (req, res) => {
    try {
        const pendingFinancialPeriodReport = await FinancialPeriodRecord.find({
            status: { $in: ['ReviewPending', 'Open'] }
        })
            .populate('preparedBy', 'name')
            .populate('project', 'name')
            .populate('department', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message:'Pending Financial Period Reports',
            data: pendingFinancialPeriodReport
        });
    } catch (error) {
        console.error("Error fetching pending financial period reports:", error);
        return res.status(500).json({
            success: false,
            error: "Server error while fetching pending expenses."
        });
    }
}



