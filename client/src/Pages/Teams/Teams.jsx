import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Grid,
    Typography,
    Container,
    CircularProgress,
    Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TeamCard from './TeamCard'; //
import CreateTeamModal from './CreateTeamModal'; //
import TeamDetailsModal from './TeamDetailsModal'; //
import AddMemberModal from './AddMemberModal'; //
import {
    getAllTeams,
    createTeam,
    addTeamMember,
    removeTeamMember
} from '../../redux/Slices/projectTeamSlice';
import { toast } from 'react-hot-toast';

const Teams = () => {
    const dispatch = useDispatch();
    const { teams, loading, error } = useSelector((state) => {
        console.log('[Teams.jsx] useSelector - Full projectTeam state:', state.projectTeam);
        return state.projectTeam;
    });
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        console.log('[Teams.jsx] Dispatching getAllTeams...');
        dispatch(getAllTeams());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            console.error('[Teams.jsx] Error from slice:', error);
            toast.error(error.message || error || 'An error occurred'); // Display more informative error
        }
    }, [error]);

    // Log teams whenever it changes
    useEffect(() => {
        console.log('[Teams.jsx] Teams state updated:', teams);
    }, [teams]);

    const handleCreateTeam = async (teamData) => {
        try {
            await dispatch(createTeam(teamData)).unwrap();
            toast.success('Team created successfully');
            setCreateModalVisible(false);
        } catch (err) { // Use a different variable name for caught error
            toast.error(err.message || 'Failed to create team');
        }
    };

    const handleAddMember = async (memberId) => {
        try {
            await dispatch(addTeamMember({
                teamId: selectedTeam._id,
                memberId
            })).unwrap();
            toast.success('Member added successfully');
            setAddMemberModalVisible(false);
        } catch (err) { // Use a different variable name
            toast.error(err.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await dispatch(removeTeamMember({
                teamId: selectedTeam._id,
                memberId
            })).unwrap();
            toast.success('Member removed successfully');
            // Optionally, refresh details or list
            if (selectedTeam) {
                const updatedTeam = teams.find(t => t._id === selectedTeam._id);
                if (updatedTeam) setSelectedTeam(updatedTeam); // to refresh details modal if open
            }
        } catch (err) { // Use a different variable name
            toast.error(err.message || 'Failed to remove member');
        }
    };

    const handleViewDetails = (team) => {
        setSelectedTeam(team);
        setDetailsModalVisible(true);
    };

    const handleAddMemberClick = (team) => {
        setSelectedTeam(team);
        setAddMemberModalVisible(true);
    };

    console.log('[Teams.jsx] Rendering - Loading:', loading, 'Teams Length:', teams?.length);

    if (loading && (!teams || teams.length === 0)) {
        console.log('[Teams.jsx] Showing loading spinner.');
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!loading && error && (!teams || teams.length === 0)) {
        console.log('[Teams.jsx] Showing error message, no teams to display due to error.');
        return (
            <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Failed to load teams. Please try again later.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Error: {error.message || error}
                </Typography>
            </Container>
        );
    }

    if (!loading && (!teams || teams.length === 0)) {
        console.log('[Teams.jsx] No teams to display. Teams array is empty or null.');
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Grid item>
                        <Typography variant="h4" component="h1">Teams</Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalVisible(true)}>
                            Create Team
                        </Button>
                    </Grid>
                </Grid>
                <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>
                    No teams found. Start by creating a new team!
                </Typography>
                <CreateTeamModal
                    open={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onSubmit={handleCreateTeam}
                    loading={loading} // This should ideally be operationLoading from your slice
                />
            </Container>
        );
    }

    console.log('[Teams.jsx] About to map teams:', teams);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Grid item>
                    <Typography variant="h4" component="h1">
                        Teams
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Create Team
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {teams.map((team) => { // Removed optional chaining as we should have an array if we reach here
                    console.log('[Teams.jsx] Mapping team:', team);
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={team._id}>
                            <TeamCard
                                team={team}
                                onViewDetails={handleViewDetails}
                                onAddMember={handleAddMemberClick}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            <CreateTeamModal
                open={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={handleCreateTeam}
                loading={loading} // Consider using a more specific 'operationLoading' state from your slice
            />

            <TeamDetailsModal
                open={detailsModalVisible}
                onClose={() => setDetailsModalVisible(false)}
                team={selectedTeam}
                onRemoveMember={handleRemoveMember}
            />

            <AddMemberModal
                open={addMemberModalVisible}
                onClose={() => setAddMemberModalVisible(false)}
                onSubmit={handleAddMember}
                team={selectedTeam}
                loading={loading} // Consider using a more specific 'operationLoading' state from your slice
            />
        </Container>
    );
};

export default Teams;