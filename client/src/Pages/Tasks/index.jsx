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
} from '@mui/material';
import { fetchAllTasks } from '../../redux/Slices/taskSlice';
import AddTask from './AddTask';

const TaskPage = () => {
    const dispatch = useDispatch();
    const { allTasks, loadingAllTasks, error, pagination } = useSelector((state) => state.task);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    const loadTasks = () => {
        dispatch(fetchAllTasks({ page: 1, limit: 20 }));
    };

    useEffect(() => {
        loadTasks();
    }, [dispatch]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Tasks
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setIsAddTaskOpen(true)}>
                    Add Task
                </Button>
            </Box>
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
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Assigned To</TableCell>
                                        <TableCell>Priority</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Deadline</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allTasks.map((task) => (
                                        <TableRow key={task._id}>
                                            <TableCell>{task.title}</TableCell>
                                            <TableCell>{task.assignedTo?.name || 'N/A'}</TableCell>
                                            <TableCell>{task.priority}</TableCell>
                                            <TableCell>{task.isCompleted ? 'Completed' : 'Open'}</TableCell>
                                            <TableCell>{task.deadlineDate ? new Date(task.deadlineDate).toLocaleDateString() : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={pagination?.allTasks?.totalRecords || 0}
                            page={(pagination?.allTasks?.currentPage || 1) - 1}
                            onPageChange={() => { }}
                            rowsPerPage={20}
                            rowsPerPageOptions={[20]}
                        />
                    </>
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
        </Container>
    );
};

export default TaskPage; 