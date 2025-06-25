import PropTypes from 'prop-types';
import { Typography, CircularProgress, Button, Paper, Stack } from '@mui/material';

const AttendanceAction = ({ statusData, onCheckIn, onCheckOut, onHalfDayRequest, loading }) => {

    const attendanceRecord = statusData;
    const isCheckedIn = Boolean(attendanceRecord?.checkInTime && !attendanceRecord?.checkOutTime);
    const isCheckedOut = Boolean(attendanceRecord?.checkOutTime);

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
                Today&apos;s Attendance
            </Typography>
            {loading ? <CircularProgress /> : (
                <Stack spacing={2} direction="row" justifyContent="center">
                    <Button variant="contained" color="success" onClick={onCheckIn} disabled={isCheckedIn || isCheckedOut}>
                        Check-In
                    </Button>
                    <Button variant="contained" color="error" onClick={onCheckOut} disabled={!isCheckedIn || isCheckedOut}>
                        Check-Out
                    </Button>
                    <Button variant="outlined" onClick={onHalfDayRequest} disabled={isCheckedIn || isCheckedOut}>
                        Request Half-Day
                    </Button>
                </Stack>
            )}
            {isCheckedIn && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Checked in at: {new Date(attendanceRecord.checkInTime).toLocaleTimeString()}
                    {attendanceRecord.isHalfDay && (
                        <span style={{ color: 'orange', fontWeight: 'bold' }}> (Half Day)</span>
                    )}
                </Typography>
            )}
            {isCheckedOut && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    You have checked out for the day at {new Date(attendanceRecord.checkOutTime).toLocaleTimeString()}.
                    <br />
                    Total hours worked: {attendanceRecord.totalHours} hours
                    <br />
                    Status: <span style={{
                        color: attendanceRecord.status === 'Present' ? 'green' :
                            attendanceRecord.status === 'Shortfall' ? 'orange' : 'red',
                        fontWeight: 'bold'
                    }}>{attendanceRecord.status}</span>
                </Typography>
            )}
            {!isCheckedIn && !isCheckedOut && !loading && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    You have not checked in yet today.
                </Typography>
            )}
            {attendanceRecord && attendanceRecord.managerApproval?.status === 'Pending' && (
                <Typography variant="body2" color="orange" sx={{ mt: 2, fontWeight: 'bold' }}>
                    ⚠️ Your attendance requires manager approval
                </Typography>
            )}
        </Paper>
    );
};

AttendanceAction.propTypes = {
    statusData: PropTypes.object,
    onCheckIn: PropTypes.func.isRequired,
    onCheckOut: PropTypes.func.isRequired,
    onHalfDayRequest: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default AttendanceAction;