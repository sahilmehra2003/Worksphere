import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Pagination
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PlayCircle as PlayCircleIcon
} from '@mui/icons-material';
import {
    fetchAllReviewCycles,
    createReviewCycle,
    updateReviewCycle,
    deleteReviewCycle,
    activateReviewCycle
} from '../../../redux/Slices/reviewCycleSlice';
import CycleFormModal from './CycleFormModal';
import ConfirmationDialog from './ConfirmationDialog';
import StatusChip from './StatusChip';

const ReviewCycleList = () => {
    const dispatch = useDispatch();
    const { reviewCycles, loadingList, error, pagination, operationSuccess } = useSelector(state => state.reviewCycle);
    const { token } = useSelector(state => state.auth);
    const [page, setPage] = useState(1);

    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [actionToConfirm, setActionToConfirm] = useState(null);

    useEffect(() => {
        if (token) {
            dispatch(fetchAllReviewCycles({ page, token }));
        }
    }, [dispatch, page, token]);

    useEffect(() => {
        // Close modals on successful operation
        if (operationSuccess) {
            setFormModalOpen(false);
            setConfirmOpen(false);
        }
    }, [operationSuccess]);

    const handleCreate = () => {
        setSelectedCycle(null);
        setFormModalOpen(true);
    };

    const handleEdit = (cycle) => {
        setSelectedCycle(cycle);
        setFormModalOpen(true);
    };

    const handleDelete = (cycle) => {
        setSelectedCycle(cycle);
        setActionToConfirm(() => () => dispatch(deleteReviewCycle({ cycleId: cycle._id, token })));
        setConfirmOpen(true);
    };

    const handleActivate = (cycle) => {
        setSelectedCycle(cycle);
        setActionToConfirm(() => () => dispatch(activateReviewCycle({ cycleId: cycle._id, token })));
        setConfirmOpen(true);
    };

    const handleSaveCycle = (formData) => {
        if (selectedCycle) {
            dispatch(updateReviewCycle({ cycleId: selectedCycle._id, updatedData: formData, token }));
        } else {
            dispatch(createReviewCycle({ cycleData: formData, token }));
        }
    };

    const handlePageChange = (event, value) => setPage(value);

    // Don't render if no token
    if (!token) {
        return (
            <Alert severity="warning">
                Authentication required. Please log in again.
            </Alert>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Create New Cycle
                </Button>
            </Box>

            {loadingList ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Cycle</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reviewCycles.map((cycle) => (
                                <TableRow key={cycle._id} hover>
                                    <TableCell>{cycle.name}</TableCell>
                                    <TableCell>{cycle.year}</TableCell>
                                    <TableCell>
                                        <StatusChip status={cycle.status} />
                                    </TableCell>
                                    <TableCell>{new Date(cycle.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(cycle.endDate).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        {cycle.status === 'Planned' && (
                                            <Tooltip title="Activate Cycle">
                                                <IconButton color="success" onClick={() => handleActivate(cycle)}>
                                                    <PlayCircleIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Edit Cycle">
                                            <IconButton color="primary" onClick={() => handleEdit(cycle)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {cycle.status === 'Planned' && (
                                            <Tooltip title="Delete Cycle">
                                                <IconButton color="error" onClick={() => handleDelete(cycle)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Pagination count={pagination.totalPages} page={page} onChange={handlePageChange} />
                </Box>
            )}

            <CycleFormModal
                open={isFormModalOpen}
                handleClose={() => setFormModalOpen(false)}
                cycle={selectedCycle}
                onSave={handleSaveCycle}
            />

            <ConfirmationDialog
                open={isConfirmOpen}
                handleClose={() => setConfirmOpen(false)}
                onConfirm={actionToConfirm}
                title={selectedCycle?.status === 'Planned' ? "Activate Review Cycle?" : "Confirm Deletion"}
                message={`Are you sure you want to ${selectedCycle?.status === 'Planned' ? `activate the ${selectedCycle?.name} ${selectedCycle?.year}` : `delete the ${selectedCycle?.name} ${selectedCycle?.year}`} cycle? This action cannot be undone.`}
            />
        </Box>
    );
};

export default ReviewCycleList; 