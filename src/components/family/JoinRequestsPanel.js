"use client";

import React from "react";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Skeleton,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  getJoinRequests,
  respondToJoinRequest,
} from "../../dataHooks/familyHooks";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const JoinRequestsPanel = ({
  setJoinRequestsCount,
  joinRequestsCount,
  fetchFamilyMembers,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch join requests
  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;
        if (!familyId) {
          setError(
            "Family ID not found. Please make sure you're part of a family."
          );
          setLoading(false);
          return;
        }

        const response = await getJoinRequests(familyId);

        if (response.error) {
          setError(response.message || "Failed to load join requests");
          setJoinRequests([]);
        } else {
          setJoinRequests(response.data.joinRequests || []);
        }
      } catch (err) {
        console.error("Error fetching join requests:", err);
        setError("Failed to load join requests. Please try again later.");
        setJoinRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinRequests();
  }, []);

  // Handle responding to a join request
  const handleRespondToRequest = async (joinRequestId, userId, accept) => {
    // Add to processing list
    setProcessingIds((prev) => [...prev, joinRequestId]);

    try {
      const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;
      if (!familyId) {
        setError(
          "Family ID not found. Please make sure you're part of a family."
        );
        return;
      }

      const response = await respondToJoinRequest({
        familyId,
        userId,
        accept, // Boolean value: true for accept, false for decline
      });

      if (response.error) {
        setError(
          response.message ||
            `Failed to ${accept ? "accept" : "decline"} request`
        );
      } else {
        // Remove the request from the list
        setJoinRequests((prev) =>
          prev.filter((req) => req.joinRequestId !== joinRequestId)
        );

        setJoinRequestsCount(joinRequestsCount - 1);
        fetchFamilyMembers();

        // Show success message
        setSnackbar({
          open: true,
          message: `Request ${accept ? "accepted" : "declined"} successfully`,
          severity: "success",
        });
      }
    } catch (err) {
      console.error(
        `Error ${accept ? "accepting" : "declining"} request:`,
        err
      );
      setError(
        `Failed to ${accept ? "accept" : "decline"} request. Please try again.`
      );
    } finally {
      // Remove from processing list
      setProcessingIds((prev) => prev.filter((id) => id !== joinRequestId));
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

  // Loading skeletons
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          {isMobile ? (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ width: "100%" }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="80%" height={20} />
              </CardContent>
              <CardActions>
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={36}
                  sx={{ borderRadius: 1, mr: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={36}
                  sx={{ borderRadius: 1 }}
                />
              </CardActions>
            </Card>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ mr: 2 }}
                  />
                  <Box>
                    <Skeleton variant="text" width={150} height={24} />
                    <Skeleton variant="text" width={100} height={20} />
                  </Box>
                </Box>
                <Box>
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    sx={{ borderRadius: 1, mr: 1, display: "inline-block" }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={36}
                    sx={{ borderRadius: 1, display: "inline-block" }}
                  />
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      ));
  };

  return (
    <Box sx={{ width: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            fontWeight="medium"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PersonAddIcon color="primary" />
            Join Requests
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          renderSkeletons()
        ) : joinRequests.length > 0 ? (
          <List sx={{ p: 0 }}>
            {joinRequests.map((request) => {
              const avatar = getDefaultAvatar(request.name);
              const isProcessing = processingIds.includes(
                request.joinRequestId
              );

              return isMobile ? (
                <Card
                  key={request.joinRequestId}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar sx={{ bgcolor: avatar.color, mr: 2 }}>
                        {avatar.initials}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {request.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.email || "No email provided"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <HourglassEmptyIcon
                        fontSize="small"
                        sx={{ color: "text.secondary", mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Requested {formatDate(request.createdOn)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleIcon />}
                      disabled={isProcessing}
                      onClick={() =>
                        handleRespondToRequest(
                          request.joinRequestId,
                          request.userId,
                          true
                        )
                      }
                      sx={{ mr: 1 }}
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
                        handleRespondToRequest(
                          request.joinRequestId,
                          request.userId,
                          false
                        )
                      }
                    >
                      {isProcessing ? "Processing..." : "Decline"}
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <React.Fragment key={request.joinRequestId}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      opacity: isProcessing ? 0.7 : 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: avatar.color }}>
                        {avatar.initials}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {request.name}
                        </Typography>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {request.email || "No email provided"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <HourglassEmptyIcon
                              fontSize="small"
                              sx={{ color: "text.secondary", mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Requested {formatDate(request.createdOn)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<CheckCircleIcon />}
                        disabled={isProcessing}
                        onClick={() =>
                          handleRespondToRequest(
                            request.joinRequestId,
                            request.userId,
                            true
                          )
                        }
                        sx={{ mr: 1 }}
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
                          handleRespondToRequest(
                            request.joinRequestId,
                            request.userId,
                            false
                          )
                        }
                      >
                        {isProcessing ? "Processing..." : "Decline"}
                      </Button>
                    </Box>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: "center",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.02)",
            }}
          >
            <PersonAddIcon
              sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="subtitle1" gutterBottom>
              No Join Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are currently no pending requests to join your family.
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

export default JoinRequestsPanel;
