import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography, Box, CircularProgress, Alert, Stack
} from '@mui/material';
import {
    markCheckIn,
    markCheckOut,
    fetchAttendanceForEmployee,
    fetchCurrentAttendanceStatus,
    flagIssueToHR,
    requestHalfDay,
    requestCorrection,
    clearAttendanceOperationStatus

} from '../../../redux/Slices/attendanceSlice';

import AttendanceAction from './Attendance/AttendanceAction';
import AttendanceHistory from './Attendance/AttendanceHistory';
import HalfDayRequestModal from './Attendance/HalfDayRequestModal';
import CorrectionRequestModal from './Attendance/CorrectionRequestModal'; // <-- 1. Imported the new modal

const AttendanceTab = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { attendanceHistory, currentAttendanceStatus, loading, operationLoading, operationError, operationSuccess } = useSelector((state) => state.attendance);

    const [isHalfDayModalOpen, setHalfDayModalOpen] = useState(false);
    // 2. --- Added state for the new modal ---
    const [isCorrectionModalOpen, setCorrectionModalOpen] = useState(false);
    const [recordToCorrect, setRecordToCorrect] = useState(null);
    const [lastOperation, setLastOperation] = useState('');

    // Fetch initial data
    useEffect(() => {
        if (user?._id) {
            dispatch(fetchCurrentAttendanceStatus());
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 5);
            dispatch(fetchAttendanceForEmployee({
                employeeId: user._id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }));
        }
    }, [dispatch, user]);

    // Re-fetch data after a successful operation
    useEffect(() => {
        if (operationSuccess) {
            dispatch(fetchCurrentAttendanceStatus());
            dispatch(fetchAttendanceForEmployee({ employeeId: user._id }));
            dispatch(clearAttendanceOperationStatus());
        }
    }, [operationSuccess, dispatch, user]);

    // --- Handlers ---
    const handleCheckIn = () => {
        setLastOperation('checkIn');
        dispatch(markCheckIn());
    };
    const handleCheckOut = () => {
        setLastOperation('checkOut');
        dispatch(markCheckOut());
    };

    const handleRequestHalfDay = (data) => {
        setLastOperation('halfDay');
        dispatch(requestHalfDay({
            date: data.date,
            notes: data.notes
        }));
        setHalfDayModalOpen(false);
    };

    const handleRaiseIssue = (attendanceRecord) => {
        const reason = prompt("Please provide a reason for disputing this rejection:");
        if (reason) {
            setLastOperation('raiseIssue');
            dispatch(flagIssueToHR({ attendanceId: attendanceRecord._id, notes: reason }));
        }
    };

    // 3. --- Implemented handler functions for the new modal ---
    const handleOpenCorrectionModal = (record) => {
        setRecordToCorrect(record);
        setCorrectionModalOpen(true);
    };

    const handleCorrectionSubmit = (correctionData) => {
        setLastOperation('correction');
        dispatch(requestCorrection(correctionData));
        setCorrectionModalOpen(false);
    };

    return (
        <Stack spacing={4}>
            {operationError && <Alert severity="error" onClose={() => dispatch(clearAttendanceOperationStatus())}>{operationError.message || "An error occurred."}</Alert>}
            {operationSuccess && (
                <Alert severity="success" onClose={() => dispatch(clearAttendanceOperationStatus())}>
                    {lastOperation === 'checkIn' && 'Successfully checked in!'}
                    {lastOperation === 'checkOut' && 'Successfully checked out!'}
                    {lastOperation === 'halfDay' && 'Half-day request submitted successfully!'}
                    {lastOperation === 'correction' && 'Correction request submitted successfully!'}
                    {lastOperation === 'raiseIssue' && 'Issue raised to HR successfully!'}
                    {!lastOperation && 'Operation completed successfully!'}
                </Alert>
            )}

            <AttendanceAction
                statusData={currentAttendanceStatus}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onHalfDayRequest={() => setHalfDayModalOpen(true)}
                loading={operationLoading}
            />

            <Box>
                <Typography variant="h5" gutterBottom>Recent History</Typography>
                {loading ? <CircularProgress /> :
                    <AttendanceHistory
                        history={attendanceHistory}
                        onRaiseIssue={handleRaiseIssue}
                        onCorrectRequest={handleOpenCorrectionModal}
                    />
                }
            </Box>

            <HalfDayRequestModal
                open={isHalfDayModalOpen}
                onClose={() => setHalfDayModalOpen(false)}
                onSubmit={handleRequestHalfDay}
                loading={operationLoading}
            />
            {/* 4. --- Rendered the new modal --- */}
            <CorrectionRequestModal
                open={isCorrectionModalOpen}
                onClose={() => setCorrectionModalOpen(false)}
                onSubmit={handleCorrectionSubmit}
                record={recordToCorrect}
                loading={operationLoading}
            />
        </Stack>
    );
};

export default AttendanceTab;
