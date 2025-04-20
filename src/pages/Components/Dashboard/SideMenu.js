"use client";

import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Avatar, Typography, useTheme, useMediaQuery } from "@mui/material";
import MenuContent from "./SideMenuContent";
import OptionsMenu from "./UserOptions";
import LoginIcon from "@mui/icons-material/Login";
import { Link } from "react-router-dom";
import isLogin from "../../../globalFunction/isLogin";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return <MenuContent />;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: theme.palette.background.paper,
          width: drawerWidth,
          boxSizing: "border-box",
          border: "none",
          boxShadow:
            theme.palette.mode === "light"
              ? "1px 0 5px rgba(0,0,0,0.05)"
              : "1px 0 5px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          pt: 0,
        }}
      >
        <MenuContent />
      </Box>
      {isLogin() ? (
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
            maxWidth: "100%",
          }}
        >
          <Avatar
            sizes="small"
            alt="Riley Carter"
            src="/static/images/avatar/7.jpg"
            sx={{
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {(() => {
              const user = JSON.parse(sessionStorage.getItem("user"));
              const username = user?.username || "";
              const shortForm =
                username.split(/(?=[A-Z])/).length > 1 // If camelCase like "testAccount"
                  ? username
                      .split(/(?=[A-Z])/)
                      .map((word) => word[0])
                      .join("")
                  : username.slice(0, 2).toUpperCase(); // fallback: take first 2 letters
              return shortForm.toUpperCase();
            })()}
          </Avatar>
          <Box sx={{ mr: "auto" }}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 500,
                lineHeight: "16px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "140px",
              }}
            >
              {JSON.parse(sessionStorage.getItem("user")).username}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: "text.secondary",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "140px",
                display: "block",
              }}
            >
              {JSON.parse(sessionStorage.getItem("user")).email}
            </Typography>
          </Box>
          <OptionsMenu />
        </Stack>
      ) : (
        <Link to="/login" style={{ textDecoration: "none" }}>
          <Stack
            direction="row"
            sx={{
              p: 2,
              alignItems: "center",
              justifyContent: "center",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, lineHeight: "20px", color: "blue" }}
              >
                Login
              </Typography>
            </Box>
            <LoginIcon sx={{ color: "blue" }}></LoginIcon>
          </Stack>
        </Link>
      )}
    </Drawer>
  );
}
