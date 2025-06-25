import PropTypes from 'prop-types';
import {
    Box,  Paper, CircularProgress,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const WeeklyTimesheetGrid = ({ logs, currentDate, loading }) => {
    const theme = useTheme();

   
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        return new Date(d.setDate(diff));
    };

    const startOfWeek = getStartOfWeek(currentDate);

    // Create an array of dates for the current week's header
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
    });

    // Process logs to group by project and date
    const processedData = logs.reduce((acc, log) => {
        const project_name = log.project?.name || 'Unassigned';
        if (!acc[project_name]) {
            acc[project_name] = { total: 0, days: {} };
        }
        const logDateStr = new Date(log.date).toDateString();
        acc[project_name].days[logDateStr] = (acc[project_name].days[logDateStr] || 0) + log.hours;
        acc[project_name].total += log.hours;
        return acc;
    }, {});

    // Calculate daily and weekly totals
    const dailyTotals = weekDates.map(date => {
        const dateStr = date.toDateString();
        return Object.values(processedData).reduce((sum, project) => sum + (project.days[dateStr] || 0), 0);
    });

    const grandTotal = dailyTotals.reduce((sum, hours) => sum + hours, 0);

    if (loading) {
        return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
    }

    return (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table stickyHeader aria-label="weekly timesheet grid">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                        {weekDates.map(date => (
                            <TableCell key={date.toISOString()} align="center" sx={{ fontWeight: 'bold' }}>
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                                {date.toLocaleDateString('en-US', { day: '2-digit' })}
                            </TableCell>
                        ))}
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(processedData).map(([projectName, data]) => (
                        <TableRow key={projectName} hover>
                            <TableCell component="th" scope="row">{projectName}</TableCell>
                            {weekDates.map(date => {
                                const hours = data.days[date.toDateString()] || 0;
                                return <TableCell key={date.toISOString()} align="center">{hours > 0 ? hours.toFixed(2) : '-'}</TableCell>
                            })}
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>{data.total.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { border: 0 }, backgroundColor: theme.palette.action.hover }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Daily Totals</TableCell>
                        {dailyTotals.map((total, index) => (
                            <TableCell key={index} align="center" sx={{ fontWeight: 'bold' }}>{total.toFixed(2)}</TableCell>
                        ))}
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.primary.main }}>{grandTotal.toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

WeeklyTimesheetGrid.propTypes = {
    logs: PropTypes.array,
    currentDate: PropTypes.instanceOf(Date).isRequired,
    loading: PropTypes.bool
};

export default WeeklyTimesheetGrid;
