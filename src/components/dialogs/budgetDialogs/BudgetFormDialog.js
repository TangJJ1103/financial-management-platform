"use client";
import {
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
  Box,
} from "@mui/material";
import {
  getCategoryNames,
  getCategoryIcon,
} from "../../../constants/financeCategories";

/**
 * Dialog component for adding or editing a budget
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {string} props.mode - Dialog mode ("add" or "edit")
 * @param {Object} props.formData - Form data for the budget
 * @param {Function} props.onInputChange - Function to handle input changes
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {boolean} props.submitLoading - Whether submission is in progress
 * @param {string} props.error - Error message to display
 */
const BudgetFormDialog = ({
  open,
  onClose,
  mode,
  formData,
  onInputChange,
  onSubmit,
  submitLoading,
  error,
}) => {
  // Only show if mode is add or edit
  if (mode !== "add" && mode !== "edit") return null;

  const categories = getCategoryNames();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "add" ? "Add New Budget" : "Edit Budget"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              disabled={mode === "edit"}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monthly Budget"
              name="monthlyBudget"
              value={formData.monthlyBudget}
              onChange={onInputChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>MYR</Typography>,
              }}
              required
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

export default BudgetFormDialog;
