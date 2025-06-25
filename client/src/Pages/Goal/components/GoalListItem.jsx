import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    CardContent,
    CardActions,
    Grid,
    Typography,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    Comment as CommentIcon,
    UploadFile as UploadFileIcon
} from '@mui/icons-material';
import { updateGoalProgress, addGoalEvidence } from '../../../redux/Slices/goalSlice';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import UpdateProgressModal from './UpdateProgressModal';
import CommentsModal from './CommentsModal';

// eslint-disable-next-line react/prop-types
const GoalListItem = ({ goal }) => {
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [commentsModalOpen, setCommentsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const { token } = useSelector(state => state.auth);
    const fileInputRef = useRef(null);
    const handleUpdateProgress = (progressData) => { dispatch(updateGoalProgress({ goalId: goal._id, progressData, token })); };
    const handleAddEvidence = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('evidence', file);
        dispatch(addGoalEvidence({ goalId: goal._id, formData, token }));
    };

    return (
        <>
            <Card sx={{ mb: 2 }} variant="outlined">
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item><CircularProgressWithLabel value={goal.progress} /></Grid>
                        <Grid item xs><Typography variant="body1">{goal.description}</Typography></Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Tooltip title="Update Progress"><IconButton onClick={() => setUpdateModalOpen(true)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="View Comments"><IconButton onClick={() => setCommentsModalOpen(true)}><CommentIcon /></IconButton></Tooltip>
                    <Tooltip title="Add Evidence"><IconButton onClick={() => fileInputRef.current.click()}><UploadFileIcon /></IconButton></Tooltip>
                    <input type="file" ref={fileInputRef} hidden onChange={handleAddEvidence} />
                </CardActions>
            </Card>
            {updateModalOpen && <UpdateProgressModal open={updateModalOpen} handleClose={() => setUpdateModalOpen(false)} goal={goal} onSave={handleUpdateProgress} />}
            {commentsModalOpen && <CommentsModal open={commentsModalOpen} handleClose={() => setCommentsModalOpen(false)} goal={goal} />}
        </>
    );
};

// From: GoalListTab.jsx
const GoalListTab = ({ employeeId }) => {
    const dispatch = useDispatch();
    const { goals, loading, error } = useSelector((state) => state.goal);
    const { token, user } = useSelector((state) => state.auth);
    useEffect(() => {
        const empId = employeeId || user?._id;
        if (empId && token) {
            dispatch(getGoalsByEmployeeId({ empId, token }));
        }
    }, [dispatch, employeeId, user, token]);
    return (
        <Box sx={{ p: 2 }}>
            {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
                goals && goals.length > 0 ? goals.map(goal => <GoalListItem key={goal._id} goal={goal} />) : <Typography>No goals found.</Typography>
            )}
        </Box>
    );
};

export default GoalListItem; 