"use client";

import { useState, useContext } from "react";
import Stack from "@mui/material/Stack";
import {
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Box,
  InputBase,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ThemeContext } from "../components/themeProvider";
import isLogin from "../globalFunction/isLogin";

export default function Header() {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      message: "You've exceeded your Food & Dining budget",
      time: "10 minutes ago",
    },
    { id: 2, message: "New family expense added by Bob", time: "1 hour ago" },
    {
      id: 3,
      message: "Reminder: Utility bill due tomorrow",
      time: "3 hours ago",
    },
  ];

  // If we're in the mobile AppBar, render a simplified header
  if (isMobile && isLogin()) {
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ ml: "auto" }}
      >
        <IconButton
          onClick={toggleColorMode}
          size="small"
          sx={{
            color:
              theme.palette.mode === "dark" ? "primary.light" : "primary.main",
          }}
        >
          {mode === "dark" ? (
            <LightModeIcon fontSize="small" />
          ) : (
            <DarkModeIcon fontSize="small" />
          )}
        </IconButton>

        <IconButton
          size="small"
          color="inherit"
          onClick={handleNotificationOpen}
        >
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: { width: { xs: 280, sm: 320 }, maxHeight: 400 },
          }}
        >
          <MenuItem>
            <Typography variant="subtitle1" fontWeight="bold">
              Notifications
            </Typography>
          </MenuItem>
          <Divider />
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationClose}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <Typography variant="body2">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem>
              <Typography variant="body2">No new notifications</Typography>
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleNotificationClose}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ width: "100%", textAlign: "center" }}
            >
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>

        <Avatar
          sx={{
            width: 30,
            height: 30,
            bgcolor: theme.palette.primary.main,
            fontSize: "0.875rem",
            fontWeight: "bold",
          }}
        >
          RC
        </Avatar>
      </Stack>
    );
  } else {
    return (
      <Stack
        direction="row"
        sx={{
          display: "flex",
          width: "100%",
          minHeight: "5vh",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
        spacing={2}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary"
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          FinCollab
        </Typography>

        {isLogin() && (
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                width: { xs: 120, sm: 200, md: 300 },
                borderRadius: 20,
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search..."
                inputProps={{ "aria-label": "search" }}
              />
              <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>

            {/* Theme Toggle Button */}
            <IconButton
              onClick={toggleColorMode}
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? "primary.light"
                    : "primary.main",
              }}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: { width: 320, maxHeight: 400 },
              }}
            >
              <MenuItem>
                <Typography variant="subtitle1" fontWeight="bold">
                  Notifications
                </Typography>
              </MenuItem>
              <Divider />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={handleNotificationClose}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <Typography variant="body2">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem>
                  <Typography variant="body2">No new notifications</Typography>
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleNotificationClose}>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ width: "100%", textAlign: "center" }}
                >
                  View all notifications
                </Typography>
              </MenuItem>
            </Menu>

            <IconButton sx={{ display: { xs: "none", sm: "flex" } }}>
              <HelpOutlineIcon />
            </IconButton>

            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>
    );
  }
}
