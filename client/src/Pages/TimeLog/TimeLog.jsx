import { useState } from 'react';
import { Box,Tabs, Tab, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import AttendanceTab from './components/AttendanceTab';
import TimesheetTab from './components/TimesheetTab';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`timelog-tabpanel-${index}`}
            aria-labelledby={`timelog-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const TimeLog = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box p={{ xs: 1, sm: 2, md: 3 }}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="Time Log Tabs" variant="fullWidth">
                        <Tab label="Attendance" id="timelog-tab-0" />
                        <Tab label="Weekly Timesheet" id="timelog-tab-1" />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <AttendanceTab />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <TimesheetTab />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default TimeLog;
