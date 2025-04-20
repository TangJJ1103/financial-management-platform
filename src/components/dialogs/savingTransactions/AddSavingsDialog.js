"use client";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  LinearProgress,
  CircularProgress,
} from "@mui/material";

/**
 * Dialog component for adding savings to a goal
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object} props.goal - The goal to add savings to
 * @param {Object} props.savingsData - Form data for the savings
 * @param {Function} props.onInputChange - Function to handle input changes
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {boolean} props.submitLoading - Whether submission is in progress
 * @param {string} props.error - Error message to display
 * @param {Function} props.formatCurrency - Function to format currency
 * @param {Function} props.calculatePercentage - Function to calculate percentage
 */
const AddSavingsDialog = ({
  open,
  onClose,
  goal,
  savingsData,
  onInputChange,
  onSubmit,
  submitLoading,
  error,
  formatCurrency,
  calculatePercentage,
}) => {
  if (!goal) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Savings</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Adding savings to: {goal.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Current progress: {formatCurrency(goal.currentAmount)} of{" "}
                  {formatCurrency(goal.targetAmount)}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {calculatePercentage(goal.currentAmount, goal.targetAmount)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculatePercentage(
                  goal.currentAmount,
                  goal.targetAmount
                )}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount to Add"
              name="amount"
              value={savingsData.amount}
              onChange={onInputChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>MYR</Typography>,
              }}
              required
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={savingsData.description}
              onChange={onInputChange}
              placeholder="e.g., Monthly savings, Bonus deposit"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Remaining to goal:{" "}
              {formatCurrency(goal.targetAmount - goal.currentAmount)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitLoading}>
          {submitLoading ? <CircularProgress size={24} /> : "Add Savings"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSavingsDialog;
