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

const AddClientToProjectModal = ({ open, onClose, onAddClient, loading, project }) => {
    const { clients } = useSelector(state => state.client || { clients: [] });
    const [selectedClient, setSelectedClient] = useState('');

    // Filter out the current client
    const availableClients = clients.filter(
        client => !project?.clientId || client._id !== project.clientId._id
    );

    const handleAdd = () => {
        if (selectedClient) {
            onAddClient(selectedClient);
            setSelectedClient('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Add Client to Project</DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    <FormControl fullWidth>
                        <InputLabel>Select Client</InputLabel>
                        <Select
                            value={selectedClient}
                            onChange={e => setSelectedClient(e.target.value)}
                            label="Select Client"
                        >
                            {availableClients.map(client => (
                                <MenuItem key={client._id} value={client._id}>
                                    {client.name}
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
                    disabled={loading || !selectedClient}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    Add Client
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddClientToProjectModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddClient: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    project: PropTypes.object
};

export default AddClientToProjectModal;
