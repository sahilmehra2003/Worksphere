import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemText,
    Paper,
} from '@mui/material';
import { format } from 'date-fns';

const TaskDetails = ({ open, onClose, task }) => {
    if (!task) return null;

    const getStatusColor = (isCompleted) => {
        return isCompleted ? 'success' : 'warning';
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Task Details</Typography>
                    <Chip
                        label={task.isCompleted ? 'Completed' : 'Open'}
                        color={getStatusColor(task.isCompleted)}
                        size="small"
                    />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    {/* Basic Task Information */}
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="h6" gutterBottom>Task Information</Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Typography><strong>Title:</strong> {task.title}</Typography>
                            <Typography><strong>Description:</strong> {task.description || 'No description provided'}</Typography>
                            <Typography><strong>Assigned To:</strong> {task.assignedTo?.name || 'Not assigned'}</Typography>
                            <Typography><strong>Created By:</strong> {task.createdBy?.name || 'Unknown'}</Typography>
                            <Typography><strong>Created On:</strong> {format(new Date(task.createdAt), 'PPP')}</Typography>
                            <Typography><strong>Priority:</strong>
                                <Chip
                                    label={task.priority}
                                    color={getPriorityColor(task.priority)}
                                    size="small"
                                    sx={{ ml: 1 }}
                                />
                            </Typography>
                            <Typography><strong>Deadline:</strong> {task.deadlineDate ? format(new Date(task.deadlineDate), 'PPP') : 'No deadline set'}</Typography>
                            {task.isCompleted && (
                                <Typography><strong>Completed On:</strong> {format(new Date(task.completedDate), 'PPP')}</Typography>
                            )}
                        </Box>
                    </Paper>

                    {/* Task History */}
                    {task.reopenHistory && task.reopenHistory.length > 0 && (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="h6" gutterBottom>Reopen History</Typography>
                            <List>
                                {task.reopenHistory.map((history, index) => (
                                    <ListItem key={index} divider={index !== task.reopenHistory.length - 1}>
                                        <ListItemText
                                            primary={`Reopened on ${format(new Date(history.reopenedAt), 'PPP')}`}
                                            secondary={
                                                <Box display="flex" flexDirection="column" gap={0.5}>
                                                    <Typography variant="body2">
                                                        <strong>New Deadline:</strong> {format(new Date(history.newDeadlineDate), 'PPP')}
                                                    </Typography>
                                                    {history.description && (
                                                        <Typography variant="body2">
                                                            <strong>Reason:</strong> {history.description}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body2">
                                                        <strong>Reopened By:</strong> {history.reopenedBy?.name || 'Unknown'}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    {/* Task Comments (if any) */}
                    {task.comments && task.comments.length > 0 && (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="h6" gutterBottom>Comments</Typography>
                            <List>
                                {task.comments.map((comment, index) => (
                                    <ListItem key={index} divider={index !== task.comments.length - 1}>
                                        <ListItemText
                                            primary={comment.content}
                                            secondary={
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="body2">
                                                        By: {comment.author?.name || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {format(new Date(comment.createdAt), 'PPP')}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

TaskDetails.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    task: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        assignedTo: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }),
        createdBy: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }),
        createdAt: PropTypes.string.isRequired,
        deadlineDate: PropTypes.string,
        completedDate: PropTypes.string,
        isCompleted: PropTypes.bool.isRequired,
        priority: PropTypes.string.isRequired,
        reopenHistory: PropTypes.arrayOf(PropTypes.shape({
            reopenedAt: PropTypes.string.isRequired,
            newDeadlineDate: PropTypes.string.isRequired,
            description: PropTypes.string,
            reopenedBy: PropTypes.shape({
                _id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
            }),
        })),
        comments: PropTypes.arrayOf(PropTypes.shape({
            content: PropTypes.string.isRequired,
            author: PropTypes.shape({
                _id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
            }),
            createdAt: PropTypes.string.isRequired,
        })),
    }),
};

export default TaskDetails; 