import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { getGoals, getGoalsByEmployeeId } from '../../../redux/Slices/goalSlice';
import GoalListItem from './GoalListItem';

// eslint-disable-next-line react/prop-types
const GoalListTab = ({ mode = 'my', employeeId, reviewCycleId }) => {
    const dispatch = useDispatch();
    const { goals, loading, error } = useSelector((state) => state.goal);
    const { token, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (mode === 'my') {
            const empId = employeeId || user?._id;
            if (empId && token) {
                dispatch(getGoalsByEmployeeId({ empId, token }));
            }
        } else if (mode === 'team') {
            if (employeeId && reviewCycleId && token) {
                dispatch(getGoals({ reviewCycleId, employeeId, token }));
            }
        }
    }, [dispatch, mode, employeeId, user, token, reviewCycleId]);

    // Debug output
    console.log('Goals to render:', goals);

    return (
        <Box sx={{ p: 2 }}>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                goals && goals.length > 0
                    ? goals.map(goal => <GoalListItem key={goal._id} goal={goal} />)
                    : <Typography>No goals found.</Typography>
            )}
        </Box>
    );
};

export default GoalListTab; 