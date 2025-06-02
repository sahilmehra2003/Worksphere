import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    TextField,
    MenuItem,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProjects } from '../../../redux/Slices/projectSlice';
import { fetchTimesheetById } from '../../../redux/Slices/timeSheetSlice';
import { addTimesheetEntry, updateTimesheetEntry, deleteTimesheetEntry } from '../../../redux/Slices/timeSheetSlice';
import { toast } from 'react-hot-toast';

const safeFormat = (date, fmt, fallback = '') => {
    if (!date) return fallback;
    const d = new Date(date);
    if (isNaN(d)) return fallback;
    try {
        return format(d, fmt);
    } catch {
        return fallback;
    }
};

const TimesheetEditModal = ({ open, onClose, timesheet, entries, onSave }) => {
    const dispatch = useDispatch();
    const { projects } = useSelector((state) => state.project);
    const [newEntry, setNewEntry] = useState({
        date: safeFormat(new Date(), 'yyyy-MM-dd'),
        hours: '',
        description: '',
        project: '',
    });
    const [editedEntries, setEditedEntries] = useState([]);

    useEffect(() => {
        dispatch(fetchAllProjects());
    }, [dispatch]);

    useEffect(() => {
        if (entries) {
            setEditedEntries(entries.map(entry => ({
                ...entry,
                date: entry.date && !isNaN(new Date(entry.date)) ? safeFormat(entry.date, 'yyyy-MM-dd') : ''
            })));
        }
    }, [entries]);

    const handleNewEntryChange = (field) => (event) => {
        setNewEntry(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleAddEntry = async () => {
        try {
            if (!newEntry.hours || !newEntry.description || !newEntry.project) {
                toast.error('Please fill in all required fields');
                return;
            }

            await dispatch(addTimesheetEntry({
                ...newEntry,
                timesheet: timesheet._id
            })).unwrap();

            // Refetch the timesheet to get updated entries
            await dispatch(fetchTimesheetById(timesheet._id)).unwrap();

            setNewEntry({
                date: safeFormat(new Date(), 'yyyy-MM-dd'),
                hours: '',
                description: '',
                project: '',
            });
            toast.success('Entry added successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to add entry');
        }
    };

    const handleDeleteEntry = async (entryId) => {
        try {
            await dispatch(deleteTimesheetEntry(entryId)).unwrap();
            setEditedEntries(prev => prev.filter(entry => entry._id !== entryId));
            toast.success('Entry deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete entry');
        }
    };

    const handleUpdateEntry = async (entryId, updatedData) => {
        try {
            await dispatch(updateTimesheetEntry({
                entryId,
                updatedData
            })).unwrap();
            setEditedEntries(prev => prev.map(entry =>
                entry._id === entryId ? { ...entry, ...updatedData } : entry
            ));
            toast.success('Entry updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update entry');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h5">Edit Timesheet</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                    Week of {timesheet?.weekStartDate && !isNaN(new Date(timesheet.weekStartDate))
                        ? safeFormat(timesheet.weekStartDate, 'MMMM dd, yyyy')
                        : 'Invalid date'}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {/* Add New Entry Form */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Add New Entry
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Date"
                                        value={newEntry.date}
                                        onChange={handleNewEntryChange('date')}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Hours"
                                        value={newEntry.hours}
                                        onChange={handleNewEntryChange('hours')}
                                        inputProps={{ min: 0.1, max: 24, step: 0.1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Project"
                                        value={typeof newEntry.project === 'object' ? newEntry.project._id : newEntry.project || ''}
                                        onChange={handleNewEntryChange('project')}
                                    >
                                        {projects?.map((project) => (
                                            <MenuItem key={project._id} value={project._id}>
                                                {project.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Description"
                                        value={newEntry.description}
                                        onChange={handleNewEntryChange('description')}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddEntry}
                                    >
                                        Add Entry
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Existing Entries */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Existing Entries
                        </Typography>
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Project</TableCell>
                                        <TableCell>Hours</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {editedEntries.map((entry) => (
                                        <TableRow key={entry._id}>
                                            <TableCell>
                                                <TextField
                                                    type="date"
                                                    value={entry.date}
                                                    onChange={(e) => handleUpdateEntry(entry._id, { date: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {entry.project
                                                    ? (typeof entry.project === 'object'
                                                        ? entry.project.name
                                                        : (projects.find(p => p._id === entry.project)?.name || 'N/A'))
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={entry.hours}
                                                    onChange={(e) => handleUpdateEntry(entry._id, { hours: e.target.value })}
                                                    inputProps={{ min: 0.1, max: 24, step: 0.1 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    multiline
                                                    value={entry.description}
                                                    onChange={(e) => handleUpdateEntry(entry._id, { description: e.target.value })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteEntry(entry._id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onSave}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TimesheetEditModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    timesheet: PropTypes.object,
    entries: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string,
            date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
            hours: PropTypes.number,
            description: PropTypes.string,
            project: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object,
            ]),
            client: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object,
            ]),
            task: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object,
            ]),
        })
    ),
    onSave: PropTypes.func,
};

export default TimesheetEditModal; 