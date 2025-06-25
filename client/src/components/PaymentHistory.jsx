import PropTypes from 'prop-types';
import { Box, Typography, Paper, Divider, Chip, Stack, Grow, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';


const PaymentHistory = ({ transaction, onClose }) => {
    const theme = useTheme();

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatAmount = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: transaction.currency || 'INR', maximumFractionDigits: 2 }).format(amount);

    const paymentMethodIcons = {
        'Bank Transfer': <AccountBalanceWalletIcon fontSize="small" />,
        'Credit Card': <CreditCardIcon fontSize="small" />,
        'Cash': <PaymentsIcon fontSize="small" />,
        'Check': <PaymentsIcon fontSize="small" />,
        'Online Payment Gateway': <CreditCardIcon fontSize="small" />,
        'Other': <PaymentsIcon fontSize="small" />,
    };

    const totalPaid = transaction.paymentHistory?.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0) || 0;
    const remainingBalance = transaction.amount - totalPaid;

    return (
        <Grow in={true}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Payment History
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {transaction.paymentHistory && transaction.paymentHistory.length > 0 ? (
                    <Stack spacing={3}>
                        {transaction.paymentHistory.map((payment, index) => (
                            <Box key={index}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 500 }}>{formatAmount(payment.amountPaid)}</Typography>
                                        <Typography variant="body2" color="text.secondary">{formatDate(payment.paymentDate)}</Typography>
                                    </Box>
                                    <Chip icon={paymentMethodIcons[payment.method]} label={payment.method} variant="outlined" size="small" />
                                </Stack>
                                {payment.reference && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Reference: {payment.reference}</Typography>}
                                {payment.notes && <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>&quot;{payment.notes}&quot;</Typography>}
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>No payment history available.</Typography>
                )}

                <Box mt={4} pt={3} borderTop={1} borderColor="divider">
                    <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between"><Typography variant="body1" sx={{ fontWeight: 500 }}>Total Amount:</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{formatAmount(transaction.amount)}</Typography></Stack>
                        <Stack direction="row" justifyContent="space-between"><Typography variant="body1" color="text.secondary">Total Paid:</Typography><Typography variant="body1" color={theme.palette.success.main} sx={{ fontWeight: 'bold' }}>{formatAmount(totalPaid)}</Typography></Stack>
                        <Divider light />
                        <Stack direction="row" justifyContent="space-between"><Typography variant="body1" sx={{ fontWeight: 'bold' }}>Remaining Balance:</Typography><Typography variant="h6" color={remainingBalance > 0 ? theme.palette.error.main : theme.palette.primary.main} sx={{ fontWeight: 'bold' }}>{formatAmount(remainingBalance)}</Typography></Stack>
                    </Stack>
                </Box>
            </Paper>
        </Grow>
    );
};

PaymentHistory.propTypes = {
    transaction: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PaymentHistory;
