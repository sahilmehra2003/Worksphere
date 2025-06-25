import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Modal,
    TextField,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { addGoalComment } from '../../../redux/Slices/goalSlice';

// eslint-disable-next-line react/prop-types
const CommentsModal = ({ open, handleClose, goal }) => {
    const [newComment, setNewComment] = useState("");
    const { operationLoading } = useSelector(state => state.goal);
    const dispatch = useDispatch();
    const { token } = useSelector(state => state.auth);

    const handleAddComment = () => {
        dispatch(addGoalComment({ goalId: goal._id, commentData: { comment: newComment }, token }));
        setNewComment("");
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                <Typography variant="h6">Comments for: {goal?.description}</Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', my: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Manager Comments</Typography>
                    <List dense>
                        {goal?.managerComments?.length > 0 ?
                            goal.managerComments.map((c, i) => <ListItem key={i}><ListItemText primary={c} /></ListItem>) :
                            <ListItem><ListItemText primary="No comments yet." /></ListItem>
                        }
                    </List>
                    <Divider />
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>HR Comments</Typography>
                    <List dense>
                        {goal?.hrComments?.length > 0 ?
                            goal.hrComments.map((c, i) => <ListItem key={i}><ListItemText primary={c} /></ListItem>) :
                            <ListItem><ListItemText primary="No comments yet." /></ListItem>
                        }
                    </List>
                </Box>
                <TextField
                    label="Add a new comment"
                    fullWidth
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                />
                <Button
                    onClick={handleAddComment}
                    variant="contained"
                    sx={{ mt: 1 }}
                    disabled={operationLoading || !newComment}
                >
                    Add Comment
                </Button>
            </Box>
        </Modal>
    );
};

export default CommentsModal; 