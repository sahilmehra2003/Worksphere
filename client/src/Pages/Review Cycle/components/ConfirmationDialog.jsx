import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@mui/material';

// eslint-disable-next-line react/prop-types
const ConfirmationDialog = ({ open, handleClose, onConfirm, title, message }) => (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={onConfirm} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
    </Dialog>
);

export default ConfirmationDialog; 