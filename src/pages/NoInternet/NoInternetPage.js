"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { WifiOff, Refresh, SignalWifiOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// Add the import for getServerPing at the top of the file
import getServerPing from "../../dataHooks/getServerPing";

// Update the NoInternetPage component to be more robust
const NoInternetPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [connectionRestored, setConnectionRestored] = useState(false);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Don't immediately set connectionRestored - let the ping check confirm it
      handleRetry();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setConnectionRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Redirect to home when connection is confirmed restored
  useEffect(() => {
    let redirectTimer;

    if (connectionRestored) {
      redirectTimer = setTimeout(() => {
        navigate("/home");
      }, 2000);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [connectionRestored, navigate]);

  // Check connection on component mount
  useEffect(() => {
    // Initial connection check when the page loads
    if (!isChecking && !connectionRestored) {
      handleRetry();
    }
  }, []);

  const handleRetry = async () => {
    // Don't do anything if already checking
    if (isChecking) return;

    setIsChecking(true);

    try {
      const result = await getServerPing();

      if (result.isOnline) {
        setIsOffline(false);
        setConnectionRestored(true);
      } else {
        setIsOffline(true);
        setConnectionRestored(false);
      }
    } catch (error) {
      console.log("Network check failed:", error);
      setIsOffline(true);
      setConnectionRestored(false);
    } finally {
      setLastChecked(new Date());
      setIsChecking(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 2,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 500 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            textAlign: "center",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isOffline ? (
                <WifiOff
                  sx={{
                    fontSize: { xs: 60, sm: 80 },
                    color: theme.palette.error.main,
                    mb: 2,
                  }}
                />
              ) : (
                <SignalWifiOff
                  sx={{
                    fontSize: { xs: 60, sm: 80 },
                    color: theme.palette.success.main,
                    mb: 2,
                  }}
                />
              )}
            </motion.div>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {isOffline ? "No Internet Connection" : "Connection Restored!"}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
            >
              {isOffline
                ? "We can't reach our servers. Please check your internet connection and try again."
                : "Your internet connection has been restored. Redirecting you back..."}
            </Typography>

            {isOffline && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1 }}
                >
                  Last checked: {lastChecked.toLocaleTimeString()}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={
                    isChecking ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Refresh />
                    )
                  }
                  onClick={handleRetry}
                  disabled={isChecking}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  {isChecking ? "Checking Connection..." : "Try Again"}
                </Button>
              </Box>
            )}

            {connectionRestored && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Redirecting to dashboard...
                </Typography>
              </Box>
            )}

            {isOffline && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  If you continue to experience issues:
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • Check your Wi-Fi or cellular data connection
                  <br />• Try refreshing the page
                  <br />• Restart your router if needed
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default NoInternetPage;
