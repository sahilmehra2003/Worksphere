/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    Box,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { deleteProject } from '../../../redux/Slices/projectSlice';

const ProjectCard = ({ project, onEdit }) => {
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            await dispatch(deleteProject(project._id));
        }
        handleMenuClose();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'success';
            case 'completed':
                return 'primary';
            case 'on hold':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.alt',
                '&:hover': {
                    boxShadow: 6,
                },
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h5" component="h2" gutterBottom>
                        {project.name}
                    </Typography>
                    <IconButton onClick={handleMenuOpen} size="small">
                        <MoreVertIcon />
                    </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                    <Chip
                        label={project.status}
                        color={getStatusColor(project.status)}
                        size="small"
                    />
                    {project.priority && (
                        <Chip
                            label={project.priority}
                            color="secondary"
                            size="small"
                        />
                    )}
                </Box>

                {project.dueDate && (
                    <Typography variant="body2" color="text.secondary" mt={2}>
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                    </Typography>
                )}
            </CardContent>

            <CardActions>
                <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(project)}
                >
                    Edit
                </Button>
            </CardActions>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    onEdit(project);
                    handleMenuClose();
                }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>
        </Card>
    );
};

export default ProjectCard; 