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
import { useState } from 'react';
import { useSelector } from 'react-redux';

const AddTeamToProjectModal = ({ open, onClose, onAddTeam, loading, project }) => {
    const { teams } = useSelector(state => state.projectTeam || []);
    const [selectedTeam, setSelectedTeam] = useState('');

    // Filter out teams already assigned to this project
    const availableTeams = teams?.filter(
        team => !project?.teamId?.some(t => t._id === team._id)
    );

    const handleAdd = () => {
        if (selectedTeam) {
            onAddTeam(selectedTeam);
            setSelectedTeam('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Add Team to Project</DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    <FormControl fullWidth>
                        <InputLabel>Select Team</InputLabel>
                        <Select
                            value={selectedTeam}
                            onChange={e => setSelectedTeam(e.target.value)}
                            label="Select Team"
                        >
                            {availableTeams?.map(team => (
                                <MenuItem key={team._id} value={team._id}>
                                    {team.teamName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    disabled={loading || !selectedTeam}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    Add Team
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddTeamToProjectModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddTeam: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    project: PropTypes.object
};

export default AddTeamToProjectModal;
