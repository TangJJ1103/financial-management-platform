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
  ListItemIcon,
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
} from "@mui/icons-material";

/**
 * Desktop version of the Transaction History Dialog
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
const TransactionHistoryDialog = ({
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight="medium">
            Transaction History
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {goal && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {goal.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
            <CircularProgress />
          </Box>
        ) : transactions.length > 0 ? (
          <List
            sx={{
              width: "100%",
              maxHeight: 400,
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.2)",
                borderRadius: "10px",
                "&:hover": {
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0,0,0,0.3)",
                },
              },
            }}
          >
            {transactions.map((transaction) => (
              <React.Fragment key={transaction.transactionId}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color="primary.main"
                        sx={{ mr: 1 }}
                      >
                        {formatCurrency(transaction.amount)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => onViewTransaction(transaction)}
                        sx={{
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <PreviewRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <ArrowCircleUpIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        {transaction.description || "Savings deposit"}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(transaction.transactionDate)}
                      </Typography>
                    }
                    sx={{ my: 0.5 }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No transactions found for this goal.
            </Typography>
          </Box>
        )}
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

export default TransactionHistoryDialog;
