import { Chip } from '@mui/material';
import PropTypes from 'prop-types';

const StatusChip = ({ status }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Started':
                return 'default';
            case 'Pending Self-Assessment':
                return 'warning';
            case 'Pending Manager Review':
                return 'info';
            case 'Completed':
                return 'success';
            case 'Closed':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <Chip
            label={status}
            color={getStatusColor(status)}
            size="small"
            variant="outlined"
        />
    );
};

StatusChip.propTypes = {
    status: PropTypes.string.isRequired
};

export default StatusChip; 