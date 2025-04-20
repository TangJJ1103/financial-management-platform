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
import OptionsMenu from "../components/dashboard/UserOptions";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ThemeContext } from "../components/themeProvider";

export default function Header() {
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
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

        <OptionsMenu />
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
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
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
        </Stack>
      </Stack>
    );
  }
}
