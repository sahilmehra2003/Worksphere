import PropTypes from 'prop-types';
import {
    Typography, Box, Modal, Grid, Card, CardContent,
    IconButton, Chip, Alert
} from '@mui/material';
import {
    Close as CloseIcon
} from '@mui/icons-material';

const BonusDetailsModal = ({ open, onClose, award }) => {
    if (!award) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'PendingApproval': return 'warning';
            case 'ProcessingPayment': return 'info';
            case 'PaidOut': return 'success';
            case 'Delivered': return 'success';
            case 'Claimed': return 'success';
            case 'Credited': return 'success';
            case 'Scheduled': return 'info';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount, currency) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR'
        }).format(amount);
    };

    const getStatusDescription = (status) => {
        switch (status) {
            case 'PendingApproval': return 'Awaiting manager approval';
            case 'Approved': return 'Bonus has been approved';
            case 'Rejected': return 'Bonus request was rejected';
            case 'ProcessingPayment': return 'Payment is being processed';
            case 'PaidOut': return 'Payment has been completed';
            case 'Delivered': return 'Non-monetary bonus has been delivered';
            case 'Claimed': return 'Bonus has been claimed by employee';
            case 'Credited': return 'Leave credits have been added';
            case 'Scheduled': return 'Bonus is scheduled for future delivery';
            case 'Cancelled': return 'Bonus has been cancelled';
            default: return 'Unknown status';
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="bonus-details-modal"
            aria-describedby="bonus-details-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '80%', md: '70%' },
                maxWidth: 800,
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 0,
                overflow: 'hidden'
            }}>
                {/* Modal Header */}
                <Box sx={{
                    p: 3,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText'
                }}>
                    <Typography variant="h5" component="h2">
                        Bonus Award Details
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{ color: 'primary.contrastText' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Modal Content */}
                <Box sx={{ p: 3, overflow: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Basic Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Bonus Type
                                            </Typography>
                                            <Typography variant="body1">
                                                {award.bonusType?.name}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Type Code
                                            </Typography>
                                            <Typography variant="body1">
                                                {award.bonusType?.typeCode}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Category
                                            </Typography>
                                            <Chip
                                                label={award.bonusType?.category}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Status
                                            </Typography>
                                            <Chip
                                                label={award.status}
                                                color={getStatusColor(award.status)}
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Value Details */}
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Value Details
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {award.valueCategory === 'Monetary' && (
                                            <>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Amount
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="bold">
                                                        {formatCurrency(award.monetaryAmount, award.currency)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Currency
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {award.currency}
                                                    </Typography>
                                                </Grid>
                                            </>
                                        )}
                                        {award.valueCategory === 'LeaveCredit' && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Leave Days Granted
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {award.leaveDaysGranted} days
                                                </Typography>
                                            </Grid>
                                        )}
                                        {award.valueCategory !== 'Monetary' && award.valueCategory !== 'LeaveCredit' && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Details
                                                </Typography>
                                                <Typography variant="body1">
                                                    {award.nonMonetaryDetails || 'No details provided'}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Dates and Timeline */}
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Timeline
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Award Date
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(award.awardDate)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Effective Date
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(award.effectiveDate)}
                                            </Typography>
                                        </Grid>
                                        {award.approvalDate && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Approval Date
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatDate(award.approvalDate)}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Reason and Notes */}
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Reason & Notes
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Reason for Bonus
                                            </Typography>
                                            <Typography variant="body1">
                                                {award.reason}
                                            </Typography>
                                        </Grid>
                                        {award.notes && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Additional Notes
                                                </Typography>
                                                <Typography variant="body1">
                                                    {award.notes}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {award.rejectionReason && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Rejection Reason
                                                </Typography>
                                                <Typography variant="body1" color="error">
                                                    {award.rejectionReason}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Status Description */}
                        <Grid item xs={12}>
                            <Alert severity="info">
                                <Typography variant="body2">
                                    {getStatusDescription(award.status)}
                                </Typography>
                            </Alert>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Modal>
    );
};

BonusDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    award: PropTypes.object
};

export default BonusDetailsModal; 