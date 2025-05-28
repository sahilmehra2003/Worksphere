/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Grid2,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, ToggleOff as DeactivateIcon, ToggleOn as ActivateIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { fetchAllClients, deactivateClient, clearClientOperationStatus } from '../../redux/Slices/clientSlice';
import ClientModal from '../../components/ClientModal';
import { toast } from 'react-hot-toast';

const ClientGrid2 = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { clients, loading, error, operationLoading, operationError, operationSuccess } = useSelector((state) => state.client);
    const { user: authUser } = useSelector((state) => state.auth);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        dispatch(fetchAllClients());
    }, [dispatch]);

    // Effect to show toast messages for operations
    useEffect(() => {
        if (operationSuccess) {
            toast.success('Operation completed successfully!');
            dispatch(clearClientOperationStatus());
        }
        if (operationError) {
            toast.error(operationError);
            dispatch(clearClientOperationStatus());
        }
    }, [operationSuccess, operationError, dispatch]);

    const handleOpenModal = (client = null) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedClient(null);
        setIsModalOpen(false);
    };

    const handleDeactivateClient = async (clientId, clientName, currentStatus) => {
        if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'reactivate'} client "${clientName}"?`)) {
            if (currentStatus === false) {
                toast.error("Client is already inactive.");
                return;
            }
            try {
                await dispatch(deactivateClient(clientId)).unwrap();
                toast.success(`Client "${clientName}" has been deactivated successfully.`);
            } catch (error) {
                toast.error(error.message || 'Failed to deactivate client');
            }
        }
    };

    if (loading && clients.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

    const isAdmin = authUser?.role === 'Admin';

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h3" color={theme.palette.primary.main}>
                    Clients
                </Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenModal()}
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        }}
                        disabled={operationLoading}
                    >
                        New Client
                    </Button>
                )}
            </Box>

            <Grid2 container spacing={3}>
                {clients.map(client => (
                    <Grid2 item xs={12} sm={6} md={4} key={client._id}>
                        <Card sx={{
                            backgroundColor: theme.palette.background.alt,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <CardContent>
                                <Typography variant="h5" component="div" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                                    {client.name}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} gutterBottom>
                                    <strong>Contact Person:</strong> {client.contactPersonName || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Email:</strong> {client.email || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Phone:</strong> {client.phoneNumber || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Location:</strong> {client.location || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Creation Date:</strong> {client.clientCreationDate ? new Date(client.clientCreationDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Finish Date:</strong> {client.clientFinishDate ? new Date(client.clientFinishDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Status:</strong> {client.status ? "Active" : "Inactive"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Revenue:</strong> {client.paymentAfterCompletion != null ? client.paymentAfterCompletion : "Payment not received"}
                                </Typography>
                            </CardContent>
                            {isAdmin && (
                                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                                    <Tooltip title="Edit Client">
                                        <IconButton onClick={() => handleOpenModal(client)} size="small" disabled={operationLoading} >
                                            <EditIcon color='secondary' />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={client.status ? "Deactivate Client" : "Client is Inactive"}>
                                        <span>
                                            <IconButton
                                                onClick={() => handleDeactivateClient(client._id, client.name, client.status)}
                                                size="small"
                                                color={client.status ? "success" : "warning"}
                                                disabled={operationLoading || !client.status}
                                            >
                                                {client.status ? <DeactivateIcon /> : <ActivateIcon color="error" />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </CardActions>
                            )}
                        </Card>
                    </Grid2>
                ))}
            </Grid2>

            {isModalOpen && (
                <ClientModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    client={selectedClient}
                />
            )}
        </Box>
    );
};

export default ClientGrid2;