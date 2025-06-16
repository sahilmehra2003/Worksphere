import express from 'express'
import {
    createExpense,
    createRevenue,
    approveExpense,
    approveRevenue,
    getDepartmentFinancialSummary,
    getFinancialPeriodSummary,
    updateFinancialPeriodStatus,
    getAllFinancialPeriods,
    getMonthlyReport
} from '../controllers/transactionController.js';
import { authN } from '../middlewares/auth.js'

const router = express.Router();

// Expense routes
router.post('/expenses', authN, createExpense);
router.patch('/expenses/:expenseId/approve', authN, approveExpense);

// Revenue routes
router.post('/revenues', authN, createRevenue);
router.patch('/revenues/:revenueId/approve', authN, approveRevenue);

// Financial period routes
router.get('/periods', authN, getAllFinancialPeriods);
router.get('/periods/summary', authN, getFinancialPeriodSummary);
router.patch('/periods/:periodId/status', authN, updateFinancialPeriodStatus);

// Reports routes
router.get('/reports/monthly', authN, getMonthlyReport);
router.get('/reports/department-summary', authN, getDepartmentFinancialSummary);

export default router;