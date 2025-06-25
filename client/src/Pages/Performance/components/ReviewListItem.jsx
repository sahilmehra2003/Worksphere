import {
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Box,
    Typography,
    Button
} from '@mui/material';
import {
    Person as PersonIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import StatusChip from './StatusChip';

const ReviewListItem = ({ review, onView }) => {
    return (
        <ListItem
            divider
            sx={{
                '&:hover': {
                    backgroundColor: 'action.hover'
                }
            }}
        >
            <ListItemAvatar>
                <Avatar>
                    <PersonIcon />
                </Avatar>
            </ListItemAvatar>

            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1">
                            {review.employee?.name || 'Unknown Employee'}
                        </Typography>
                        <StatusChip status={review.status} />
                    </Box>
                }
                secondary={
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Cycle: {review.reviewCycle?.name} {review.reviewCycle?.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Position: {review.employee?.position || 'Not specified'}
                        </Typography>
                        {review.manager && (
                            <Typography variant="body2" color="text.secondary">
                                Manager: {review.manager?.name || 'Not assigned'}
                            </Typography>
                        )}
                    </Box>
                }
            />

            <Button
                variant="outlined"
                size="small"
                startIcon={<AssignmentIcon />}
                onClick={() => onView(review._id)}
            >
                View Details
            </Button>
        </ListItem>
    );
};

ReviewListItem.propTypes = {
    review: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        employee: PropTypes.shape({
            name: PropTypes.string,
            position: PropTypes.string
        }),
        reviewCycle: PropTypes.shape({
            name: PropTypes.string,
            year: PropTypes.number
        }),
        manager: PropTypes.shape({
            name: PropTypes.string
        })
    }).isRequired,
    onView: PropTypes.func.isRequired
};

export default ReviewListItem; 