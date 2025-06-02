import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Container, Paper } from '@mui/material';
import { toast } from 'react-hot-toast';
import TimesheetList from './components/TimesheetList';
import {
    fetchAllTimesheets,
    deleteTimesheet,
    approveTimesheet,
    rejectTimesheet
} from '../../redux/Slices/timeSheetSlice';
import TimesheetViewModal from './components/TimesheetViewModal';
import TimesheetEditModal from './components/TimesheetEditModal';

const AllTimesheets = () => {
    const dispatch = useDispatch();
    const { allTimesheets, loading, error, currentTimesheetDetails } = useSelector((state) => state.timesheet);
    const [page, setPage] = useState(1);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAllTimesheets({ page }));
    }, [dispatch, page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleDelete = async (timesheetId) => {
        try {
            await dispatch(deleteTimesheet(timesheetId)).unwrap();
            toast.success('Timesheet deleted successfully');
            dispatch(fetchAllTimesheets({ page }));
        } catch (error) {
            toast.error(error.message || 'Failed to delete timesheet');
        }
    };

    const handleApprove = async (timesheetId) => {
        try {
            await dispatch(approveTimesheet(timesheetId)).unwrap();
            toast.success('Timesheet approved successfully');
            dispatch(fetchAllTimesheets({ page }));
        } catch (error) {
            toast.error(error.message || 'Failed to approve timesheet');
        }
    };

    const handleReject = async (timesheetId, { rejectionReason }) => {
        try {
            await dispatch(rejectTimesheet({ timesheetId, rejectionReason })).unwrap();
            toast.success('Timesheet rejected successfully');
            dispatch(fetchAllTimesheets({ page }));
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
                        All Timesheets
                    </Typography>
                </Box>

                <Paper sx={{ p: 2 }}>
                    <TimesheetList
                        timesheets={allTimesheets?.data || []}
                        pagination={allTimesheets?.pagination}
                        onPageChange={handlePageChange}
                        onDelete={handleDelete}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                </Paper>
            </Box>

            {/* View Modal */}
            <TimesheetViewModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                timesheet={currentTimesheetDetails}
                entries={currentTimesheetDetails?.entries}
            />

            {/* Edit Modal */}
            <TimesheetEditModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                timesheet={currentTimesheetDetails}
                entries={currentTimesheetDetails?.entries}
                onSave={() => {
                    setEditModalOpen(false);
                    dispatch(fetchAllTimesheets({ page }));
                }}
            />
        </Container>
    );
};

export default AllTimesheets; 