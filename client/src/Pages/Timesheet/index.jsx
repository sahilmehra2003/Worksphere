import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    CircularProgress,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { fetchMyTimesheets, fetchSubmittedTimesheets, fetchAllTimesheets, deleteTimesheet } from '../../redux/Slices/timeSheetSlice';
import TimesheetList from './components/TimesheetList';
import TimesheetEntryForm from './components/TimesheetEntryForm';

const Timesheet = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState(0);
    const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);

    const {
        myTimesheets,
        submittedTimesheets,
        allTimesheets,
        loading,
        error,
        pagination
    } = useSelector((state) => state.timesheet);

    useEffect(() => {
        loadTimesheets();
    }, [activeTab]);

    const loadTimesheets = async () => {
        try {
            switch (activeTab) {
                case 0:
                    await dispatch(fetchMyTimesheets());
                    break;
                case 1:
                    await dispatch(fetchSubmittedTimesheets());
                    break;
                case 2:
                    await dispatch(fetchAllTimesheets());
                    break;
                default:
                    break;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load timesheets');
        }
    };

    const handleDelete = async (timesheetId) => {
        try {
            await dispatch(deleteTimesheet(timesheetId)).unwrap();
            toast.success('Timesheet deleted successfully');
            loadTimesheets();
        } catch (error) {
            toast.error(error.message || 'Failed to delete timesheet');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getCurrentTimesheets = () => {
        switch (activeTab) {
            case 0:
                return myTimesheets;
            case 1:
                return submittedTimesheets;
            case 2:
                return allTimesheets;
            default:
                return [];
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Timesheets
                </Typography>
                {activeTab === 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsEntryFormOpen(true)}
                    >
                        Add Entry
                    </Button>
                )}
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="My Timesheets" />
                    <Tab label="Submitted Timesheets" />
                    <Tab label="All Timesheets" />
                </Tabs>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            ) : (
                <TimesheetList
                    timesheets={getCurrentTimesheets()}
                    pagination={pagination}
                    onPageChange={(page) => {
                        // Handle pagination
                    }}
                    onDelete={handleDelete}
                />
            )}

            <TimesheetEntryForm
                open={isEntryFormOpen}
                onClose={() => setIsEntryFormOpen(false)}
                onSuccess={() => {
                    setIsEntryFormOpen(false);
                    loadTimesheets();
                    toast.success('Timesheet entry added successfully');
                }}
            />
        </Container>
    );
};

export default Timesheet; 