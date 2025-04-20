"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  ArrowCircleUp as ArrowCircleUpIcon,
  PreviewRounded as PreviewRoundedIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

/**
 * Mobile version of the Transaction History Dialog
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object} props.goal - The goal object
 * @param {Array} props.transactions - Array of transactions
 * @param {boolean} props.loading - Whether transactions are loading
 * @param {Function} props.onViewTransaction - Function to view transaction details
 * @param {Function} props.formatCurrency - Function to format currency
 * @param {Function} props.formatDate - Function to format date
 * @param {Function} props.formatDateTime - Function to format date with time
 */
const TransactionHistoryDialogMobile = ({
  open,
  onClose,
  goal,
  transactions = [],
  loading = false,
  onViewTransaction,
  formatCurrency,
  formatDate,
  formatDateTime,
}) => {
  const theme = useTheme();

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
            Transaction History
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
        {goal && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight="medium">
              {goal.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {goal.isAchieved
                ? `Achieved on ${formatDate(goal.achievedDate)}`
                : `Target: ${formatCurrency(goal.targetAmount)} by ${formatDate(
                    goal.targetDate || goal.deadline
                  )}`}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : transactions.length > 0 ? (
          <List sx={{ width: "100%", p: 0 }}>
            {transactions.map((transaction) => (
              <React.Fragment key={transaction.transactionId}>
                <ListItem
                  sx={{ px: 2, py: 1.5 }}
                  onClick={() => onViewTransaction(transaction)}
                >
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 36,
                      height: 36,
                      mr: 2,
                    }}
                  >
                    <ArrowCircleUpIcon fontSize="small" />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          noWrap
                          sx={{ maxWidth: "60%" }}
                        >
                          {transaction.description || "Savings deposit"}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color="primary.main"
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(transaction.transactionDate)}
                        </Typography>
                        <IconButton
                          size="small"
                          edge="end"
                          sx={{
                            p: 0.5,
                            color: theme.palette.text.secondary,
                            "&:hover": { color: theme.palette.primary.main },
                          }}
                        >
                          <PreviewRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary" variant="body2">
              No transactions found for this goal.
            </Typography>
          </Box>
        )}
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

export default TransactionHistoryDialogMobile;
