import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Grid, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchAllProjects } from '../../redux/Slices/projectSlice';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';

const Projects = () => {
    const dispatch = useDispatch();
    const { projects, loading, error } = useSelector((state) => state.project);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        dispatch(fetchAllProjects());
    }, [dispatch]);

    const handleOpenModal = (project = null) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedProject(null);
        setIsModalOpen(false);
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
                    onClick={() => handleOpenModal()}
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
                            onEdit={() => handleOpenModal(project)}
                        />
                    </Grid>
                ))}
            </Grid>

            <ProjectModal
                open={isModalOpen}
                onClose={handleCloseModal}
                project={selectedProject}
            />
        </Box>
    );
};

export default Projects; 