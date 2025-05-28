import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    CircularProgress
} from '@mui/material';

const ProjectDetailsModal = ({ open, onClose, project, loading }) => {
    if (loading || !project) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Project Details</DialogTitle>
                <DialogContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Project Details</DialogTitle>
            <DialogContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {project.description}
                </Typography>
                <Box mb={1}>
                    <Chip label={`Status: ${project.status}`} sx={{ mr: 1 }} />
                    <Chip label={`Priority: ${project.priority || 'N/A'}`} sx={{ mr: 1 }} />
                    {project.dueDate && (
                        <Chip label={`Due: ${new Date(project.dueDate).toLocaleDateString()}`} />
                    )}
                </Box>
                <Box mb={1}>
                    <Typography variant="subtitle2">Teams:</Typography>
                    {Array.isArray(project.teamId) && project.teamId.length > 0 ? (
                        project.teamId.map((team) =>
                            <Chip key={team._id} label={team.teamName} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        )
                    ) : (
                        <Typography variant="body2" color="text.secondary">No team assigned</Typography>
                    )}
                </Box>
                <Box mb={1}>
                    <Typography variant="subtitle2">Client:</Typography>
                    {project.clientId ? (
                        <Chip label={project.clientId.name} size="small" />
                    ) : (
                        <Typography variant="body2" color="text.secondary">No client assigned</Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

ProjectDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    project: PropTypes.object,
    loading: PropTypes.bool
};

export default ProjectDetailsModal;
