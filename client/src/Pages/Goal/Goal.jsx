import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Paper,
    Tabs,
    Tab,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { createGoal, getGoalsByEmployeeId, getGoals } from '../../redux/Slices/goalSlice';
import { fetchAllReviewCycles } from '../../redux/Slices/reviewCycleSlice';
import { fetchAllEmployeesInternal } from '../../redux/Slices/employeeSlice';
import {
    GoalFormModal,
    GoalListTab
} from './components';

const GoalPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [activeCycleId, setActiveCycleId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const { user, token } = useSelector(state => state.auth);
    const { reviewCycles, loadingList } = useSelector(state => state.reviewCycle);
    const { employees, loading: employeesLoading } = useSelector(state => state.employee);
    const { operationSuccess } = useSelector(state => state.goal);
    const dispatch = useDispatch();

    // Fetch review cycles when the component mounts
    useEffect(() => { if (token) { dispatch(fetchAllReviewCycles({ token })); } }, [dispatch, token]);

    // Fetch all employees for Team Goals tab
    useEffect(() => {
        if (activeTab === 1 && token) {
            dispatch(fetchAllEmployeesInternal({ page: 1, limit: 100 }));
        }
    }, [activeTab, dispatch, token]);

    // Find the active cycle from the fetched list
    useEffect(() => {
        if (reviewCycles && reviewCycles.length > 0) {
            const activeCycle = reviewCycles.find(cycle => cycle.status === 'Active');
            if (activeCycle) {
                setActiveCycleId(activeCycle._id);
            } else {
                setActiveCycleId(null);
            }
        }
    }, [reviewCycles]);

    // Re-fetch goals for the current user if a goal is created successfully
    useEffect(() => {
        if (operationSuccess && activeCycleId && user?._id && token) {
            if (activeTab === 0) {
                dispatch(getGoalsByEmployeeId({ empId: user._id, token }));
            } else if (activeTab === 1 && selectedEmployeeId) {
                dispatch(getGoals({ reviewCycleId: activeCycleId, employeeId: selectedEmployeeId, token }));
            }
        }
    }, [operationSuccess, activeCycleId, user, token, dispatch, activeTab, selectedEmployeeId]);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);
    const handleCreateGoal = (goalData) => {
        if (!activeCycleId) return;
        dispatch(createGoal({ goalData: { ...goalData, reviewCycleId: activeCycleId }, token }));
    };

    // For Team Goals, handle employee selection
    const handleEmployeeChange = (event) => {
        setSelectedEmployeeId(event.target.value);
    };

    const tabs = [];
    tabs.push({ label: 'My Goals', icon: <PersonIcon />, component: <GoalListTab mode="my" employeeId={user._id} reviewCycleId={activeCycleId} /> });
    tabs.push({
        label: 'Team Goals', icon: <GroupIcon />, component: (
            <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="employee-select-label">Select Employee</InputLabel>
                    <Select
                        labelId="employee-select-label"
                        value={selectedEmployeeId}
                        label="Select Employee"
                        onChange={handleEmployeeChange}
                        disabled={employeesLoading}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {employees && employees.map(emp => (
                            <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {selectedEmployeeId && <GoalListTab mode="team" employeeId={selectedEmployeeId} reviewCycleId={activeCycleId} />}
            </>
        )
    });

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Goals</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)} disabled={!activeCycleId}>Create New Goal</Button>
            </Box>

            {loadingList ? (
                <Alert severity="info">Loading review cycles...</Alert>
            ) : !activeCycleId ? (
                <Alert severity="warning">No active review cycle found. You cannot create goals.</Alert>
            ) : null}

            <Paper elevation={2} sx={{ mt: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                        {tabs.map((tab, i) => <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" />)}
                    </Tabs>
                </Box>
                {tabs[activeTab] && tabs[activeTab].component}
            </Paper>
            <GoalFormModal open={isCreateModalOpen} handleClose={() => setCreateModalOpen(false)} onSave={handleCreateGoal} />
        </Box>
    );
};

export default GoalPage;
