import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    CircularProgress
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { fetchAllEmployeesPublic } from '../../redux/Slices/employeeSlice';

const AddMemberModal = ({ open, onClose, onSubmit, team, loading }) => {
    const dispatch = useDispatch();
    const { employees } = useSelector((state) => ({
        employees: state.employee.employees
    }));

    useEffect(() => {
        if (open) {
            dispatch(fetchAllEmployeesPublic());
        }
    }, [open, dispatch]);
    // Filter out employees who are already team members
    const availableEmployees = employees?.filter(
        employee => !team?.members?.some(member => member._id === employee._id)
    );

    const handleSubmit = async (e) => {
        try {
            const memberId = e.target.value;
            if (!memberId) {
                toast.error('Please select a team member');
                return;
            }
            await onSubmit(memberId);
        } catch (error) {
            toast.error('Failed to add team member');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Team Member</InputLabel>
                        <Select
                            label="Select Team Member"
                            onChange={handleSubmit}
                            defaultValue=""
                        >
                            {availableEmployees?.map(employee => (
                                <MenuItem key={employee._id} value={employee._id}>
                                    {employee.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    Add Member
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddMemberModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    team: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.string.isRequired
            })
        )
    }),
    loading: PropTypes.bool.isRequired
};

export default AddMemberModal; 