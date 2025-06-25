import { Chip } from '@mui/material';
import {
    Event as EventIcon,
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon
} from '@mui/icons-material';

// eslint-disable-next-line react/prop-types
const StatusChip = ({ status }) => {
    const style = {
        Planned: { icon: <EventIcon />, color: 'default', label: 'Planned' },
        Active: { icon: <CheckCircleIcon />, color: 'success', label: 'Active' },
        Closed: { icon: <BlockIcon />, color: 'error', label: 'Closed' }
    }[status];

    return <Chip icon={style.icon} label={style.label} color={style.color} size="small" />;
};

export default StatusChip; 