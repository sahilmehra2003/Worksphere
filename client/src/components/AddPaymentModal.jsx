import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addPaymentToTransaction } from '../redux/Slices/transactionSlice';
import PropTypes from 'prop-types';

const AddPaymentModal = ({ isOpen, onClose, transaction }) => {
    const dispatch = useDispatch();
    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'Bank Transfer',
        reference: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(addPaymentToTransaction({
                transactionId: transaction._id,
                paymentData: {
                    ...paymentData,
                    amount: parseFloat(paymentData.amount)
                }
            })).unwrap();
            onClose();
            setPaymentData({
                amount: '',
                method: 'Bank Transfer',
                reference: '',
                notes: ''
            });
        } catch (error) {
            console.error('Failed to add payment:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={paymentData.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                        <select
                            name="method"
                            value={paymentData.method}
                            onChange={handleChange}
                            required
                            className="w-full border rounded p-2"
                        >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Check">Check</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Reference Number</label>
                        <input
                            type="text"
                            name="reference"
                            value={paymentData.reference}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={paymentData.notes}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            rows="3"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddPaymentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    transaction: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        currency: PropTypes.string
    }).isRequired
};

export default AddPaymentModal; 