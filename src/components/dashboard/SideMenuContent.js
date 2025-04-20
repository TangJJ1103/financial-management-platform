"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
  useTheme,
  useMediaQuery,
  Badge,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  PersonRounded,
  PersonAddRounded,
  PersonSearchRounded,
  AccountBalanceWalletRounded,
  FlagRounded,
  GroupRounded,
  GroupAddRounded,
  AssessmentRounded,
  AccountBalanceRounded,
  EmojiEventsRounded,
  BuildRounded,
  CurrencyExchangeRounded,
  HomeRounded,
  PeopleAlt as PeopleAltIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useFamilyInvitations } from "../family/FamilyInvitationsContext";

const mainListItems = [
  { text: "Dashboard", icon: <HomeRounded />, path: "/home" },
  { text: "Personal", icon: <PersonRounded />, sublist: "personal" },
];

// Add Family option conditionally based on hasFamily
const getFamilyMenuItem = (hasFamily) => {
  return hasFamily
    ? { text: "Family", icon: <GroupRounded />, sublist: "family" }
    : { text: "Family", icon: <GroupRounded />, path: "/family/management" };
};

const personalListItems = [
  {
    text: "Add Personal Expenses",
    icon: <PersonAddRounded />,
    path: "/personal/addExpenses",
  },
  {
    text: "View Personal Expenses",
    icon: <PersonSearchRounded />,
    path: "/personal/viewExpenses",
  },
  {
    text: "Budget & Savings",
    icon: <AccountBalanceWalletRounded />,
    path: "/personal/budget",
  },
  { text: "Goals", icon: <FlagRounded />, path: "/personal/goals" },
];

const familyListItems = [
  {
    text: "Add Family Expenses",
    icon: <GroupAddRounded />,
    path: "/family/addExpenses",
  },
  {
    text: "View Family Expenses",
    icon: <AssessmentRounded />,
    path: "/family/viewExpenses",
  },
  {
    text: "Budget & Savings",
    icon: <AccountBalanceRounded />,
    path: "/family/budget",
  },
  { text: "Goals", icon: <EmojiEventsRounded />, path: "/family/goals" },
  {
    text: "Family Members",
    icon: <PeopleAltIcon />,
    path: "/family/members",
  },
];

const secondaryListItems = [
  { text: "Tools", icon: <BuildRounded />, sublist: "tools" },
];

const toolListItems = [
  {
    text: "Currency Converter",
    icon: <CurrencyExchangeRounded />,
    path: "/tools/currency-converter",
  },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const [openSublist, setOpenSublist] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [hasFamily, setHasFamily] = useState(false);
  const [previousInvitationCount, setPreviousInvitationCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Use the family invitations context
  const { invitationCount, fetchInvitations } = useFamilyInvitations();

  // Check if user has a family
  useEffect(() => {
    // Function to check and update family status
    const updateFamilyStatus = () => {
      try {
        const familyStatus = sessionStorage.getItem("hasFamily");
        setHasFamily(familyStatus === "true"); // Convert to boolean
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    };

    // Initial check
    updateFamilyStatus();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "hasFamily") {
        updateFamilyStatus();
      }
    };

    // Add event listener for custom familyStatusChanged event
    const handleFamilyStatusChange = (e) => {
      console.log("Family status changed event received", e.detail);

      setHasFamily(e.detail.hasFamily);
      sessionStorage.setItem("hasFamily", e.detail.hasFamily);

      // If the user now has a family, open the family sublist
      if (e.detail.hasFamily) {
        setOpenSublist((prev) => ({ ...prev, family: true }));
      } else {
        navigate("/home");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("familyStatusChanged", handleFamilyStatusChange);

    console.log(sessionStorage);
    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "familyStatusChanged",
        handleFamilyStatusChange
      );
    };
  }, []);

  // Check for new invitations and show notification if needed
  useEffect(() => {
    // Show notification if there are new invitations
    if (
      previousInvitationCount !== 0 &&
      invitationCount > previousInvitationCount
    ) {
      const newInvitations = invitationCount - previousInvitationCount;
      setSnackbar({
        open: true,
        message: `You have ${newInvitations} new family invitation${
          newInvitations > 1 ? "s" : ""
        }!`,
        severity: "info",
      });

      // Play a notification sound (optional)
      try {
        const audio = new Audio("/notification.mp3");
        audio.play();
      } catch (soundError) {
        console.log("Sound notification not supported");
      }
    }

    // Update previous count
    setPreviousInvitationCount(invitationCount);
  }, [invitationCount, previousInvitationCount]);

  const handleToggle = (list) => {
    setOpenSublist((prev) => ({ ...prev, [list]: !prev[list] }));
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const renderSublist = (sublistName, sublistItems) => {
    // For the family sublist, conditionally add the "Manage Family" option
    let itemsToRender = sublistItems;
    if (sublistName === "family" && !hasFamily) {
      // Add "Manage Family" option only if user doesn't have a family
      itemsToRender = [
        ...sublistItems,
        {
          text: "Manage Family",
          icon: <GroupRounded />,
          path: "/family/management",
        },
      ];
    }

    return (
      <Collapse in={openSublist[sublistName]} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {itemsToRender.map((subItem, subIndex) => (
            <ListItem key={subIndex} sx={{ pl: 4 }}>
              <ListItemButton
                onClick={() => handleNavigate(subItem.path)}
                sx={{
                  py: isMobile ? 1.5 : 1,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {subItem.icon}
                </ListItemIcon>
                <ListItemText
                  primary={subItem.text}
                  primaryTypographyProps={{
                    fontSize: isMobile ? "0.95rem" : "0.875rem",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    );
  };

  // Construct the main list items with conditional family option
  const updatedMainListItems = [...mainListItems];
  updatedMainListItems.splice(2, 0, getFamilyMenuItem(hasFamily));

  return (
    <Stack
      sx={{
        flexGrow: 1,
        p: 1,
        justifyContent: "space-between",
        pt: isMobile ? 6 : 0,
      }}
    >
      <List dense>
        {updatedMainListItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              {item.path ? (
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    py: isMobile ? 1.5 : 1,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.text === "Family" &&
                    !hasFamily &&
                    invitationCount > 0 ? (
                      <Badge badgeContent={invitationCount} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: isMobile ? "0.95rem" : "0.875rem",
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              ) : (
                <ListItemButton
                  onClick={() => handleToggle(item.sublist)}
                  sx={{
                    py: isMobile ? 1.5 : 1,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.text === "Family" && invitationCount > 0 ? (
                      <Badge badgeContent={invitationCount} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: isMobile ? "0.95rem" : "0.875rem",
                      fontWeight: 500,
                    }}
                  />
                  {openSublist[item.sublist] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              )}
            </ListItem>
            {item.sublist === "personal" &&
              renderSublist("personal", personalListItems)}
            {item.sublist === "family" &&
              hasFamily === true &&
              renderSublist("family", familyListItems)}
          </React.Fragment>
        ))}
      </List>

      {/* Add Invitations button if there are pending invitations */}
      {invitationCount > 0 && !hasFamily && (
        <ListItem disablePadding sx={{ mt: 1 }}>
          <ListItemButton
            onClick={() => handleNavigate("/family/invitations")}
            sx={{
              py: isMobile ? 1.5 : 1,
              borderRadius: "8px",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.03)",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Badge badgeContent={invitationCount} color="error">
                <NotificationsIcon color="primary" />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary="Family Invitations"
              primaryTypographyProps={{
                fontSize: isMobile ? "0.95rem" : "0.875rem",
                fontWeight: 600,
                color: "primary.main",
              }}
            />
          </ListItemButton>
        </ListItem>
      )}

      <List dense>
        {secondaryListItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleToggle(item.sublist)}
                sx={{
                  py: isMobile ? 1.5 : 1,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: isMobile ? "0.95rem" : "0.875rem",
                    fontWeight: 500,
                  }}
                />
                {openSublist[item.sublist] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            {item.sublist === "tools" && renderSublist("tools", toolListItems)}
          </React.Fragment>
        ))}
      </List>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
