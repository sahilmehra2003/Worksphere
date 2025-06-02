import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateTransactionTags } from '../redux/Slices/transactionSlice';
import PropTypes from 'prop-types';

const TransactionTags = ({ transaction }) => {
    const dispatch = useDispatch();
    const [newTag, setNewTag] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleAddTag = async () => {
        if (!newTag.trim()) return;

        const updatedTags = [...(transaction.tags || []), newTag.trim()];
        try {
            await dispatch(updateTransactionTags({
                transactionId: transaction._id,
                tags: updatedTags
            })).unwrap();
            setNewTag('');
        } catch (error) {
            console.error('Failed to add tag:', error);
        }
    };

    const handleRemoveTag = async (tagToRemove) => {
        const updatedTags = (transaction.tags || []).filter(tag => tag !== tagToRemove);
        try {
            await dispatch(updateTransactionTags({
                transactionId: transaction._id,
                tags: updatedTags
            })).unwrap();
        } catch (error) {
            console.error('Failed to remove tag:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Tags</h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-500 hover:text-blue-600"
                >
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            </div>

            {isEditing && (
                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a new tag"
                            className="flex-grow border rounded p-2"
                        />
                        <button
                            onClick={handleAddTag}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {transaction.tags?.map((tag, index) => (
                    <div
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                        <span>{tag}</span>
                        {isEditing && (
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="text-gray-500 hover:text-red-500"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                {(!transaction.tags || transaction.tags.length === 0) && (
                    <p className="text-gray-500">No tags added</p>
                )}
            </div>
        </div>
    );
};

TransactionTags.propTypes = {
    transaction: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string)
    }).isRequired
};

export default TransactionTags; 