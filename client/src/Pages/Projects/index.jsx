import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
    fetchAllProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addProjectTeam,
    removeProjectTeam,
    addProjectClient,
    removeProjectClient,
    // eslint-disable-next-line no-unused-vars
    setCurrentProject,
    clearCurrentProject,
    clearProjectOperationStatus
} from '../../redux/Slices/projectSlice';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
// You should create or update these modals/components as needed:
import ProjectDetailsModal from './components/ProjectDetailsModal';
import AddTeamToProjectModal from './components/AddTeamToProjectModal';
import AddClientToProjectModal from './components/AddClientToProjectModal';

const Projects = () => {
    const dispatch = useDispatch();
    const {
        projects,
        currentProject,
        loading,
        operationLoading,
        error,
        operationError,
        operationSuccess
    } = useSelector((state) => state.project);

    // Modal/dialog state
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        dispatch(fetchAllProjects());
    }, [dispatch]);

    // Show operation feedback
    useEffect(() => {
        if (operationSuccess) {
            setSnackbar({ open: true, message: 'Operation successful!', severity: 'success' });
            dispatch(clearProjectOperationStatus());
            setIsProjectModalOpen(false);
            setIsAddTeamModalOpen(false);
            setIsAddClientModalOpen(false);
        }
        if (operationError) {
            setSnackbar({ open: true, message: operationError, severity: 'error' });
            dispatch(clearProjectOperationStatus());
        }
    }, [operationSuccess, operationError, dispatch]);

    const handleOpenProjectModal = (project = null) => {
        setSelectedProject(project);
        setIsProjectModalOpen(true);
    };

    const handleCloseProjectModal = () => {
        setSelectedProject(null);
        setIsProjectModalOpen(false);
    };

    const handleOpenDetailsModal = (project) => {
        dispatch(fetchProjectById(project._id));
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        dispatch(clearCurrentProject());
        setIsDetailsModalOpen(false);
    };

    const handleOpenAddTeamModal = (project) => {
        setSelectedProject(project);
        setIsAddTeamModalOpen(true);
    };

    const handleCloseAddTeamModal = () => {
        setSelectedProject(null);
        setIsAddTeamModalOpen(false);
    };

    const handleOpenAddClientModal = (project) => {
        setSelectedProject(project);
        setIsAddClientModalOpen(true);
    };

    const handleCloseAddClientModal = () => {
        setSelectedProject(null);
        setIsAddClientModalOpen(false);
    };

    // CRUD handlers
    const handleCreateOrUpdateProject = (data) => {
        if (selectedProject) {
            dispatch(updateProject({ projectId: selectedProject._id, updatedData: data }));
        } else {
            dispatch(createProject(data));
        }
    };

    const handleDeleteProject = (projectId) => {
        dispatch(deleteProject(projectId));
    };

    // Team/Client association handlers
    const handleAddTeam = (teamIdToAdd) => {
        dispatch(addProjectTeam({ projectId: selectedProject._id, teamData: { teamIdToAdd } }));
    };

    const handleRemoveTeam = (teamIdToRemove) => {
        dispatch(removeProjectTeam({ projectId: selectedProject._id, teamData: { teamIdToRemove } }));
    };

    const handleAddClient = (clientId) => {
        dispatch(addProjectClient({ projectId: selectedProject._id, clientData: { clientId } }));
    };

    const handleRemoveClient = () => {
        dispatch(removeProjectClient({ projectId: selectedProject._id }));
    };

    if (loading) {
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

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h3" color="primary">
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenProjectModal()}
                    sx={{
                        backgroundColor: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                    }}
                >
                    New Project
                </Button>
            </Box>

            <Grid container spacing={3}>
                {projects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} key={project._id}>
                        <ProjectCard
                            project={project}
                            onEdit={() => handleOpenProjectModal(project)}
                            onDelete={() => handleDeleteProject(project._id)}
                            onDetails={() => handleOpenDetailsModal(project)}
                            onAddTeam={() => handleOpenAddTeamModal(project)}
                            onRemoveTeam={handleRemoveTeam}
                            onAddClient={() => handleOpenAddClientModal(project)}
                            onRemoveClient={handleRemoveClient}
                            operationLoading={operationLoading}
                        />
                    </Grid>
                ))}
            </Grid>

            <ProjectModal
                open={isProjectModalOpen}
                onClose={handleCloseProjectModal}
                project={selectedProject}
                onSubmit={handleCreateOrUpdateProject}
                loading={operationLoading}
            />

            <ProjectDetailsModal
                open={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                project={currentProject}
                loading={loading}
            />

            <AddTeamToProjectModal
                open={isAddTeamModalOpen}
                onClose={handleCloseAddTeamModal}
                onAddTeam={handleAddTeam}
                loading={operationLoading}
                project={selectedProject}
            />

            <AddClientToProjectModal
                open={isAddClientModalOpen}
                onClose={handleCloseAddClientModal}
                onAddClient={handleAddClient}
                loading={operationLoading}
                project={selectedProject}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Projects; 