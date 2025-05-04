/* eslint-disable react/prop-types */
// components/leave/LeaveApplyModal.jsx
import  { useState, useEffect, } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Typography,
    CircularProgress,
    Alert,
    FormHelperText
} from '@mui/material';

// Pass the helper functions via props or import them if moved to utils
// import { calculateWorkingDaysFrontend, isNonWorkingDay } from '../../utils/dateUtils';

const LeaveApplyModal = ({
    open,
    onClose,
    onSubmit,
    selectionInfo,
    balance,
    companyCalendar,
    calculateWorkingDays, // Pass the calculation function as a prop
    isNonWorkingDay // Pass the check function as a prop
}) => {
    const [leaveType, setLeaveType] = useState('');
    const [reason, setReason] = useState('');
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const startStr = selectionInfo?.startStr;
    // Adjust end date from selection (FullCalendar's end is exclusive)
    const endStr = selectionInfo?.endStr ? new Date(new Date(selectionInfo.endStr).setDate(new Date(selectionInfo.endStr).getDate() - 1)).toISOString().split('T')[0] : startStr;

    // Recalculate working days when dates/calendar info change
    useEffect(() => {
        if (open && selectionInfo?.start && selectionInfo?.end) {
            // Ensure end date for calculation is inclusive
            const inclusiveEndDate = new Date(selectionInfo.end);
            // If selectionInfo.endStr exists, it means a range was selected. FC's end is exclusive.
            if (selectionInfo.endStr) {
                 inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
            }

            const days = calculateWorkingDays(
                selectionInfo.start, // Start Date object
                inclusiveEndDate,   // End Date object (inclusive)
                companyCalendar.weekends,
                companyCalendar.holidays
            );
            setCalculatedDays(days);
             // Basic validation on modal open
             if (isNonWorkingDay(selectionInfo.start, companyCalendar.weekends, companyCalendar.holidays)) {
                 setError("Leave cannot start on a weekend or holiday.");
             } else if (isNonWorkingDay(inclusiveEndDate, companyCalendar.weekends, companyCalendar.holidays)) {
                 setError("Leave cannot end on a weekend or holiday.");
             }
              else if (days <= 0) {
                 setError("Selected range contains no working days.");
             } else {
                 setError(''); // Clear error if dates are initially valid
             }

        } else {
            setCalculatedDays(0);
             setError(''); // Clear error when closing or no selection
        }
    }, [open, selectionInfo, companyCalendar, calculateWorkingDays, isNonWorkingDay]);

    // Reset form when modal closes
     useEffect(() => {
         if (!open) {
             setLeaveType('');
             setReason('');
             setCalculatedDays(0);
             setError('');
             setIsSubmitting(false);
         }
     }, [open]);

    const handleSubmit = async () => {
        setError(''); // Clear previous errors
        if (!leaveType || !reason || calculatedDays <= 0) {
            setError("Please select leave type, enter reason, and ensure duration is valid.");
            return;
        }

        // Final balance check
        const typeKey = leaveType === 'Casual' ? 'casualLeaves' : leaveType === 'Sick' ? 'sickLeaves' : leaveType === 'Earned' ? 'earnedLeaves' : leaveType === 'Compensatory' ? 'compensatoryLeaves' : leaveType === 'Maternity' ? 'maternityLeaves' : leaveType === 'Paternity' ? 'paternityLeaves' : null;
        if (typeKey && balance && balance[typeKey]?.current < calculatedDays) {
            setError(`Insufficient ${leaveType} balance. Available: ${balance[typeKey]?.current}, Required: ${calculatedDays}`);
            return;
        }

        setIsSubmitting(true);
        try {
            // Call the onSubmit passed from parent, which contains the axios call
            await onSubmit({
                leaveType,
                reason,
                startDate: startStr, // Send YYYY-MM-DD string
                endDate: endStr,   // Send YYYY-MM-DD string (inclusive)
                numberOfDays: calculatedDays
            });
             // Let parent handle closing and success message after onSubmit resolves
             // onClose(); // Close handled by parent potentially after data refresh
        } catch (submitError) {
            // Error handling delegated to parent via onSubmit rejection, but can show here too
             setError(`Submission failed: ${submitError?.response?.data?.message || submitError.message}`);
            console.error("Modal submit error:", submitError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getBalanceForType = (type) => {
        if (!balance) return 'N/A';
        switch (type) {
            case 'Casual': return balance.casualLeaves?.current ?? 'N/A';
            case 'Sick': return balance.sickLeaves?.current ?? 'N/A';
            case 'Earned': return balance.earnedLeaves?.current ?? 'N/A';
            case 'Compensatory': return balance.compensatoryLeaves?.current ?? 'N/A';
            // Maternity/Paternity are often granted, maybe check if quota exists > 0?
            // Add logic based on your balance schema
            default: return 'N/A';
        }
    };

    // Determine if submit button should be disabled
    const isSubmitDisabled = isSubmitting || calculatedDays <= 0 || !leaveType || !reason || error.includes("cannot start") || error.includes("cannot end") || error.includes("no working days");


    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogContent>
                 <Typography variant="body1" gutterBottom>
                    Selected Dates: <strong>{startStr}</strong> to <strong>{endStr}</strong>
                 </Typography>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      Calculated Working Days: {calculatedDays > 0 ? calculatedDays : 'N/A'}
                  </Typography>

                 <FormControl fullWidth margin="normal" required error={!!error && error.includes("leave type")}>
                     <InputLabel id="leave-type-modal-label">Leave Type</InputLabel>
                     <Select
                         labelId="leave-type-modal-label"
                         value={leaveType}
                         label="Leave Type"
                         onChange={(e) => { setLeaveType(e.target.value); setError(''); }} // Clear error on change
                     >
                         {/* Dynamically generate options */}
                         {balance?.casualLeaves && <MenuItem value="Casual">Casual Leave ({getBalanceForType('Casual')} avail.)</MenuItem>}
                         {balance?.sickLeaves && <MenuItem value="Sick">Sick Leave ({getBalanceForType('Sick')} avail.)</MenuItem>}
                         {balance?.earnedLeaves && <MenuItem value="Earned">Earned Leave ({getBalanceForType('Earned')} avail.)</MenuItem>}
                         {balance?.compensatoryLeaves && balance.compensatoryLeaves.current > 0 && <MenuItem value="Compensatory">Compensatory Off ({getBalanceForType('Compensatory')} avail.)</MenuItem>}
                         {/* Add Maternity/Paternity if needed based on policy */}
                         {/* {balance?.maternityLeaves && <MenuItem value="Maternity">Maternity Leave</MenuItem>} */}
                         {/* {balance?.paternityLeaves && <MenuItem value="Paternity">Paternity Leave</MenuItem>} */}
                         <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
                     </Select>
                      {error && error.includes("leave type") && <FormHelperText error>Leave type is required.</FormHelperText>}
                 </FormControl>

                 <TextField
                     margin="dense"
                     id="reason-modal"
                     label="Reason for Leave"
                     type="text"
                     fullWidth
                     variant="outlined"
                     required
                     multiline
                     rows={3}
                     value={reason}
                     onChange={(e) => { setReason(e.target.value); setError(''); }} // Clear error on change
                     error={!!error && error.includes("reason")}
                     helperText={error && error.includes("reason") ? "Reason is required." : ""}
                 />

                 {/* Display balance warning if applicable */}
                 {leaveType && leaveType !== 'Unpaid' && balance && calculatedDays > 0 && (
                      (() => {
                          const typeKey = leaveType === 'Casual' ? 'casualLeaves' : leaveType === 'Sick' ? 'sickLeaves' : leaveType === 'Earned' ? 'earnedLeaves' : leaveType === 'Compensatory' ? 'compensatoryLeaves' : null;
                          if (typeKey && balance[typeKey]?.current < calculatedDays) {
                              return <Alert severity="warning" sx={{ mt: 2 }}>Insufficient &apos;{leaveType}&apos; balance ({balance[typeKey].current} available) for {calculatedDays} selected working days.</Alert>;
                          }
                          return null;
                      })()
                  )}

                 {/* Display general submission errors */}
                 {error && !(error.includes("leave type") || error.includes("reason") || error.includes("Insufficient") || error.includes("cannot start") || error.includes("cannot end") || error.includes("no working days")) &&
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                 }

            </DialogContent>
            <DialogActions>
                 <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                 <Button
                     onClick={handleSubmit}
                     disabled={isSubmitDisabled}
                     variant="contained"
                 >
                     {isSubmitting ? <CircularProgress size={20} /> : "Submit Application"}
                 </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LeaveApplyModal;