import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    useTheme,
    IconButton,
    Tooltip,
    Chip,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import { fetchAllTasks, updateTask, deleteTask } from '../../redux/Slices/taskSlice';
import AddTask from './AddTask';
import EditTask from './EditTask';
import ReopenTask from './ReopenTask';
import TaskDetails from './TaskDetails';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

const TaskPage = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { allTasks, loadingAllTasks, error, pagination, operationLoading } = useSelector((state) => state.task);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'deadlineDate',
        direction: 'asc',
    });
    const [reopeningTask, setReopeningTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const loadTasks = () => {
        dispatch(fetchAllTasks({
            page: 1,
            limit: 20,
            filters: {
                ...filters,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            }
        }));
    };

    useEffect(() => {
        loadTasks();
    }, [dispatch, filters, sortConfig]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleStatusToggle = async (taskId, currentStatus) => {
        await dispatch(updateTask({
            taskId,
            updatedData: { isCompleted: !currentStatus }
        }));
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await dispatch(deleteTask(taskId));
        }
    };

    const handleReopen = async (taskId) => {
        setReopeningTask(taskId);
    };

    const handleViewTask = (task) => {
        setSelectedTask(task);
    };

    const getStatusColor = (isCompleted) => {
        return isCompleted ? 'success' : 'warning';
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Tasks
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setIsAddTaskOpen(true)}>
                    Add Task
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Search Tasks"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="open">Open</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            label="Priority"
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <Paper>
                {loadingAllTasks ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                ) : (
                    <Paper sx={{ width: '100%', overflowX: "auto" }}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}>
                                            <Typography variant='h6'>S No.</Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{ backgroundColor: theme.palette.primary.main, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}
                                            onClick={() => handleSort('title')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Typography variant='h5' color={theme.palette.text.light}>
                                                Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}>
                                            <Typography variant='h5' color={theme.palette.text.light}>Assigned To</Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{ backgroundColor: theme.palette.primary.main, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}
                                            onClick={() => handleSort('priority')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Typography variant='h5' color={theme.palette.text.light}>
                                                Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}>
                                            <Typography variant='h5' color={theme.palette.text.light}>Status</Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{ backgroundColor: theme.palette.primary.main, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}
                                            onClick={() => handleSort('deadlineDate')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Typography variant='h5' color={theme.palette.text.light}>
                                                Deadline {sortConfig.key === 'deadlineDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: theme.palette.primary.main, fontWeight: 'bold', border: `1px solid ${theme.palette.divider}` }}>
                                            <Typography variant='h5' color={theme.palette.text.light}>Actions</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allTasks.map((task, index) => (
                                        <TableRow key={task._id || index}>
                                            <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}><Typography variant='body1'>{index + 1}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }} >
                                                <Typography variant='body1'>{task.title}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                                <Typography variant='body1'>{task.assignedTo?.name || 'N/A'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                                <Typography variant='body1'>
                                                    {task.priority}
                                                </Typography></TableCell>
                                            <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                                <Chip
                                                    label={task.isCompleted ? 'Completed' : 'Open'}
                                                    color={getStatusColor(task.isCompleted)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                                <Typography variant='body1'>{task.deadlineDate ? new Date(task.deadlineDate).toLocaleDateString() : 'N/A'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewTask(task)}
                                                            color="primary"
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {task.isCompleted ? (
                                                        <Tooltip title="Reopen Task">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleReopen(task._id)}
                                                                disabled={operationLoading}
                                                                color="warning"
                                                            >
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Mark Complete">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleStatusToggle(task._id, task.isCompleted)}
                                                                disabled={operationLoading}
                                                                color="success"
                                                            >
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Edit Task">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setEditingTask(task)}
                                                            disabled={operationLoading}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Task">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(task._id)}
                                                            disabled={operationLoading}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={pagination?.allTasks?.totalRecords || 0}
                            page={(pagination?.allTasks?.currentPage || 1) - 1}
                            onPageChange={(e, newPage) => {
                                dispatch(fetchAllTasks({
                                    page: newPage + 1,
                                    limit: 20,
                                    filters: {
                                        ...filters,
                                        sortBy: sortConfig.key,
                                        sortOrder: sortConfig.direction,
                                    }
                                }));
                            }}
                            rowsPerPage={20}
                            rowsPerPageOptions={[20]}
                        />
                    </Paper>
                )}
            </Paper>
            <AddTask
                open={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                onSuccess={() => {
                    setIsAddTaskOpen(false);
                    loadTasks();
                }}
            />
            <EditTask
                open={Boolean(editingTask)}
                task={editingTask}
                onClose={() => setEditingTask(null)}
                onSuccess={() => {
                    setEditingTask(null);
                    loadTasks();
                }}
            />
            <ReopenTask
                open={Boolean(reopeningTask)}
                taskId={reopeningTask}
                onClose={() => setReopeningTask(null)}
                onSuccess={() => {
                    setReopeningTask(null);
                    loadTasks();
                }}
            />
            <TaskDetails
                open={Boolean(selectedTask)}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
            />
        </Container>
    );
};

export default TaskPage; 