import Transaction from "../models/transactionSchema.js"; //
// Assuming these are not strictly needed for createTransaction but were in your original file
// import Department from "../models/departmentSchema.js";
// import Project from "../models/projectSchema.js";
// import Client from "../models/clientSchema.js";

// Get all transactions with filtering and pagination (No changes to this function)
export const getAllTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            category,
            status,
            startDate,
            endDate,
            department,
            project,
            client,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        if (type) query.type = type;
        if (category) query.category = category;
        if (status) query.status = status;
        if (department) query.department = department;
        if (project) query.project = project;
        if (client) query.client = client;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('department', 'name')
                .populate('project', 'name')
                .populate('client', 'name')
                .populate('createdBy', 'name')
                .populate('approvedBy', 'name')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalRecords: total
            }
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching transactions",
            error: error.message
        });
    }
};

// Get transaction by ID (No changes to this function)
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('department', 'name')
            .populate('project', 'name')
            .populate('client', 'name')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error("Error fetching transaction by ID:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching transaction by ID",
            error: error.message
        });
    }
};

// Create new transaction (UPDATED FUNCTION)
export const createTransaction = async (req, res) => {
    // 1. Enhanced Logging: Log the incoming request body
    console.log("createTransaction Controller: Received req.body ->", JSON.stringify(req.body, null, 2));

    try {
        const {
            type,
            category,
            amount,
            description,
            date, // Expecting ISO date string or timestamp from client
            status, // Optional, defaults in schema
            paymentMethod,
            referenceNumber, // Optional
            department,      // Optional ObjectId string
            project,         // Optional ObjectId string
            client,          // Optional ObjectId string
            attachments,     // Optional array
            notes            // Optional string
        } = req.body;

        // 2. Explicit Input Validation for required fields
        // (Mongoose will also validate, but this gives earlier, more specific feedback)
        const requiredFields = ['type', 'category', 'amount', 'description', 'date', 'paymentMethod'];
        const missingFields = [];
        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            const message = `Validation Error: Missing required fields: ${missingFields.join(', ')}`;
            console.warn(`createTransaction: ${message}`);
            return res.status(400).json({ // 400 Bad Request
                success: false,
                message: message,
                missingFields: missingFields
            });
        }

        // Basic type validation examples (Mongoose handles more complex enum/min/max)
        if (typeof amount !== 'number' || amount < 0) {
            const message = "Validation Error: Amount must be a non-negative number.";
            console.warn(`createTransaction: ${message}`);
            return res.status(400).json({ success: false, message });
        }
        if (new Date(date).toString() === 'Invalid Date') {
            const message = "Validation Error: Invalid date format provided.";
            console.warn(`createTransaction: ${message}`);
            return res.status(400).json({ success: false, message });
        }


        // Prepare transaction data, ensuring ObjectId fields are null if not provided or invalid
        const transactionData = {
            type,
            category,
            amount,
            description,
            date: new Date(date), // Ensure it's a Date object for Mongoose
            status: status || 'Pending', // Apply default if not provided
            paymentMethod,
            referenceNumber: referenceNumber || undefined, // Set to undefined if empty so it's not stored
            department: department || undefined,
            project: project || undefined,
            client: client || undefined,
            attachments: attachments || [],
            notes: notes || undefined,
            createdBy: req.user._id // Assumes req.user is populated by authN middleware
        };

        // Log data before attempting to save
        console.log("createTransaction Controller: Attempting to create transaction with data ->", JSON.stringify(transactionData, null, 2));

        const transaction = await Transaction.create(transactionData);

        // Log successful creation
        console.log(`createTransaction Controller: Transaction created successfully with ID: ${transaction._id}`);

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: transaction
        });

    } catch (error) {
        console.error("Error creating transaction:", error.message); // Log the full error for server visibility
        console.error("Full error object:", JSON.stringify(error, null, 2));


        // 3. Improved Error Handling for Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({ // 400 Bad Request for client-side validation issues
                success: false,
                message: "Transaction validation failed. Please check your input.",
                errors: validationErrors
            });
        }

        // Generic server error for other types of issues
        res.status(500).json({
            success: false,
            message: "Server Error: Could not create transaction.",
            error: error.message // For development, you might send error.message. In prod, a generic message.
        });
    }
};


// Update transaction (No changes to this function)
export const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({
                success: false,
                message: "Transaction validation failed for update.",
                errors: validationErrors
            });
        }
        res.status(500).json({
            success: false,
            message: "Server Error updating transaction",
            error: error.message
        });
    }
};

// Delete transaction (No changes to this function)
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            // data: transaction // Optionally return the deleted item
        });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({
            success: false,
            message: "Server Error deleting transaction",
            error: error.message
        });
    }
};

// Get monthly report (UPDATED FUNCTION)
export const getMonthlyReport = async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) {
            return res.status(400).json({ success: false, message: "Year is required" });
        }
        const parsedYear = parseInt(year);
        if (isNaN(parsedYear)) {
            return res.status(400).json({ success: false, message: "Invalid year format." });
        }

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(`${parsedYear}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${parsedYear}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    expenses: { $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] } },
                    revenue: { $sum: { $cond: [{ $eq: ["$type", "Revenue"] }, "$amount", 0] } },
                    transactionIds: { $push: "$_id" }
                }
            },
            {
                $project: {
                    _id: 0,
                    monthValue: "$_id.month",
                    year: "$_id.year",
                    expenses: 1,
                    revenue: 1,
                    transactionIds: 1,
                    profit: { $subtract: ["$revenue", "$expenses"] }
                }
            },
            { $sort: { monthValue: 1 } },
            {
                $project: {
                    month: {
                        $let: {
                            vars: {
                                monthsInYear: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                            },
                            in: { $arrayElemAt: ["$$monthsInYear", { $subtract: ["$monthValue", 1] }] }
                        }
                    },
                    expenses: 1,
                    revenue: 1,
                    profit: 1,
                    transactionIds: 1,
                    year: 1
                }
            }
        ]);

        return res.status(200).json({ success: true, data: monthlyData });
    } catch (error) {
        console.error("Error generating monthly report:", error);
        res.status(500).json({ success: false, message: "Server Error generating monthly report", error: error.message });
    }
};


// Get department transactions (No changes to this function)
export const getDepartmentTransactions = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const transactions = await Transaction.find({ department: departmentId })
            .populate('project', 'name')
            .populate('client', 'name')
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error("Error fetching department transactions:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get project transactions (No changes to this function)
export const getProjectTransactions = async (req, res) => {
    try {
        const { projectId } = req.params;
        const transactions = await Transaction.find({ project: projectId })
            .populate('department', 'name')
            .populate('client', 'name')
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error("Error fetching project transactions:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get client transactions (No changes to this function)
export const getClientTransactions = async (req, res) => {
    try {
        const { clientId } = req.params;
        const transactions = await Transaction.find({ client: clientId })
            .populate('department', 'name')
            .populate('project', 'name')
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error("Error fetching client transactions:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Approve transaction (Updated to use PATCH and more specific update)
export const approveTransaction = async (req, res) => {
    try {
        // Assuming only specific fields should be updated on approval
        // and status changes from 'Pending' to 'Completed'
        const transactionToUpdate = await Transaction.findById(req.params.id);

        if (!transactionToUpdate) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        if (transactionToUpdate.status !== 'Pending') {
            return res.status(400).json({ success: false, message: `Transaction is already in '${transactionToUpdate.status}' status and cannot be re-approved.` });
        }

        transactionToUpdate.status = 'Completed'; // Or 'Approved' if that's a distinct step
        transactionToUpdate.approvedBy = req.user._id;
        transactionToUpdate.approvalDate = new Date();

        const updatedTransaction = await transactionToUpdate.save();

        res.status(200).json({
            success: true,
            message: "Transaction approved successfully",
            data: updatedTransaction
        });
    } catch (error) {
        console.error("Error approving transaction:", error);
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({
                success: false,
                message: "Validation error during approval.",
                errors: validationErrors
            });
        }
        res.status(500).json({ success: false, message: "Server Error approving transaction", error: error.message });
    }
};


// Get transaction statistics (No changes to this function)
export const getTransactionStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const stats = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        type: '$type',
                        category: '$category'
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.type',
                    categories: {
                        $push: {
                            category: '$_id.category',
                            total: '$total',
                            count: '$count'
                        }
                    },
                    totalAmount: { $sum: '$total' },
                    totalCount: { $sum: '$count' }
                }
            }
        ]);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error("Error fetching transaction statistics:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get available years (No changes to this function)
export const getAvailableYears = async (req, res) => {
    try {
        const years = await Transaction.aggregate([
            { $group: { _id: { $year: "$date" } } },
            { $project: { _id: 0, year: "$_id" } },
            { $sort: { year: -1 } }
        ]);
        res.status(200).json({ success: true, data: years.map(y => y.year) });
    } catch (error) {
        console.error("Error fetching available years:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
            });
        }

        const transactions = await Transaction.getTransactionsByDateRange(
            new Date(startDate),
            new Date(endDate)
        )
            .populate('department', 'name')
            .populate('project', 'name')
            .populate('client', 'name')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name');

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions by date range:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching transactions by date range",
            error: error.message
        });
    }
};

// Get transactions by status
export const getTransactionsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const transactions = await Transaction.getTransactionsByStatus(status)
            .populate('department', 'name')
            .populate('project', 'name')
            .populate('client', 'name')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name');

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions by status:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching transactions by status",
            error: error.message
        });
    }
};

// Get transactions by payment status
export const getTransactionsByPaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.params;
        const transactions = await Transaction.getTransactionsByPaymentStatus(paymentStatus)
            .populate('department', 'name')
            .populate('project', 'name')
            .populate('client', 'name')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name');

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions by payment status:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching transactions by payment status",
            error: error.message
        });
    }
};

// Get recurring transactions
export const getRecurringTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.getRecurringTransactions()
            .populate('department', 'name')
            .populate('project', 'name')
            .populate('client', 'name')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name');

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching recurring transactions:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching recurring transactions",
            error: error.message
        });
    }
};

// Add payment to transaction
export const addPayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { amount, method, reference, notes } = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // Add payment to history
        transaction.paymentHistory.push({
            amount,
            date: new Date(),
            method,
            reference,
            notes
        });

        // Update payment status
        const totalPaid = transaction.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
        if (totalPaid >= transaction.amount) {
            transaction.paymentStatus = 'Paid';
        } else if (totalPaid > 0) {
            transaction.paymentStatus = 'Partially Paid';
        }

        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Payment added successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Error adding payment:", error);
        res.status(500).json({
            success: false,
            message: "Server Error adding payment",
            error: error.message
        });
    }
};

// Update transaction tags
export const updateTransactionTags = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { tags } = req.body;

        const transaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { tags },
            { new: true, runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction tags updated successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Error updating transaction tags:", error);
        res.status(500).json({
            success: false,
            message: "Server Error updating transaction tags",
            error: error.message
        });
    }
};

// Get transactions by tags
export const getTransactionsByTags = async (req, res) => {
    try {
        const { tags } = req.query;
        if (!tags) {
            return res.status(400).json({
                success: false,
                message: "Tags are required"
            });
        }

        const tagArray = tags.split(',');
        const transactions = await Transaction.find({ tags: { $in: tagArray } })
            .populate('department', 'name')
            .populate('project', 'name')
            .populate('client', 'name')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions by tags:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching transactions by tags",
            error: error.message
        });
    }
};