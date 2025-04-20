"use client";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";

/**
 * Dialog component for confirming goal deletion
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object} props.goal - The goal to delete
 * @param {Function} props.onConfirm - Function to handle confirmation
 * @param {boolean} props.loading - Whether deletion is in progress
 */
const DeleteGoalDialog = ({ open, onClose, goal, onConfirm, loading }) => {
  if (!goal) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Goal</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the goal{" "}
          <strong>{goal.name || goal.goalName}</strong>? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteGoalDialog;
