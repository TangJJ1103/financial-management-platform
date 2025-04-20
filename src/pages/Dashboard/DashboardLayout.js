"use client";

import { useState, useContext } from "react";
import {
  Box,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import { ThemeContext } from "../../components/themeProvider";
import MenuIcon from "@mui/icons-material/Menu";
import SideMenu from "../Components/Dashboard/SideMenu";
import Header from "../../globalComponents/Header";

const DashboardLayout = ({ children }) => {
  const { mode } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: theme.palette.background.default,
      }}
    >
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between", px: 1 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight="bold" color="primary">
                FinCollab
              </Typography>
            </Box>
            <Header />
          </Toolbar>
        </AppBar>
      )}
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              backgroundColor: theme.palette.background.paper,
              backgroundImage: "none",
            },
          }}
        >
          <SideMenu />
        </Drawer>
      )}
      {/* Desktop Sidebar */}
      {!isMobile && <SideMenu />}
      {/* Main Content */}
      <Stack
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - 240px)` },
          minHeight: "100vh",
          pt: { xs: 8, md: 2 },
          px: { xs: 1.5, sm: 2, md: 4 },
          pb: 5,
          overflowX: "hidden",
        }}
      >
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Header />
          </Box>
        )}

        <Box sx={{ py: { xs: 1, sm: 2 } }}>{children}</Box>
      </Stack>
    </Box>
  );
};

export default DashboardLayout;
