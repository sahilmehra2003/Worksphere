import { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Box, Typography, Paper, Divider, Chip, Stack,
    Grow, IconButton, TextField, Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import { updateTransactionTags } from '../redux/Slices/transactionSlice';

const TransactionTags = ({ transaction }) => {
    const theme = useTheme();
    // const dispatch = useDispatch();
    const [newTag, setNewTag] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Un-comment the dispatch logic once your slice is ready.
    const handleAddTag = async () => {
        if (!newTag.trim()) return;
        const updatedTags = [...(transaction.tags || []), newTag.trim()];
        console.log("Adding tag:", { transactionId: transaction._id, tags: updatedTags });
        // await dispatch(updateTransactionTags({ transactionId: transaction._id, tags: updatedTags })).unwrap();
        setNewTag('');
    };

    const handleRemoveTag = async (tagToRemove) => {
        const updatedTags = (transaction.tags || []).filter(tag => tag !== tagToRemove);
        console.log("Removing tag:", { transactionId: transaction._id, tags: updatedTags });
        // await dispatch(updateTransactionTags({ transactionId: transaction._id, tags: updatedTags })).unwrap();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <Grow in={true}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                        Tags
                    </Typography>
                    <IconButton onClick={() => setIsEditing(!isEditing)} color="primary">
                        {isEditing ? <DoneIcon /> : <EditIcon />}
                    </IconButton>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                {isEditing && (
                    <Stack direction="row" spacing={1} mb={2}>
                        <TextField
                            label="Add a new tag"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <Button
                            onClick={handleAddTag}
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                        >
                            Add
                        </Button>
                    </Stack>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {transaction.tags && transaction.tags.length > 0 ? (
                        transaction.tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                onDelete={isEditing ? () => handleRemoveTag(tag) : undefined}
                                color="primary"
                                variant="outlined"
                            />
                        ))
                    ) : (
                        <Typography color="text.secondary" sx={{ width: '100%', textAlign: 'center', p: 2 }}>
                            No tags added.
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Grow>
    );
};

TransactionTags.propTypes = {
    transaction: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string)
    }).isRequired
};

export default TransactionTags;
