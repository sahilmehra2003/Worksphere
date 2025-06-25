import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Typography,
  Box,
  Button,
  Modal,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { InputAdornment,IconButton } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const CorrectionRequestModal = ({
  open,
  onClose,
  onSubmit,
  record,
  loading = false,
}) => {
  const [correctionType, setCorrectionType] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [reason, setReason] = useState("");
  const checkInInputRef = useRef();
  const checkOutInputRef = useRef();
  const theme = useTheme();
  useEffect(() => {
    if (record) {
      // Pre-fill times if they exist, converting to HH:mm format for time input
      setCheckInTime(
        record.checkInTime
          ? new Date(record.checkInTime).toTimeString().substring(0, 5)
          : ""
      );
      setCheckOutTime(
        record.checkOutTime
          ? new Date(record.checkOutTime).toTimeString().substring(0, 5)
          : ""
      );
      setCorrectionType("");
      setReason("");
    }
  }, [record]);

  const handleSubmit = () => {
    const correctionData = {
      attendanceId: record._id,
      type: correctionType,
      reason,
      // Combine date with new time for a full ISO string
      ...(checkInTime && {
        checkInTime: new Date(
          `${record.date.substring(0, 10)}T${checkInTime}`
        ).toISOString(),
      }),
      ...(checkOutTime && {
        checkOutTime: new Date(
          `${record.date.substring(0, 10)}T${checkOutTime}`
        ).toISOString(),
      }),
    };
    onSubmit(correctionData);
  };

  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Request Attendance Correction
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          For Date: {new Date(record.date).toLocaleDateString()}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Type of Correction</InputLabel>
              <Select
                value={correctionType}
                label="Type of Correction"
                onChange={(e) => setCorrectionType(e.target.value)}
              >
                <MenuItem value="Forgot to Check-In">
                  Forgot to Check-In
                </MenuItem>
                <MenuItem value="Forgot to Check-Out">
                  Forgot to Check-Out
                </MenuItem>
                <MenuItem value="Incorrect Check-In Time">
                  Incorrect Check-In Time
                </MenuItem>
                <MenuItem value="Incorrect Check-Out Time">
                  Incorrect Check-Out Time
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Check-In Time"
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              inputRef={checkInInputRef}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        checkInInputRef.current?.showPicker?.() ||
                        checkInInputRef.current?.focus()
                      }
                    >
                      <AccessTimeIcon
                        sx={{ color: theme.palette.text.primary }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              slotProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Check-Out Time"
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              inputRef={checkOutInputRef}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        checkOutInputRef.current?.showPicker?.() ||
                        checkOutInputRef.current?.focus()
                      }
                    >
                      <AccessTimeIcon
                        sx={{ color: theme.palette.text.primary }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              slotProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Reason for Correction"
              multiline
              rows={3}
              required
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !correctionType || !reason}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

CorrectionRequestModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  record: PropTypes.object,
  loading: PropTypes.bool,
};

export default CorrectionRequestModal;
