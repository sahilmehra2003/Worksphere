import PropTypes from 'prop-types';

const PaymentHistory = ({ transaction }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: transaction.currency || 'USD'
        }).format(amount);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Payment History</h3>

            {transaction.paymentHistory && transaction.paymentHistory.length > 0 ? (
                <div className="space-y-4">
                    {transaction.paymentHistory.map((payment, index) => (
                        <div
                            key={index}
                            className="border-b pb-4 last:border-b-0 last:pb-0"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-medium">
                                        {formatAmount(payment.amount)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(payment.date)}
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                                    {payment.method}
                                </span>
                            </div>

                            {payment.reference && (
                                <p className="text-sm text-gray-600">
                                    Reference: {payment.reference}
                                </p>
                            )}

                            {payment.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {payment.notes}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No payment history available</p>
            )}

            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-medium">
                        {formatAmount(transaction.amount)}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Total Paid:</span>
                    <span className="font-medium">
                        {formatAmount(
                            transaction.paymentHistory?.reduce(
                                (sum, payment) => sum + payment.amount,
                                0
                            ) || 0
                        )}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Remaining Balance:</span>
                    <span className="font-medium">
                        {formatAmount(
                            transaction.amount -
                            (transaction.paymentHistory?.reduce(
                                (sum, payment) => sum + payment.amount,
                                0
                            ) || 0)
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

PaymentHistory.propTypes = {
    transaction: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        currency: PropTypes.string,
        paymentHistory: PropTypes.arrayOf(
            PropTypes.shape({
                amount: PropTypes.number.isRequired,
                date: PropTypes.string.isRequired,
                method: PropTypes.string.isRequired,
                reference: PropTypes.string,
                notes: PropTypes.string
            })
        )
    }).isRequired
};

export default PaymentHistory; 