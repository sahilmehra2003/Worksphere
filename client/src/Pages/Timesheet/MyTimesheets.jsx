import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TimesheetList from './components/TimesheetList';
import {
    fetchMyTimesheets,
    deleteTimesheet,
    approveTimesheet,
    rejectTimesheet,
    fetchTimesheetById
} from '../../redux/Slices/timeSheetSlice';
import TimesheetViewModal from './components/TimesheetViewModal';
import TimesheetEditModal from './components/TimesheetEditModal';

const MyTimesheets = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myTimesheets, loading, error } = useSelector((state) => state.timesheet);
    const [page, setPage] = useState(1);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTimesheet, setSelectedTimesheet] = useState(null);

    useEffect(() => {
        dispatch(fetchMyTimesheets({ page }));
    }, [dispatch, page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleView = async (timesheetId) => {
        try {
            const result = await dispatch(fetchTimesheetById(timesheetId)).unwrap();
            setSelectedTimesheet(result);
            setViewModalOpen(true);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch timesheet details');
        }
    };

    const handleEdit = async (timesheetId) => {
        try {
            const result = await dispatch(fetchTimesheetById(timesheetId)).unwrap();
            setSelectedTimesheet(result);
            setEditModalOpen(true);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch timesheet details');
        }
    };

    const handleDelete = async (timesheetId) => {
        try {
            await dispatch(deleteTimesheet(timesheetId)).unwrap();
            toast.success('Timesheet deleted successfully');
            dispatch(fetchMyTimesheets({ page }));
        } catch (error) {
            toast.error(error.message || 'Failed to delete timesheet');
        }
    };

    const handleApprove = async (timesheetId) => {
        try {
            await dispatch(approveTimesheet(timesheetId)).unwrap();
            toast.success('Timesheet approved successfully');
            dispatch(fetchMyTimesheets({ page }));
        } catch (error) {
            toast.error(error.message || 'Failed to approve timesheet');
        }
    };

    const handleReject = async (timesheetId, { rejectionReason }) => {
        try {
            await dispatch(rejectTimesheet({ timesheetId, rejectionReason })).unwrap();
            toast.success('Timesheet rejected successfully');
            dispatch(fetchMyTimesheets({ page }));
        } catch (error) {
            toast.error(error.message || 'Failed to reject timesheet');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        My Timesheets
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/timesheet/create')}
                    >
                        Create New Timesheet
                    </Button>
                </Box>

                <Paper sx={{ p: 2 }}>
                    <TimesheetList
                        timesheets={myTimesheets?.data || []}
                        pagination={myTimesheets?.pagination}
                        onPageChange={handlePageChange}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                </Paper>
            </Box>

            {/* View Modal */}
            <TimesheetViewModal
                open={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedTimesheet(null);
                }}
                timesheet={selectedTimesheet}
                entries={selectedTimesheet?.entries}
            />

            {/* Edit Modal */}
            <TimesheetEditModal
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedTimesheet(null);
                }}
                timesheet={selectedTimesheet}
                entries={selectedTimesheet?.entries}
                onSave={() => {
                    setEditModalOpen(false);
                    setSelectedTimesheet(null);
                    dispatch(fetchMyTimesheets({ page }));
                }}
            />
        </Container>
    );
};

export default MyTimesheets; 