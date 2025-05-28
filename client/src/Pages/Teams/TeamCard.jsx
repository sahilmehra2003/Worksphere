import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Stack,
    Box,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Group as GroupIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    PersonAdd as PersonAddIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';

const TeamCard = ({ team, onViewDetails, onAddMember }) => {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    boxShadow: 6
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" component="h2" gutterBottom>
                            {team.teamName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {team.description}
                        </Typography>
                    </Box>
                    <Chip
                        label={team.workingOnProject ? 'Active' : 'Inactive'}
                        color={team.workingOnProject ? 'success' : 'default'}
                        size="small"
                    />
                </Box>

                <Stack spacing={1} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2">
                            Team Head: {team.teamHead?.name || 'Not Assigned'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon fontSize="small" />
                        <Typography variant="body2">
                            Members: {team.members?.length || 0}
                        </Typography>
                    </Box>
                    {team.projectId && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon fontSize="small" />
                            <Typography variant="body2">
                                Project: {team.projectId?.name || 'Not Assigned'}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </CardContent>

            <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Add Member">
                    <IconButton
                        color="primary"
                        onClick={() => onAddMember(team)}
                    >
                        <PersonAddIcon />
                    </IconButton>
                </Tooltip>
                <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => onViewDetails(team)}
                >
                    View Details
                </Button>
            </Box>
        </Card>
    );
};

TeamCard.propTypes = {
    team: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        description: PropTypes.string,
        workingOnProject: PropTypes.bool,
        teamHead: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string
        }),
        members: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.string,
                name: PropTypes.string
            })
        ),
        projectId: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string
        })
    }).isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onAddMember: PropTypes.func.isRequired
};

export default TeamCard; 