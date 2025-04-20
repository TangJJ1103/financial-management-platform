"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { getUserById, updateUser } from "../../dataHooks/userHooks";

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    currencyType: "MYR",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user ID from session storage
        const userData = JSON.parse(sessionStorage.getItem("user"));
        if (!userData || !userData.userId) {
          throw new Error("User not authenticated");
        }

        const response = await getUserById();
        console.log(response);
        if (!response.error) {
          setUser(response.data.userData);

          setFormData({
            name: response.data.userData.name,
            username: response.data.userData.username,
            email: response.data.userData.email || "",
            currencyType: response.data.userData.currencyType,
          });

          setPasswordData({
            ...passwordData,
            currentPassword: response.data.userData.password,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load user data",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleProfileUpdate = async () => {
    try {
      // Prepare data for API
      const updateData = {
        userId: user.userId,
        name: formData.name,
        username: formData.username,
        email: formData.email,
        currencyType: formData.currencyType,
      };

      const response = await updateUser(updateData);

      if (!response.error) {
        setSnackbar({
          open: true,
          message: "Profile updated successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords don't match",
        severity: "error",
      });
      return;
    }
    if (passwordData.newPassword == passwordData.currentPassword) {
      setSnackbar({
        open: true,
        message: "The new password cannot be the same with current password",
        severity: "error",
      });
      return;
    }

    try {
      // Prepare data for API
      const passwordUpdateData = {
        userId: user.userId,
        newPassword: passwordData.newPassword,
      };

      // Here you would call your API to update the password
      // For now, we'll just simulate a successful update
      console.log("Password data to update:", passwordUpdateData);

      setSnackbar({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setSnackbar({
        open: true,
        message: "Failed to update password",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <Typography>Loading user data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Account Management
      </Typography>

      <Paper elevation={2} sx={{ mt: 3, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="account management tabs"
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab label="Profile" id="account-tab-0" />
            <Tab label="Security" id="account-tab-1" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ProfileAvatar
                src="/placeholder.svg?height=120&width=120"
                alt={`${formData.username}`}
              />
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ mt: 2 }}
                >
                  Change Photo
                  <VisuallyHiddenInput type="file" accept="image/*" />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="userName"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Currency"
                    name="currencyType"
                    value={formData.currencyType}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleProfileUpdate}
                    sx={{ mt: 2 }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Grid container spacing={2} maxWidth="md">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LockResetIcon />}
                onClick={handlePasswordUpdate}
                sx={{ mt: 2 }}
              >
                Update Password
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

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

export default AccountManagement;
