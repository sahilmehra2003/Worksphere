import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    fetchTransactionsByDateRange,
    fetchTransactionsByStatus,
    fetchTransactionsByPaymentStatus,
    fetchTransactionsByTags,
    fetchRecurringTransactions
} from '../redux/Slices/transactionSlice';

const TransactionFilters = () => {
    const dispatch = useDispatch();
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: '',
        paymentStatus: '',
        tags: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDateRangeFilter = () => {
        if (filters.startDate && filters.endDate) {
            dispatch(fetchTransactionsByDateRange({
                startDate: filters.startDate,
                endDate: filters.endDate
            }));
        }
    };

    const handleStatusFilter = () => {
        if (filters.status) {
            dispatch(fetchTransactionsByStatus(filters.status));
        }
    };

    const handlePaymentStatusFilter = () => {
        if (filters.paymentStatus) {
            dispatch(fetchTransactionsByPaymentStatus(filters.paymentStatus));
        }
    };

    const handleTagsFilter = () => {
        if (filters.tags) {
            dispatch(fetchTransactionsByTags(filters.tags.split(',').map(tag => tag.trim())));
        }
    };

    const handleRecurringFilter = () => {
        dispatch(fetchRecurringTransactions());
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Transaction Filters</h2>

            {/* Date Range Filter */}
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Date Range</h3>
                <div className="flex gap-4">
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="border rounded p-2"
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="border rounded p-2"
                    />
                    <button
                        onClick={handleDateRangeFilter}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Filter by Date
                    </button>
                </div>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Status</h3>
                <div className="flex gap-4">
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="border rounded p-2"
                    >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={handleStatusFilter}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Filter by Status
                    </button>
                </div>
            </div>

            {/* Payment Status Filter */}
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Payment Status</h3>
                <div className="flex gap-4">
                    <select
                        name="paymentStatus"
                        value={filters.paymentStatus}
                        onChange={handleFilterChange}
                        className="border rounded p-2"
                    >
                        <option value="">Select Payment Status</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                    <button
                        onClick={handlePaymentStatusFilter}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Filter by Payment Status
                    </button>
                </div>
            </div>

            {/* Tags Filter */}
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Tags</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        name="tags"
                        value={filters.tags}
                        onChange={handleFilterChange}
                        placeholder="Enter tags (comma-separated)"
                        className="border rounded p-2 flex-grow"
                    />
                    <button
                        onClick={handleTagsFilter}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Filter by Tags
                    </button>
                </div>
            </div>

            {/* Recurring Transactions Filter */}
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Recurring Transactions</h3>
                <button
                    onClick={handleRecurringFilter}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Show Recurring Transactions
                </button>
            </div>
        </div>
    );
};

export default TransactionFilters; 