import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ClientGrid = () => {
    const [clients, setClients] = useState([]);
    const theme = useTheme(); 

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('http://localhost:4000/clientData/clients');
                const data = await response.json();
                console.log(data);
                setClients(data);
            } catch (error) {
                console.error('Error fetching client data:', error);
            }
        };
        
        fetchClients();
    }, []);

    useEffect(() => {
        console.log('Updated Clients State:', clients); // Log whenever `clients` state is updated
    }, [clients]);

    return (
        <Grid container spacing={2} style={{ padding: '20px' }}>
            {clients.map(client => (
                <Grid item xs={12} sm={6} md={4} key={client._id}>
                    <Card style={{ backgroundColor: theme.palette.background.alt }}>
                        <CardContent>
                            <Typography variant="h5" component="div" style={{ color: theme.palette.secondary.main }}>
                                {client.name}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Contact Person:</strong> {client.contactPersonName}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Email:</strong> {client.email}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Phone:</strong> {client.phoneNumber}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Location:</strong> {client.location}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Creation Date:</strong> {new Date(client.clientCreationDate).toLocaleDateString()}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Finish Date:</strong> {client.clientFinishDate ? new Date(client.clientFinishDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Client Status:</strong> {client.status===false ?"Pending":"Completed"}
                            </Typography>
                            <Typography color="text.secondary">
                                <strong>Revenue Generated:</strong> {client.paymentAfterCompletion===null ?"Payment not received":client.paymentAfterCompletion}
                            </Typography>
                            <Typography variant="h6" component="div" style={{ marginTop: '10px', color: theme.palette.secondary.main }}>
                                Project Details:
                            </Typography>
                            {(client.projectDetails || []).map(project => ( // Safeguard against undefined
                                <div key={project._id}>
                                    <Typography color="text.secondary">
                                        <strong>Project Name:</strong> {project.projectName}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        <strong>Status:</strong> {project.projectStatus}
                                    </Typography>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ClientGrid;
