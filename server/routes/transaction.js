import express from "express"
import {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyReport,
    getDepartmentTransactions,
    getProjectTransactions,
    getClientTransactions,
    approveTransaction,
    getTransactionStats,
    getAvailableYears
} from "../controllers/transactionController.js"
import { checkPermission } from "../middlewares/permission.middleware.js"
import { checkRole } from '../middlewares/permission.middleware.js'
import { authN } from '../middlewares/auth.js';

const router = express.Router()

// Basic CRUD operations - Admin only
router.get("/transactions", authN, checkPermission('view_transactions'), getAllTransactions)
router.get("/transaction/:id", authN, checkPermission('view_transactions'), getTransactionById)
router.post("/transaction", authN, checkRole(['Admin']), checkPermission('create_transaction'), createTransaction)
router.put("/transaction/:id", authN, checkRole(['Admin']), checkPermission('edit_transaction'), updateTransaction)
router.delete("/transaction/:id", authN, checkRole(['Admin']), checkPermission('delete_transaction'), deleteTransaction)

// Reports and Analytics - Admin and HR only
router.get("/transactions/monthly-report", authN, checkRole(['Admin', 'HR']), checkPermission('view_transaction_reports'), getMonthlyReport)
router.get("/transactions/available-years", authN, checkRole(['Admin', 'HR']), checkPermission('view_transaction_reports'), getAvailableYears)
router.get("/transactions/department/:departmentId", authN, checkPermission('view_transactions'), getDepartmentTransactions)
router.get("/transactions/project/:projectId", authN, checkPermission('view_transactions'), getProjectTransactions)
router.get("/transactions/client/:clientId", authN, checkPermission('view_transactions'), getClientTransactions)

// Approval workflow - Admin only
router.put("/transaction/:id/approve", authN, checkRole(['Admin']), checkPermission('approve_transaction'), approveTransaction)

// Statistics - Admin and HR only
router.get("/transactions/stats", authN, checkRole(['Admin', 'HR']), checkPermission('view_transaction_reports'), getTransactionStats)

export default router