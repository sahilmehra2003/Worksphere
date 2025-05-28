import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Avatar, Divider } from '@mui/material';
import { Person, Email, Work, Phone, LocationOn } from '@mui/icons-material';

const ViewProfile = () => {
    const { user } = useSelector((state) => state.auth);

    const profileSections = [
        {
            title: 'Personal Information',
            fields: [
                { label: 'Name', value: user?.name, icon: <Person /> },
                { label: 'Email', value: user?.email, icon: <Email /> },
                { label: 'Position', value: user?.position, icon: <Work /> },
                { label: 'Phone', value: user?.phoneNumber, icon: <Phone /> },
            ]
        },
        {
            title: 'Location',
            fields: [
                { label: 'Country', value: user?.country, icon: <LocationOn /> },
                { label: 'State', value: user?.state, icon: <LocationOn /> },
                { label: 'City', value: user?.city, icon: <LocationOn /> },
            ]
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', py: 4, px: 2 }}>
            <Paper sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                            mr: 3
                        }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {user?.name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {user?.position}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {profileSections.map((section, index) => (
                    <Box key={section.title} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                            {section.title}
                        </Typography>
                        <Grid container spacing={2}>
                            {section.fields.map((field) => (
                                <Grid item xs={12} sm={6} key={field.label}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ color: 'primary.main', mr: 1 }}>
                                            {field.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {field.label}
                                            </Typography>
                                            <Typography variant="body1">
                                                {field.value || 'Not specified'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        {index < profileSections.length - 1 && <Divider sx={{ my: 3 }} />}
                    </Box>
                ))}
            </Paper>
        </Box>
    );
};

export default ViewProfile; 