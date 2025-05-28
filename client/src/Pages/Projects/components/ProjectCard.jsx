/* eslint-disable no-unused-vars */
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
    Tooltip
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Info as InfoIcon,
    GroupAdd as GroupAddIcon,
    GroupRemove as GroupRemoveIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';
import { deleteProject } from '../../../redux/Slices/projectSlice';

const ProjectCard = ({
    project,
    onEdit,
    onDelete,
    onDetails,
    onAddTeam,
    onRemoveTeam,
    onAddClient,
    onRemoveClient,
    operationLoading
}) => {
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

                {/* Show associated teams and client */}
                <Box mt={2}>
                    <Typography variant="subtitle2">Teams:</Typography>
                    {Array.isArray(project.teamId) && project.teamId.length > 0 ? (
                        project.teamId.map((team) =>
                            <Chip key={team._id} label={team.teamName} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        )
                    ) : (
                        <Typography variant="body2" color="text.secondary">No team assigned</Typography>
                    )}
                </Box>
                <Box mt={1}>
                    <Typography variant="subtitle2">Client:</Typography>
                    {project.clientId ? (
                        <Chip label={project.clientId.name} size="small" />
                    ) : (
                        <Typography variant="body2" color="text.secondary">No client assigned</Typography>
                    )}
                </Box>
            </CardContent>

            <CardActions>
                <Tooltip title="Details">
                    <span>
                        <Button
                            size="small"
                            startIcon={<InfoIcon />}
                            onClick={() => onDetails(project)}
                            disabled={operationLoading}
                        >
                            Details
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title="Edit">
                    <span>
                        <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => onEdit(project)}
                            disabled={operationLoading}
                        >
                            Edit
                        </Button>
                    </span>
                </Tooltip>
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
                <MenuItem onClick={() => {
                    onDelete(project._id);
                    handleMenuClose();
                }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
                <MenuItem onClick={() => {
                    onAddTeam(project);
                    handleMenuClose();
                }}>
                    <GroupAddIcon fontSize="small" sx={{ mr: 1 }} />
                    Add Team
                </MenuItem>
                <MenuItem onClick={() => {
                    onRemoveTeam(project.teamId && project.teamId[0]?._id); // You may want to allow selection
                    handleMenuClose();
                }}>
                    <GroupRemoveIcon fontSize="small" sx={{ mr: 1 }} />
                    Remove Team
                </MenuItem>
                <MenuItem onClick={() => {
                    onAddClient(project);
                    handleMenuClose();
                }}>
                    <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
                    Add Client
                </MenuItem>
                <MenuItem onClick={() => {
                    onRemoveClient(project);
                    handleMenuClose();
                }}>
                    <PersonRemoveIcon fontSize="small" sx={{ mr: 1 }} />
                    Remove Client
                </MenuItem>
            </Menu>
        </Card>
    );
};

export default ProjectCard; 