"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { respondToInvitation } from "../../dataHooks/familyHooks";
import { useFamilyInvitations } from "../../components/family/FamilyInvitationsContext";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const FamilyInvitations = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use the family invitations context
  const {
    invitations,
    loading,
    error,
    fetchInvitations,
    markInvitationResponded,
  } = useFamilyInvitations();

  const [processingIds, setProcessingIds] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handle responding to an invitation
  const handleRespondToInvitation = async (invitationId, accept) => {
    // Add to processing list
    setProcessingIds((prev) => [...prev, invitationId]);

    try {
      const userId = JSON.parse(sessionStorage.getItem("user"))?.userId;
      if (!userId) {
        setSnackbar({
          open: true,
          message: "User ID not found. Please make sure you're logged in.",
          severity: "error",
        });
        return;
      }

      const response = await respondToInvitation({
        invitationId,
        userId,
        accept, // Boolean value: true for accept, false for decline
      });

      if (response.error) {
        setSnackbar({
          open: true,
          message:
            response.message ||
            `Failed to ${accept ? "accept" : "decline"} invitation`,
          severity: "error",
        });
      } else {
        // Update session storage if accepted
        if (accept && response.data?.family) {
          sessionStorage.setItem(
            "family",
            JSON.stringify(response.data.family)
          );
          sessionStorage.setItem("familyRole", response.data.role || "member");

          // Trigger storage event to update UI
          window.dispatchEvent(
            new CustomEvent("familyStatusChanged", {
              detail: { hasFamily: true },
            })
          );
        }

        // Mark the invitation as responded to in the context
        markInvitationResponded(invitationId);

        // Show success message
        setSnackbar({
          open: true,
          message: accept
            ? "Invitation accepted successfully!"
            : "Invitation declined",
          severity: accept ? "success" : "info",
        });
      }
    } catch (err) {
      console.error(
        `Error ${accept ? "accepting" : "declining"} invitation:`,
        err
      );
      setSnackbar({
        open: true,
        message: `Failed to ${
          accept ? "accept" : "decline"
        } invitation. Please try again.`,
        severity: "error",
      });
    } finally {
      // Remove from processing list
      setProcessingIds((prev) => prev.filter((id) => id !== invitationId));
    }
  };

  // Get default avatar for users
  const getDefaultAvatar = (name) => {
    if (!name) return { color: "#9e9e9e", initials: "?" };

    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate HSL color with good saturation and lightness for visibility
    const h = Math.abs(hash) % 360;
    const s = 65 + (Math.abs(hash) % 25); // 65-90% saturation
    const l = 55 + (Math.abs(hash) % 10); // 55-65% lightness for good contrast

    // Get initials (first letter of first and last name)
    const nameParts = name.split(" ");
    let initials = nameParts[0][0].toUpperCase();
    if (nameParts.length > 1 && nameParts[1].length > 0) {
      initials += nameParts[1][0].toUpperCase();
    } else if (name.length > 1) {
      initials += name[1].toUpperCase();
    }

    return {
      color: `hsl(${h}, ${s}%, ${l}%)`,
      initials: initials,
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).fromNow();
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchInvitations(true);
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GroupIcon color="primary" />
            Family Invitations
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : invitations.length > 0 ? (
          <List>
            {invitations.map((invitation) => {
              const avatar = getDefaultAvatar(invitation.familyName);
              const isProcessing = processingIds.includes(
                invitation.invitationId
              );

              return isMobile ? (
                <Card
                  key={invitation.invitationId}
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ bgcolor: avatar.color, mr: 2 }}>
                          {avatar.initials}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {invitation.familyName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Invited by {invitation.inviterName}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(invitation.createdOn)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleIcon />}
                      disabled={isProcessing}
                      onClick={() =>
                        handleRespondToInvitation(invitation.invitationId, true)
                      }
                    >
                      {isProcessing ? "Processing..." : "Accept"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      disabled={isProcessing}
                      onClick={() =>
                        handleRespondToInvitation(
                          invitation.invitationId,
                          false
                        )
                      }
                    >
                      {isProcessing ? "Processing..." : "Decline"}
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <ListItem
                  key={invitation.invitationId}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: avatar.color }}>
                      {avatar.initials}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={invitation.familyName}
                    secondary={`Invited by ${
                      invitation.inviterName
                    } - ${formatDate(invitation.createdOn)}`}
                  />
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      disabled={isProcessing}
                      onClick={() =>
                        handleRespondToInvitation(invitation.invitationId, true)
                      }
                      sx={{ mr: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      disabled={isProcessing}
                      onClick={() =>
                        handleRespondToInvitation(
                          invitation.invitationId,
                          false
                        )
                      }
                    >
                      Decline
                    </Button>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: "center",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.02)",
            }}
          >
            <GroupIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Family Invitations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any pending family invitations.
            </Typography>
          </Paper>
        )}
      </motion.div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FamilyInvitations;
