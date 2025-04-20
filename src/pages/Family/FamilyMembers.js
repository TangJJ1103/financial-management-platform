"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PersonRemove as PersonRemoveIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Mail as MailIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  NotificationsActive as NotificationsActiveIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import {
  getFamilyMembers,
  inviteToFamily,
  removeFamilyMember,
  getJoinRequests,
  updateFamilyRole,
} from "../../dataHooks/familyHooks";
import JoinRequestsPanel from "../../components/family/JoinRequestsPanel";

const FamilyMembers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [joinRequestsCount, setJoinRequestsCount] = useState(0);

  // Dialog states
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchFamilyMembers = async () => {
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

      const userRole = sessionStorage.getItem("familyRole");
      setIsAdmin(userRole === "parent");
      const response = await getFamilyMembers(familyId);

      if (response.error) {
        setError(response.message || "Failed to load family members");
        setMembers([]);
      } else {
        setMembers(response.data.members || []);
      }

      // If user is admin, fetch join requests count
      if (userRole === "parent") {
        try {
          const joinRequestsResponse = await getJoinRequests(familyId);
          if (joinRequestsResponse.data.joinRequests) {
            setJoinRequestsCount(
              joinRequestsResponse.data.joinRequests.length || 0
            );
          }
        } catch (err) {
          console.error("Error fetching join requests count:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching family members:", err);
      setError("Failed to load family members. Please try again later.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };
  // Fetch family members
  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Get default avatar for users
  const getDefaultAvatar = (name) => {
    if (!name) return { color: "#9e9e9e", initials: "?" };

    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate HSL color with good saturation and lightness for visibility in both themes
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
    return dayjs(dateString).format("MMM D, YYYY");
  };

  // Handle opening invite dialog
  const handleOpenInviteDialog = () => {
    setInviteEmail("");
    setOpenInviteDialog(true);
  };

  // Handle closing invite dialog
  const handleCloseInviteDialog = () => {
    setOpenInviteDialog(false);
  };

  // Handle opening remove dialog
  const handleOpenRemoveDialog = (member) => {
    setSelectedMember(member);
    setOpenRemoveDialog(true);
  };

  // Handle closing remove dialog
  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setSelectedMember(null);
  };

  const handleOpenRoleDialog = (member) => {
    setSelectedMember(member);
    setSelectedRole(member.role || "child");
    setOpenRoleDialog(true);
  };

  // Add this function to handle closing the role dialog
  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedMember(null);
    setSelectedRole("");
  };

  // Handle sending invitation
  const handleSendInvite = async () => {
    if (!inviteEmail) {
      setError("Please enter an email address");
      return;
    }

    setInviteLoading(true);
    try {
      const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;
      const userId = JSON.parse(sessionStorage.getItem("user"))?.userId;

      const response = await inviteToFamily({
        familyId,
        email: inviteEmail,
        invitedBy: userId,
      });

      if (response.error) {
        setError(response.message || "Failed to send invitation");
      } else {
        // Close dialog and show success message
        handleCloseInviteDialog();
        setError(null);
        setSnackbar({
          open: true,
          message: "Invitation sent successfully!",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Error sending invitation:", err);
      setError("Failed to send invitation. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle removing a member
  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setRemoveLoading(true);
    try {
      // Call the API to remove the member
      const response = await removeFamilyMember(selectedMember.userId);

      if (response.error) {
        setError(response.message || "Failed to remove member");
        setRemoveLoading(false);
        handleCloseRemoveDialog();
        return;
      }

      // Update the members list by removing the selected member
      setMembers(
        members.filter((member) => member.userId !== selectedMember.userId)
      );
      setSnackbar({
        open: true,
        message: `${selectedMember.name} has been removed from the family`,
        severity: "success",
      });
      handleCloseRemoveDialog();
    } catch (err) {
      console.error("Error removing member:", err);
      setError("Failed to remove member. Please try again.");
    } finally {
      setRemoveLoading(false);
    }
  };

  // Add this function to handle updating the role
  const handleUpdateRole = async () => {
    if (!selectedMember || !selectedRole) return;

    setRoleLoading(true);
    try {
      // Call the API to update the member's role
      const response = await updateFamilyRole({
        userId: selectedMember.userId,
        role: selectedRole,
      });

      if (response.error) {
        setError(response.message || "Failed to update role");
        setRoleLoading(false);
        handleCloseRoleDialog();
        return;
      }

      // Update the members list with the updated role
      setMembers(
        members.map((member) =>
          member.userId === selectedMember.userId
            ? { ...member, role: selectedRole }
            : member
        )
      );
      setSnackbar({
        open: true,
        message: `${selectedMember.name}'s role has been updated to ${selectedRole}`,
        severity: "success",
      });
      handleCloseRoleDialog();
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update role. Please try again.");
    } finally {
      setRoleLoading(false);
    }
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case "parent":
        return <AdminIcon />;
      case "child":
        return <ChildIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "primary";
      case "child":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
            flexWrap: "wrap",
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
              mb: { xs: 2, sm: 0 },
            }}
          >
            <GroupIcon color="primary" />
            Family Management
          </Typography>

          {isAdmin && tabValue === 0 && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenInviteDialog}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                py: 1,
              }}
            >
              Invite Member
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs for Members and Join Requests (if admin) */}
        {isAdmin && (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab label="Members" icon={<GroupIcon />} iconPosition="start" />
            <Tab
              label="Join Requests"
              icon={<NotificationsActiveIcon />}
              iconPosition="start"
              sx={{
                "& .MuiBadge-root": { mr: 1 },
              }}
              TabIndicatorProps={{
                children: <span />,
              }}
            />
          </Tabs>
        )}

        {/* Members Tab */}
        {(!isAdmin || (isAdmin && tabValue === 0)) && (
          <>
            {members.length > 0 ? (
              isMobile ? (
                // Mobile view - cards
                <Grid container spacing={2}>
                  {members.map((member) => {
                    const avatar = getDefaultAvatar(member.name);
                    return (
                      <Grid item xs={12} key={member.userId}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: avatar.color,
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {avatar.initials}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="medium"
                                  >
                                    {member.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <MailIcon fontSize="small" />{" "}
                                    {member.email || "No email"}
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip
                                icon={getRoleIcon(member.role)}
                                label={member.role || "Member"}
                                color={getRoleColor(member.role)}
                                size="small"
                              />
                            </Box>
                            {isAdmin &&
                              member.userId !==
                                JSON.parse(sessionStorage.getItem("user"))
                                  ?.userId && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Joined: {formatDate(member.joinOn)}
                                  </Typography>

                                  <Box>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() =>
                                        handleOpenRoleDialog(member)
                                      }
                                      sx={{ mr: 1 }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    {member.role !== "parent" && (
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          handleOpenRemoveDialog(member)
                                        }
                                      >
                                        <PersonRemoveIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                </Box>
                              )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                // Desktop view - table
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.02)",
                        }}
                      >
                        <TableCell>Member</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Joined On</TableCell>
                        {isAdmin && (
                          <TableCell align="right">Actions</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((member) => {
                        const avatar = getDefaultAvatar(member.name);
                        return (
                          <TableRow key={member.userId} hover>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar sx={{ bgcolor: avatar.color }}>
                                  {avatar.initials}
                                </Avatar>
                                <Typography variant="body1">
                                  {member.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{member.email || "No email"}</TableCell>
                            <TableCell>
                              <Chip
                                icon={getRoleIcon(member.role)}
                                label={member.role || "Member"}
                                color={getRoleColor(member.role)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(member.joinOn)}</TableCell>
                            {isAdmin && (
                              <TableCell align="right">
                                {member.userId !==
                                  JSON.parse(sessionStorage.getItem("user"))
                                    ?.userId && (
                                  <>
                                    <Tooltip title="Edit Role">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() =>
                                          handleOpenRoleDialog(member)
                                        }
                                        sx={{ mr: 1 }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    {member.role !== "parent" && (
                                      <Tooltip title="Remove Member">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() =>
                                            handleOpenRemoveDialog(member)
                                          }
                                        >
                                          <PersonRemoveIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
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
                <GroupIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  No Family Members
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {isAdmin
                    ? "You don't have any family members yet. Click 'Invite Member' to add someone to your family."
                    : "There are no members in your family yet."}
                </Typography>
                {isAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleOpenInviteDialog}
                  >
                    Invite Member
                  </Button>
                )}
              </Paper>
            )}
          </>
        )}

        {/* Join Requests Tab - Only visible to admins */}
        {isAdmin && tabValue === 1 && <JoinRequestsPanel />}
      </motion.div>

      {/* Invite Dialog */}
      <Dialog open={openInviteDialog} onClose={handleCloseInviteDialog}>
        <DialogTitle>Invite New Family Member</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the email address of the person you want to invite to your
            family.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInviteDialog}>Cancel</Button>
          <Button
            onClick={handleSendInvite}
            variant="contained"
            disabled={inviteLoading}
            startIcon={inviteLoading ? <CircularProgress size={20} /> : null}
          >
            {inviteLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={openRemoveDialog} onClose={handleCloseRemoveDialog}>
        <DialogTitle>Remove Family Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {selectedMember?.name} from your
            family? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog}>Cancel</Button>
          <Button
            onClick={handleRemoveMember}
            color="error"
            variant="contained"
            disabled={removeLoading}
            startIcon={removeLoading ? <CircularProgress size={20} /> : null}
          >
            {removeLoading ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Role Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>Change Member Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a new role for {selectedMember?.name}.
          </DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Box
              onClick={() => setSelectedRole("parent")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                border: 1,
                borderColor:
                  selectedRole === "parent" ? "primary.main" : "divider",
                borderRadius: 1,
                cursor: "pointer",
                bgcolor:
                  selectedRole === "parent"
                    ? "action.selected"
                    : "background.paper",
              }}
            >
              <AdminIcon color="primary" />
              <Box>
                <Typography variant="subtitle1">Parent</Typography>
                <Typography variant="body2" color="text.secondary">
                  Full access to family management and settings
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => setSelectedRole("child")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                border: 1,
                borderColor:
                  selectedRole === "child" ? "primary.main" : "divider",
                borderRadius: 1,
                cursor: "pointer",
                bgcolor:
                  selectedRole === "child"
                    ? "action.selected"
                    : "background.paper",
              }}
            >
              <ChildIcon color="secondary" />
              <Box>
                <Typography variant="subtitle1">Child</Typography>
                <Typography variant="body2" color="text.secondary">
                  Limited access to family features
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateRole}
            color="primary"
            variant="contained"
            disabled={roleLoading || selectedRole === selectedMember?.role}
            startIcon={roleLoading ? <CircularProgress size={20} /> : null}
          >
            {roleLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default FamilyMembers;
