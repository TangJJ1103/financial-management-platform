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
  MenuItem,
  Grid,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { getCategoryNames } from "../../../constants/financeCategories";

/**
 * Dialog component for adding or editing a goal
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {string} props.mode - Dialog mode ("add" or "edit")
 * @param {Object} props.formData - Form data for the goal
 * @param {Function} props.onInputChange - Function to handle input changes
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {boolean} props.submitLoading - Whether submission is in progress
 * @param {string} props.error - Error message to display
 * @param {Array} props.goalCategories - Available goal categories
 * @param {Array} props.priorityOptions - Available priority options
 * @param {Array} props.goalTimeframes - Available timeframe options
 */
const GoalFormDialog = ({
  open,
  onClose,
  mode,
  formData,
  onInputChange,
  onSubmit,
  submitLoading,
  error,
  goalCategories,
  priorityOptions,
  goalTimeframes,
}) => {
  // Only show if mode is add or edit
  if (mode !== "add" && mode !== "edit") return null;

  // Use standardized categories
  const categories = getCategoryNames();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === "add" ? "Add New Goal" : "Edit Goal"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Goal Name"
              name="goalName"
              value={formData.goalName}
              onChange={onInputChange}
              required
              placeholder="e.g., New Car, Emergency Fund"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {goalCategories.find((cat) => cat.name === category)
                      ?.icon || goalCategories[0].icon}
                    <span>{category}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={onInputChange}
              required
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Timeframe"
              name="timeframe"
              value={formData.timeframe}
              onChange={onInputChange}
            >
              {goalTimeframes.map((timeframe) => (
                <MenuItem key={timeframe} value={timeframe}>
                  {timeframe}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Target Amount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={onInputChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>MYR</Typography>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current Amount"
              name="currentAmount"
              value={formData.currentAmount}
              onChange={onInputChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>MYR</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Target Date"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={onInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: dayjs().format("YYYY-MM-DD"), // Set minimum date to today
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              multiline
              rows={3}
              placeholder="Add details about your goal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitLoading}>
          {submitLoading ? (
            <CircularProgress size={24} />
          ) : mode === "add" ? (
            "Add"
          ) : (
            "Save"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalFormDialog;
