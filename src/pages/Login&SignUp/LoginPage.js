"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoginIcon from "@mui/icons-material/Login";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { userRegister, validateLogin } from "../../dataHooks/authHooks";
import { getCurrencyList } from "../../dataHooks/currencyHooks";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    email: "",
    currencyType: "MYR",
  });
  const navigate = useNavigate();

  const handleCurrencyList = async () => {
    try {
      const response = await getCurrencyList();
      const newCurrencyList = [...response.data, "MYR"];
      setCurrencyList(newCurrencyList);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    handleCurrencyList();
  }, []);

  const handleToggle = (event, newValue) => {
    if (newValue !== null) {
      setIsLoginPage(newValue === "login");
      setError("");
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!usernameOrEmail) {
      setError("Username or Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    // Demo login
    if (usernameOrEmail === "a" && password === "a") {
      sessionStorage.setItem("currencyType", "MYR");
      sessionStorage.setItem("user", "a");
      navigate("/home");
      return;
    }

    try {
      setIsLoading(true);
      const response = await validateLogin({ usernameOrEmail, password });
      if (response.error) {
        setError(response.message || "Invalid credentials.");
      }

      if (response.status === 200) {
        sessionStorage.setItem("user", JSON.stringify(response.data?.user));
        sessionStorage.setItem("authToken", response.data?.authToken);
        sessionStorage.setItem("hasFamily", response.data?.hasFamily);
        if (response.data?.hasFamily && response.data?.family != null) {
          sessionStorage.setItem(
            "family",
            JSON.stringify(response.data?.family)
          );
          sessionStorage.setItem("familyRole", response.data?.familyRole);
        }
        if (!currencyList.includes("MYR")) {
          const newCurrencyList = currencyList.push("MYR");
          sessionStorage.setItem("currencyList", newCurrencyList);
        } else {
          sessionStorage.setItem("currencyList", currencyList);
        }
        navigate("/home");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!formData.username) {
      setError("Username is required.");
      return;
    }
    if (!formData.name) {
      setError("Name is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required.");
      return;
    }
    if (!formData.email) {
      setError("Email is required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await userRegister(formData);
      if (response.error) {
        setError(response.message);
      } else {
        setIsLoginPage(true);
        setPassword("");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(120deg, #1a1f2e 0%, #262b3c 100%)"
            : "linear-gradient(120deg, #e0e7ff 0%, #f5f7fa 100%)",
        backgroundSize: "cover",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              borderRadius: { xs: 3, sm: 4 },
              backdropFilter: "blur(10px)",
              background:
                theme.palette.mode === "dark"
                  ? "rgba(38, 43, 60, 0.8)"
                  : "rgba(255, 255, 255, 0.9)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                  : "0 8px 32px rgba(140, 152, 164, 0.2)",
            }}
          >
            <Box sx={{ mb: { xs: 2, sm: 4 }, textAlign: "center" }}>
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{
                  mb: 1,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(90deg, #5f81f6 0%, #8c85ff 100%)"
                      : "linear-gradient(90deg, #3e6ae1 0%, #6c63ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                FinCollab
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {isLoginPage
                  ? "Welcome back! Log in to continue"
                  : "Create your account"}
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={isLoginPage ? "login" : "register"}
              exclusive
              onChange={handleToggle}
              fullWidth
              sx={{
                mb: { xs: 2, sm: 4 },
                ".MuiToggleButtonGroup-grouped": {
                  borderRadius: "10px !important",
                  py: { xs: 1, sm: 1.5 },
                  border: `1px solid ${theme.palette.divider} !important`,
                  "&.Mui-selected": {
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(90deg, #5f81f6 0%, #8c85ff 100%)"
                        : "linear-gradient(90deg, #3e6ae1 0%, #6c63ff 100%)",
                    color: "#fff",
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ToggleButton value="login">
                <LoginIcon style={{ marginRight: 8 }} /> Login
              </ToggleButton>
              <ToggleButton value="register">
                <KeyboardIcon style={{ marginRight: 8 }} /> Register
              </ToggleButton>
            </ToggleButtonGroup>

            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 2, sm: 3 },
              }}
            >
              {isLoginPage ? (
                <>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    InputProps={{
                      sx: { borderRadius: 2, py: { xs: 0.25, sm: 0.5 } },
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      sx: { borderRadius: 2, py: { xs: 0.25, sm: 0.5 } },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {error}
                    </Typography>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleLogin}
                      sx={{
                        py: { xs: 1, sm: 1.5 },
                        mt: 1,
                        fontWeight: 600,
                        background:
                          "linear-gradient(90deg, #3e6ae1 0%, #6c63ff 100%)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, #3e6ae1 30%, #6c63ff 90%)",
                          boxShadow: "0 4px 20px rgba(108, 99, 255, 0.5)",
                        },
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      sx: { borderRadius: 2, py: { xs: 0.25, sm: 0.5 } },
                    }}
                  />
                  <TextField
                    label="Full Name"
                    variant="outlined"
                    fullWidth
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      sx: { borderRadius: 2, py: { xs: 0.25, sm: 0.5 } },
                    }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      sx: { borderRadius: 2, py: { xs: 0.25, sm: 0.5 } },
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    InputProps={{
                      sx: { borderRadius: 2, py: { xs: 0.25, sm: 0.5 } },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {error}
                    </Typography>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleRegister}
                      sx={{
                        py: { xs: 1, sm: 1.5 },
                        mt: 1,
                        fontWeight: 600,
                        background:
                          "linear-gradient(90deg, #3e6ae1 0%, #6c63ff 100%)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, #3e6ae1 30%, #6c63ff 90%)",
                          boxShadow: "0 4px 20px rgba(108, 99, 255, 0.5)",
                        },
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </motion.div>
                </>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
