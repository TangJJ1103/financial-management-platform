"use client";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import { Receipt as ReceiptIcon } from "@mui/icons-material";

/**
 * Desktop version of the Transaction Details Dialog
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object} props.transaction - The transaction object
 * @param {Function} props.formatCurrency - Function to format currency
 * @param {Function} props.formatDateTime - Function to format date with time
 */
const TransactionDetailsDialog = ({
  open,
  onClose,
  transaction,
  formatCurrency,
  formatDateTime,
}) => {
  const theme = useTheme();

  if (!transaction) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight="medium">
            Transaction Details
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Amount
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight="bold">
            {formatCurrency(transaction.amount)}
          </Typography>
        </Paper>

        <Box sx={{ mb: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
            {transaction.description || "No description provided"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Date & Time
          </Typography>
          <Typography variant="body1">
            {formatDateTime(transaction.transactionDate)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Transaction ID
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {transaction.transactionId}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetailsDialog;
