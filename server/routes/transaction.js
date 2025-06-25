import express from 'express'
import {
    updateFinancialPeriod,
    deleteFinancialPeriod,
    getDepartmentFinancialSummary,
    getFinancialPeriodSummary,
    updateFinancialPeriodStatus,
    getAllFinancialPeriods,
    getMonthlyReport,
    getAnnualTransactions,
    getAvailableYears,
    getPendingFinancialPeriodReports
} from '../controllers/transactionController.js';
import {
    createRevenue,
    approveRevenue,
    createProjectRevenue,
    getPendingRevenues
} from '../controllers/revenue.controller.js';
import {
    createExpense,
    approveExpense,
    updateExpense,
    deleteExpense,
    createProjectExpense,
    triggerMonthlySalaryExpenseGeneration,
    getDepartmentMonthlySalaryExpense,
    getPendingExpenses,
    createRecurringExpense,
    getRecurringExpenses
} from '../controllers/expense.controller.js';
import { authN, isAdmin } from '../middlewares/auth.js'
import { Permissions } from '../config/permission.config.js';
import { checkPermission } from '../middlewares/permission.middleware.js';


const router = express.Router();


// ** Financial period routes
router.get('/periods', authN, getAllFinancialPeriods);
router.get('/periods/summary', authN, getFinancialPeriodSummary);
router.patch('/periods/:periodId/status', authN, updateFinancialPeriodStatus);
router.get('/periods/annual', authN, checkPermission(Permissions.VIEW_FINANCE_REPORTS), getAnnualTransactions);
router.put('/periods/:periodId', authN, checkPermission(Permissions.MANAGE_FINANCIAL_PERIODS), updateFinancialPeriod);
router.delete('/periods/:periodId', authN, checkPermission(Permissions.MANAGE_FINANCIAL_PERIODS), deleteFinancialPeriod); 

router.get('/reports/monthly', authN, getMonthlyReport);
router.get('/reports/department-summary', authN, getDepartmentFinancialSummary);
router.get('/reports/get-pending-financial-period-report',authN,checkPermission(Permissions.APPROVE_TRANSACTION),getPendingFinancialPeriodReports)
router.get('/available-years', authN, getAvailableYears);


// department financial summary

router.get('/reports/department-salary-expense/:departmentId', authN, getDepartmentMonthlySalaryExpense);



// **  Expense Route

router.post('/expenses', authN, createExpense);
router.patch('/expenses/:expenseId/approve', authN, approveExpense); 
router.put('/expenses/:expenseId', authN, checkPermission(Permissions.MANAGE_TRANSACTIONS), updateExpense);
router.delete('/expenses/:expenseId', authN, checkPermission(Permissions.MANAGE_TRANSACTIONS), deleteExpense);
router.post('/expenses/create-project-expense', authN, checkPermission(Permissions.MANAGE_TRANSACTIONS), createProjectExpense);
router.get('/expenses/get-pending-expenses', authN, checkPermission(Permissions.VIEW_TRANSACTIONS), getPendingExpenses);
router.post('/expenses/recurring/create', checkPermission(Permissions.VIEW_TRANSACTIONS), createRecurringExpense);
router.get('/expenses/recurring/fetch', authN, checkPermission(Permissions.VIEW_TRANSACTIONS), getRecurringExpenses);

//  monthly salary expense generation 
router.post('/expenses/generate-monthly-salaries', authN, isAdmin, triggerMonthlySalaryExpenseGeneration);



// ** Revenue Routes
router.post('/revenue', authN, createRevenue);
router.patch('/revenue/:revenueId/approve', authN, approveRevenue);
router.post('/revenue/create-project-revenue', authN, checkPermission(Permissions.MANAGE_TRANSACTIONS), createProjectRevenue);
router.get('/revenue/get-pending-revenue', authN, checkPermission(Permissions.VIEW_TRANSACTIONS), getPendingRevenues)
router.put('revenue/:revenueId', authN, checkPermission(Permissions.MANAGE_TRANSACTIONS), updateExpense);
router.delete('revenue/:revenueId', authN, checkPermission(Permissions.MANAGE_TRANSACTIONS), deleteExpense);

export default router;