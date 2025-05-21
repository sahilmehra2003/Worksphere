import PropTypes from 'prop-types';
import { Chip } from '@mui/material';

const TimesheetStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return {
                    label: 'Approved',
                    color: 'success',
                };
            case 'rejected':
                return {
                    label: 'Rejected',
                    color: 'error',
                };
            case 'pending':
                return {
                    label: 'Pending',
                    color: 'warning',
                };
            case 'draft':
                return {
                    label: 'Draft',
                    color: 'default',
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'default',
                };
        }
    };

    const { label, color } = getStatusConfig(status);

    return (
        <Chip
            label={label}
            color={color}
            size="small"
            sx={{ textTransform: 'capitalize' }}
        />
    );
};

TimesheetStatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
};

export default TimesheetStatusBadge; 