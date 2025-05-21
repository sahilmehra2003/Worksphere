// src/components/Leave/LeaveApplyModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    Select, MenuItem, FormControl, InputLabel, Button, Typography,
    CircularProgress, Alert, FormHelperText, Box
} from '@mui/material';
import { useSelector } from 'react-redux'; // To get operation states
// It's assumed that calculateWorkingDays and isNonWorkingDay are passed as props
// If they were in utils, you'd import them:
// import { calculateWorkingDaysFrontend, isNonWorkingDay } from '../../utils/dateUtils';

const LeaveApplyModal = ({
    open,
    onClose,
    onSubmit, // This is the function from parent that dispatches the Redux thunk
    selectionInfo,
    balance,
    companyCalendar,
    calculateWorkingDays, // Pass the calculation function as a prop
    isNonWorkingDay // Pass the check function as a prop
}) => {
    const [leaveType, setLeaveType] = useState('');
    const [reason, setReason] = useState('');
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [localFormError, setLocalFormError] = useState(''); // For immediate form feedback

    // Get operation loading and error state from Redux (for the submit action)
    const { isApplyingLeave, errorApplyingLeave } = useSelector((state) => state.leave);

    // Determine start and end dates from selectionInfo
    const startStr = selectionInfo?.startStr || (selectionInfo?.start ? new Date(selectionInfo.start).toISOString().split('T')[0] : '');
    // FullCalendar's end date in a selection range is exclusive, so subtract one day to make it inclusive.
    // If selectionInfo.end is not present (e.g., single day click), endStr defaults to startStr.
    const endStr = selectionInfo?.endStr
        ? new Date(new Date(selectionInfo.endStr).setDate(new Date(selectionInfo.endStr).getDate() - 1)).toISOString().split('T')[0]
        : (selectionInfo?.end ? new Date(new Date(selectionInfo.end).setDate(new Date(selectionInfo.end).getDate() - 1)).toISOString().split('T')[0] : startStr);

    // Recalculate working days and validate dates when modal opens or selection changes
    useEffect(() => {
        if (open && selectionInfo?.start) { // selectionInfo.end might not be present for a single day click
            const startDate = new Date(selectionInfo.start);
            // Ensure inclusiveEndDate is correctly derived
            let inclusiveEndDate = selectionInfo.end ? new Date(selectionInfo.end) : new Date(selectionInfo.start);
            if (selectionInfo.endStr && selectionInfo.startStr !== selectionInfo.endStr) { // If a range is selected and it's not a single day
                inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
            }

            const weekends = companyCalendar?.weekends || [];
            const holidays = companyCalendar?.holidays || [];
            let currentError = '';

            // Perform date validations
            if (isNonWorkingDay(startDate, weekends, holidays)) {
                currentError = "Leave cannot start on a weekend or public holiday.";
            } else if (startDate > inclusiveEndDate) { // Check if start date is after end date
                currentError = "Start date cannot be after the end date.";
            } else if (isNonWorkingDay(inclusiveEndDate, weekends, holidays) && startDate.getTime() !== inclusiveEndDate.getTime()) {
                // Check end date only if it's a range and different from start date
                currentError = "Leave cannot end on a weekend or public holiday.";
            } else { // Only calculate days if basic date validations pass
                const days = calculateWorkingDays(startDate, inclusiveEndDate, weekends, holidays);
                setCalculatedDays(days);
                if (days <= 0) {
                    currentError = "Selected range must contain at least one working day.";
                }
            }
            setLocalFormError(currentError);

        } else if (open && !selectionInfo) {
            setCalculatedDays(0);
            setLocalFormError("Please select dates on the calendar to apply for leave.");
        } else if (!open) { // Reset when modal closes
            setLeaveType('');
            setReason('');
            setCalculatedDays(0);
            setLocalFormError('');
        }
    }, [open, selectionInfo, companyCalendar, calculateWorkingDays, isNonWorkingDay]);


    // Reset local form fields when the modal is closed (not just calculation-related state)
    useEffect(() => {
        if (!open) {
            setLeaveType('');
            setReason('');
            // setCalculatedDays(0); // Already handled in the effect above
            // setLocalFormError(''); // Already handled in the effect above
        }
    }, [open]);

    const handleSubmit = async () => {
        // ... (form validation as before) ...
        // if (validationFails) return;

        // No need to setIsSubmitting(true) here, as isApplyingLeave from Redux handles it for the button

        try {
            const resultAction = await onSubmit({ // Calls the thunk dispatcher from UserLeavePage
                leaveType,
                reason,
                startDate: startStr,
                endDate: endStr,
                numberOfDays: calculatedDays
            });

            // If onSubmit (and .unwrap()) does not throw, it was successful.
            // The success toast and modal closing are now primarily handled by UserLeavePage's useEffect
            // listening to 'applyLeaveSuccess' from the Redux state.
            // The modal's onClose will be called from UserLeavePage if applyLeaveSuccess becomes true.
            console.log("LeaveApplyModal: onSubmit thunk call completed successfully. Payload:", resultAction);

        } catch (submitError) {
            // This block will only execute if dispatch(applyForLeave(...)).unwrap() re-throws an error
            // (i.e., if the applyForLeave thunk was rejected).
            // The error message should be what was passed to rejectWithValue in the thunk.
            setLocalFormError(submitError?.message || submitError || "Submission failed. Please check details or try again.");
            console.error("LeaveApplyModal: onSubmit caught actual error from thunk:", submitError);
        }
        // setIsSubmitting(false); // Not needed if using isApplyingLeave from Redux
    };

    const getBalanceForType = (type) => {
        if (!balance) return 'N/A';
        switch (type) {
            case 'Casual': return balance.casualLeaves?.current ?? 'N/A';
            case 'Sick': return balance.sickLeaves?.current ?? 'N/A';
            case 'Earned': return balance.earnedLeaves?.current ?? 'N/A';
            case 'Compensatory': return balance.compensatoryLeaves?.current ?? 'N/A';
            case 'Maternity': return balance.maternityLeaves?.current ?? 'N/A';
            case 'Paternity': return balance.paternityLeaves?.current ?? 'N/A';
            default: return 'N/A';
        }
    };

    const isSubmitButtonDisabled = isApplyingLeave || calculatedDays <= 0 || !leaveType || !reason.trim() || !!localFormError;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Apply for Leave</DialogTitle>
            <DialogContent sx={{ pt: '10px !important' }}> {/* Adjusted padding top for DialogContent */}
                {selectionInfo ? (
                    <Box mb={2}>
                        <Typography variant="body1" gutterBottom>
                            Selected Dates: <strong>{startStr}</strong> to <strong>{endStr}</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Calculated Working Days: {calculatedDays > 0 ? calculatedDays : 'N/A'}
                        </Typography>
                    </Box>
                ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Please select a date or range from the calendar to apply for leave, or ensure date pickers are added to this form if direct input is desired.
                    </Alert>
                )}

                <FormControl fullWidth margin="normal" required error={!!localFormError && (localFormError.includes("leave type") || !leaveType)}>
                    <InputLabel id="leave-type-modal-label">Leave Type</InputLabel>
                    <Select
                        labelId="leave-type-modal-label"
                        value={leaveType}
                        label="Leave Type"
                        onChange={(e) => { setLeaveType(e.target.value); setLocalFormError(''); }}
                        disabled={!selectionInfo || calculatedDays <= 0}
                    >
                        <MenuItem value="" disabled><em>Select Leave Type</em></MenuItem>
                        {balance?.casualLeaves && <MenuItem value="Casual">Casual Leave ({getBalanceForType('Casual')} avail.)</MenuItem>}
                        {balance?.sickLeaves && <MenuItem value="Sick">Sick Leave ({getBalanceForType('Sick')} avail.)</MenuItem>}
                        {balance?.earnedLeaves && <MenuItem value="Earned">Earned Leave ({getBalanceForType('Earned')} avail.)</MenuItem>}
                        {balance?.compensatoryLeaves && balance.compensatoryLeaves.current > 0 && <MenuItem value="Compensatory">Compensatory Off ({getBalanceForType('Compensatory')} avail.)</MenuItem>}
                        {balance?.maternityLeaves && <MenuItem value="Maternity">Maternity Leave ({getBalanceForType('Maternity')} avail.)</MenuItem>}
                        {balance?.paternityLeaves && <MenuItem value="Paternity">Paternity Leave ({getBalanceForType('Paternity')} avail.)</MenuItem>}
                        <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
                    </Select>
                    {!!localFormError && localFormError.includes("leave type") && <FormHelperText error>{localFormError}</FormHelperText>}
                    {!leaveType && <FormHelperText error>Leave type is required.</FormHelperText>}
                </FormControl>

                <TextField
                    margin="normal" // Changed from dense for better spacing
                    id="reason-modal"
                    label="Reason for Leave"
                    type="text"
                    fullWidth
                    variant="outlined"
                    required
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setLocalFormError(''); }}
                    error={!!localFormError && (localFormError.includes("reason") || !reason.trim())}
                    helperText={(!!localFormError && (localFormError.includes("reason") || !reason.trim())) ? "Reason is required." : ""}
                    disabled={!selectionInfo || calculatedDays <= 0}
                />

                {localFormError &&
                    <Alert severity={localFormError.startsWith("Insufficient") ? "warning" : "error"} sx={{ mt: 2, mb: 1 }}>
                        {localFormError}
                    </Alert>
                }
                {/* Display general submission errors from Redux if not already covered by localFormError */}
                {errorApplyingLeave && !localFormError &&
                    <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{errorApplyingLeave}</Alert>
                }
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose} disabled={isApplyingLeave} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitButtonDisabled || !selectionInfo}
                    variant="contained"
                    color="primary"
                >
                    {isApplyingLeave ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LeaveApplyModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    selectionInfo: PropTypes.shape({
        start: PropTypes.instanceOf(Date),
        end: PropTypes.instanceOf(Date),
        startStr: PropTypes.string,
        endStr: PropTypes.string,
    }),
    balance: PropTypes.object, // Detailed shape can be added if needed
    companyCalendar: PropTypes.shape({
        holidays: PropTypes.array,
        weekends: PropTypes.array,
    }),
    calculateWorkingDays: PropTypes.func.isRequired,
    isNonWorkingDay: PropTypes.func.isRequired,
};

export default LeaveApplyModal;