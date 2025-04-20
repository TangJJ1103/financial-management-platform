"use client";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Fingerprint as FingerprintIcon,
} from "@mui/icons-material";

/**
 * Mobile version of the Transaction Details Dialog
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object} props.transaction - The transaction object
 * @param {Function} props.formatCurrency - Function to format currency
 * @param {Function} props.formatDateTime - Function to format date with time
 */
const TransactionDetailsDialogMobile = ({
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
      fullScreen
      PaperProps={{
        sx: {
          background: theme.palette.background.default,
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" component="span" fontWeight="medium">
            Transaction Details
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Amount Section */}
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.8 }}>
            AMOUNT
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
            {formatCurrency(transaction.amount)}
          </Typography>
        </Box>

        {/* Details List */}
        <Box sx={{ p: 0 }}>
          {/* Description */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ mr: 2, color: theme.palette.text.secondary }}>
              <DescriptionIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                DESCRIPTION
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                {transaction.description || "No description provided"}
              </Typography>
            </Box>
          </Box>

          {/* Date & Time */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ mr: 2, color: theme.palette.text.secondary }}>
              <CalendarIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                DATE & TIME
              </Typography>
              <Typography variant="body1">
                {formatDateTime(transaction.transactionDate)}
              </Typography>
            </Box>
          </Box>

          {/* Transaction ID */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ mr: 2, color: theme.palette.text.secondary }}>
              <FingerprintIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                TRANSACTION ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                {transaction.transactionId}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          size="large"
          sx={{ borderRadius: 8 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetailsDialogMobile;
