import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Box,
    Divider
} from '@mui/material';
import {
    Person as PersonIcon,
    Group as GroupIcon
} from '@mui/icons-material';

const TeamDetailsModal = ({ open, onClose, team, onRemoveMember }) => {
    if (!team) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Team Details</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {team.teamName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {team.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Chip
                            label={team.workingOnProject ? 'Active' : 'Inactive'}
                            color={team.workingOnProject ? 'success' : 'default'}
                        />
                        <Chip
                            label={team.isInternalProject ? 'Internal' : 'Client'}
                            color={team.isInternalProject ? 'primary' : 'secondary'}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Team Head
                            </Typography>
                            <Typography variant="body1">
                                {team.teamHead?.name || 'Not Assigned'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Project
                            </Typography>
                            <Typography variant="body1">
                                {team.projectId?.name || 'Not Assigned'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Team Members
                </Typography>
                <List>
                    {team.members?.map(member => (
                        <ListItem
                            key={member._id}
                            secondaryAction={
                                <Button
                                    color="error"
                                    onClick={() => onRemoveMember(member._id)}
                                >
                                    Remove
                                </Button>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={member.name}
                                secondary={member.email}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

TeamDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    team: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        description: PropTypes.string,
        workingOnProject: PropTypes.bool,
        isInternalProject: PropTypes.bool,
        teamHead: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string
        }),
        projectId: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string
        }),
        members: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                email: PropTypes.string.isRequired
            })
        )
    }),
    onRemoveMember: PropTypes.func.isRequired
};

export default TeamDetailsModal; 