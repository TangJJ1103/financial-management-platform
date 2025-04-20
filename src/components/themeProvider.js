"use client";

import { createContext, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create context for theme mode
export const ThemeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

// Color palette
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode palette
          primary: {
            main: "#3e6ae1",
            light: "#6b90f3",
            dark: "#2c4cb0",
            contrastText: "#fff",
          },
          secondary: {
            main: "#6c63ff",
            light: "#9b95ff",
            dark: "#4b45cb",
            contrastText: "#fff",
          },
          background: {
            default: "#f5f7fa",
            paper: "#ffffff",
          },
          text: {
            primary: "#2a3551",
            secondary: "#5c6580",
          },
          divider: "rgba(0,0,0,0.07)",
        }
      : {
          // Dark mode palette
          primary: {
            main: "#5f81f6",
            light: "#9aaefd",
            dark: "#3e55b9",
            contrastText: "#fff",
          },
          secondary: {
            main: "#8c85ff",
            light: "#bbb6ff",
            dark: "#5d57c9",
            contrastText: "#fff",
          },
          background: {
            default: "#1a1f2e",
            paper: "#262b3c",
          },
          text: {
            primary: "#f0f2f5",
            secondary: "#b4bac8",
          },
          divider: "rgba(255,255,255,0.08)",
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontSize: "0.95rem",
          padding: "8px 16px",
          boxShadow: "none",
        },
        contained: {
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          "&:hover": {
            boxShadow: "rgba(0, 0, 0, 0.15) 0px 5px 15px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            "rgba(17, 17, 26, 0.05) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px",
          borderRadius: 16,
          padding: 4,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          "&:last-child": {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow:
            "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
        },
        elevation2: {
          boxShadow:
            "rgba(17, 17, 26, 0.05) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 8,
        },
      },
    },
  },
});

export const ThemeProvider = ({ children }) => {
  // Check for saved theme preference or use system preference
  const [mode, setMode] = useState("light");

  // Initialize theme from localStorage on client side
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Check for system preference
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setMode(prefersDarkMode ? "dark" : "light");
    }
  }, []);

  // Theme toggle function
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  // Create theme
  const theme = createTheme(getDesignTokens(mode));

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
