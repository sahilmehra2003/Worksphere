import PropTypes from 'prop-types';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const WeekNavigator = ({ currentDate, onPreviousWeek, onNextWeek }) => {

    const getWeekRange = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1)); // Adjust to Monday
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center" my={2}>
            <IconButton onClick={onPreviousWeek}>
                <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 2, minWidth: '220px', textAlign: 'center' }}>
                {getWeekRange(currentDate)}
            </Typography>
            <IconButton onClick={onNextWeek}>
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
};

WeekNavigator.propTypes = {
    currentDate: PropTypes.instanceOf(Date).isRequired,
    onPreviousWeek: PropTypes.func.isRequired,
    onNextWeek: PropTypes.func.isRequired
};

export default WeekNavigator;
