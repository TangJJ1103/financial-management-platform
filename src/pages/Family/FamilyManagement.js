"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  GroupAdd as GroupAddIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import {
  createFamily,
  joinFamily,
  searchFamilies,
  inviteToFamily,
} from "../../dataHooks/familyHooks";

const FamilyManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);
  const [newFamilyData, setNewFamilyData] = useState({
    name: "",
    description: "",
    tag: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNewFamilyChange = (e) => {
    const { name, value } = e.target;

    // Validation rules
    if (name === "name") {
      // Prevent whitespace as the first character
      if (value.length > 0 && value[0] === " ") {
        return; // Reject input that starts with whitespace
      }

      // Only allow alphabets, numbers, and spaces for family name
      const nameRegex = /^[a-zA-Z0-9 ]*$/;
      if (!nameRegex.test(value)) {
        return; // Reject invalid characters
      }
      // Enforce max length of 15 characters
      if (value.length > 15) {
        return;
      }
    }

    if (name === "tag") {
      // Only allow alphabets and numbers for family tag (no spaces)
      const tagRegex = /^[a-zA-Z0-9]*$/;
      if (!tagRegex.test(value)) {
        return; // Reject invalid characters
      }
      // Enforce max length of 5 characters
      if (value.length > 5) {
        return;
      }
    }

    setNewFamilyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();

    // Validate family name and tag
    const nameRegex = /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/; // Must not start with whitespace
    const tagRegex = /^[a-zA-Z0-9]+$/;

    if (!newFamilyData.name || !newFamilyData.tag) {
      setAlert({
        open: true,
        message: "Family name and tag are required",
        severity: "error",
      });
      return;
    }

    if (!nameRegex.test(newFamilyData.name)) {
      setAlert({
        open: true,
        message:
          "Family name must start with a letter or number and can only contain letters, numbers, and spaces",
        severity: "error",
      });
      return;
    }

    if (newFamilyData.name.length > 15) {
      setAlert({
        open: true,
        message: "Family name cannot exceed 15 characters",
        severity: "error",
      });
      return;
    }

    try {
      const response = await createFamily({
        ...newFamilyData,
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
      });

      if (response.error) {
        setAlert({
          open: true,
          message: response.message || "Failed to create family",
          severity: "error",
        });
      } else {
        setAlert({
          open: true,
          message: "Family created successfully!",
          severity: "success",
        });

        // Reset form
        setNewFamilyData({
          name: "",
          description: "",
          tag: "",
        });

        // Update user's hasFamily status in session storage
        sessionStorage.setItem("hasFamily", "true"); // Store as string "true" instead of boolean
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error) {
      console.error("Create family error:", error);
      setAlert({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    } finally {
      setTimeout(() => {
        window.location.href = "/home";
      }, 500); // Short delay to ensure storage event is processed
    }
  };

  const handleSearch = async () => {
    const pattern = /^[a-zA-Z0-9 ]+#[a-zA-Z0-9]+$/;

    if (!pattern.test(searchQuery)) {
      setAlert({
        open: true,
        message: "Please follow the format such as name#tag",
        severity: "error",
      });
      return;
    }

    const name = searchQuery.split("#")[0];
    const tag = searchQuery.split("#")[1];

    setIsSearching(true);
    try {
      const response = await searchFamilies({ name, tag });

      if (response.error) {
        setAlert({
          open: true,
          message: response.message || "Search failed",
          severity: "error",
        });
        setSearchResults([]);
      } else {
        console.log(response);
        // Ensure searchResults is always an array
        const familyData = response.data.familyData;
        setSearchResults(
          Array.isArray(familyData)
            ? familyData
            : familyData
            ? [familyData]
            : []
        );
      }
    } catch (error) {
      console.error("Search families error:", error);
      setAlert({
        open: true,
        message: "An error occurred during search",
        severity: "error",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinFamily = async (familyId) => {
    try {
      const response = await joinFamily({
        familyId,
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
      });

      if (response.error) {
        setAlert({
          open: true,
          message: response.message || "Failed to send join request",
          severity: "error",
        });
      } else {
        setAlert({
          open: true,
          message: "Join request successfully sent!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Join family error:", error);
      setAlert({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    }
  };

  const handleOpenInviteDialog = (family) => {
    setSelectedFamily(family);

    // Check if current user is the admin of this family
    const currentUserId = JSON.parse(sessionStorage.getItem("user"))?.userId;
    const isUserAdmin = family.adminId === currentUserId;

    setIsAdmin(isUserAdmin);

    if (!isUserAdmin) {
      setAlert({
        open: true,
        message: "Only family administrators can send invitations",
        severity: "warning",
      });
      return;
    }

    setOpenInviteDialog(true);
  };

  const handleCloseInviteDialog = () => {
    setOpenInviteDialog(false);
    setInviteEmail("");
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !selectedFamily) return;

    // Double-check admin status before sending invitation
    const currentUserId = JSON.parse(sessionStorage.getItem("user"))?.userId;
    if (selectedFamily.adminId !== currentUserId) {
      setAlert({
        open: true,
        message: "Only family administrators can send invitations",
        severity: "error",
      });
      handleCloseInviteDialog();
      return;
    }

    try {
      const response = await inviteToFamily({
        familyId: selectedFamily.id,
        email: inviteEmail,
        invitedBy: currentUserId,
      });

      if (response.status === 200) {
        setAlert({
          open: true,
          message: "Invitation sent successfully!",
          severity: "success",
        });
        handleCloseInviteDialog();
      } else {
        setAlert({
          open: true,
          message: response.data?.message || "Failed to send invitation",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Invite to family error:", error);
      setAlert({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    }
  };

  const copyFamilyTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", p: { xs: 1, sm: 2 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.25)"
                : "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <GroupIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Family Management
            </Typography>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              icon={<GroupAddIcon />}
              label="Create Family"
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              icon={<SearchIcon />}
              label="Join Family"
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>

          {/* Create Family Tab */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleCreateFamily}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Create a new family group to manage expenses together
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Family Name"
                    name="name"
                    value={newFamilyData.name}
                    onChange={handleNewFamilyChange}
                    placeholder="e.g., Smith Family"
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      maxLength: 15,
                    }}
                    helperText="Only letters, numbers and spaces (max 15 characters)"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Family Tag"
                    name="tag"
                    value={newFamilyData.tag}
                    onChange={handleNewFamilyChange}
                    placeholder="e.g., smith"
                    helperText="Only letters and numbers (max 5 characters)"
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      maxLength: 5,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={newFamilyData.description}
                    onChange={handleNewFamilyChange}
                    placeholder="Tell us about your family"
                    multiline
                    rows={3}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<GroupAddIcon />}
                    sx={{ mt: 2, py: isMobile ? 1 : 1.5 }}
                  >
                    Create Family
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Join Family Tab */}
          {tabValue === 1 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Search for a family by name or tag to join
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Search Families"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter family name and tag(eg. family#123)"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleSearch}
                            disabled={isSearching}
                          >
                            {isSearching ? (
                              <CircularProgress size={24} />
                            ) : (
                              <SearchIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  {console.log(searchResults)}
                  {searchResults && searchResults.length > 0 ? (
                    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                      {searchResults.map((family) => (
                        <Card
                          key={family.familyId}
                          variant="outlined"
                          sx={{ mb: 2, borderRadius: 2 }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Box>
                                <Typography variant="h6" component="div">
                                  {family.name}
                                </Typography>
                                <Chip
                                  label={family.tag}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  onClick={() => copyFamilyTag(family.tag)}
                                  icon={
                                    copied ? <CheckIcon /> : <ContentCopyIcon />
                                  }
                                  sx={{ mt: 1 }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  {family.description ||
                                    "No description available"}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {family.memberCount} members
                              </Typography>
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              startIcon={<PersonAddIcon />}
                              onClick={() => handleJoinFamily(family.familyId)}
                            >
                              Join
                            </Button>
                          </CardActions>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      {isSearching ? (
                        <CircularProgress />
                      ) : searchQuery ? (
                        <Typography color="text.secondary">
                          No families found. Try a different search term.
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">
                          Search for families to see results here.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Invite Dialog */}
      <Dialog open={openInviteDialog} onClose={handleCloseInviteDialog}>
        <DialogTitle>
          {isAdmin
            ? `Invite to ${selectedFamily?.name}`
            : "Permission Required"}
        </DialogTitle>
        <DialogContent>
          {isAdmin ? (
            <>
              <DialogContentText>
                Enter the email address of the person you want to invite to join
                this family.
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
            </>
          ) : (
            <DialogContentText>
              Only the family administrator can send invitations to join this
              family.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInviteDialog}>Cancel</Button>
          {isAdmin && (
            <Button onClick={handleSendInvite} variant="contained">
              Send Invite
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FamilyManagement;
