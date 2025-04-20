"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Alert,
  Container,
  Paper,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  SwapHoriz as SwapHorizIcon,
  CurrencyExchange as CurrencyExchangeIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  getCurrencyConverter,
  getCurrencyList,
} from "../../dataHooks/currencyHooks";
import currency_flags from "../../currency_flags.json";

const CurrencyConverter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Update the formattedCurrencyList logic
  const [currencyList, setCurrencyList] = useState(
    sessionStorage.getItem("currencyList").split(",") || []
  );

  const [fromCurrency, setFromCurrency] = useState(
    JSON.parse(sessionStorage.getItem("user"))?.currencyType || "MYR"
  );
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);
  const [recentConversions, setRecentConversions] = useState([]);

  // Load recent conversions from localStorage on component mount
  useEffect(() => {
    fetchCurrencyList();
    cleanupLocalStorage();

    // Get the current user ID from session storage
    const user = sessionStorage.getItem("user");
    const userId = user ? JSON.parse(user)?.userId : null;

    // Use a user-specific key for localStorage
    const storageKey = userId ? `recentConversions_${userId}` : null;

    // Only load conversions if we have a user ID
    if (storageKey) {
      const savedConversions = localStorage.getItem(storageKey);
      if (savedConversions) {
        try {
          setRecentConversions(JSON.parse(savedConversions).slice(0, 5));

          // Update last accessed metadata
          const metaKey = `${storageKey}_meta`;
          localStorage.setItem(
            metaKey,
            JSON.stringify({
              lastAccessed: Date.now(),
            })
          );
        } catch (e) {
          console.error("Error loading recent conversions:", e);
        }
      }
    } else {
      // Clear conversions if no user is logged in
      setRecentConversions([]);
    }
  }, []);
  // Save recent conversions to localStorage
  const saveConversion = (from, to, amt, result) => {
    // Get the current user ID from session storage
    const user = sessionStorage.getItem("user");
    const userId = user ? JSON.parse(user)?.userId : null;

    // Only save if we have a user ID
    if (!userId) return;

    const storageKey = `recentConversions_${userId}`;

    const newConversion = {
      id: Date.now(),
      from,
      to,
      amount: Number.parseFloat(amt),
      result,
      timestamp: new Date().toISOString(),
    };

    // Limit to 5 most recent conversions
    const updatedConversions = [newConversion, ...recentConversions].slice(
      0,
      5
    );
    setRecentConversions(updatedConversions);

    // Calculate approximate size of data (rough estimate)
    const dataString = JSON.stringify(updatedConversions);
    const estimatedSize = new Blob([dataString]).size;

    // Only save if under size limit (50KB is a reasonable limit per user)
    const MAX_SIZE_BYTES = 50 * 1024; // 50KB

    if (estimatedSize <= MAX_SIZE_BYTES) {
      localStorage.setItem(storageKey, dataString);

      // Update last accessed metadata
      const metaKey = `${storageKey}_meta`;
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          lastAccessed: Date.now(),
          size: estimatedSize,
        })
      );
    } else {
      console.warn("Conversion history too large, not saving to localStorage");
      // Could show a warning to user that history won't be saved
    }
  };

  const handleConvert = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError(null);
    setConvertedAmount(null);
    setConversionRate(null);

    try {
      const response = await getCurrencyConverter(
        fromCurrency,
        toCurrency,
        Number.parseFloat(amount)
      );

      if (response.data) {
        setConvertedAmount(response.data);
        // Calculate and store conversion rate
        const rate = response.data / Number.parseFloat(amount);
        setConversionRate(rate);
        // Save to recent conversions
        saveConversion(fromCurrency, toCurrency, amount, response.data);
      } else {
        setError(response.message || "Conversion failed.");
      }
    } catch (err) {
      console.error("Conversion error:", err);
      setError("An error occurred during conversion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // Reset results when swapping
    setConvertedAmount(null);
    setConversionRate(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  async function fetchCurrencyList() {
    if (currencyList.length > 0) {
      if (!currencyList.includes("MYR")) {
        currencyList.push("MYR");
      }
      const formatted = currencyList.map((code) => ({
        code,
        flag: currency_flags[code] || "",
      }));
      setCurrencyList(formatted);
      return;
    }

    try {
      const newCurrencyList = await getCurrencyList();
      if (!newCurrencyList.includes("MYR")) {
        newCurrencyList.push("MYR");
      }

      const formatted = newCurrencyList.map((code) => ({
        code,
        flag: currency_flags[code] || "",
      }));
      setCurrencyList(formatted);
      sessionStorage.setItem("currencyList", newCurrencyList);
    } catch (error) {
      console.error("Error fetching currency list:", error);

      // Fallback list
      const defaultCurrencies = [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "AUD",
        "CAD",
        "CHF",
        "CNY",
        "MYR",
      ];
      const formatted = defaultCurrencies.map((code) => ({
        code,
        flag: currency_flags[code] || "",
      }));
      setCurrencyList(formatted);
      sessionStorage.setItem("currencyList", defaultCurrencies);
    }
  }
  // Function to clean up localStorage to prevent excessive storage usage
  const cleanupLocalStorage = () => {
    try {
      // 1. Set a maximum number of user histories to keep
      const MAX_USER_HISTORIES = 5;

      // 2. Get all keys in localStorage
      const allKeys = Object.keys(localStorage);

      // 3. Filter only conversion history keys
      const conversionKeys = allKeys.filter((key) =>
        key.startsWith("recentConversions_")
      );

      // 4. If we have more than our limit, remove the oldest ones
      if (conversionKeys.length > MAX_USER_HISTORIES) {
        // Sort keys by last accessed time (we'll add this metadata)
        const keyData = conversionKeys.map((key) => {
          // Try to get last accessed time from metadata, default to 0 if not found
          let lastAccessed = 0;
          try {
            const metaKey = `${key}_meta`;
            const meta = localStorage.getItem(metaKey);
            if (meta) {
              lastAccessed = JSON.parse(meta).lastAccessed;
            }
          } catch (e) {
            // If error parsing, use 0 as default
          }
          return { key, lastAccessed };
        });

        // Sort by last accessed time (oldest first)
        keyData.sort((a, b) => a.lastAccessed - b.lastAccessed);

        // Remove oldest entries to get down to our limit
        const keysToRemove = keyData.slice(
          0,
          keyData.length - MAX_USER_HISTORIES
        );
        keysToRemove.forEach((item) => {
          localStorage.removeItem(item.key);
          localStorage.removeItem(`${item.key}_meta`);
        });
      }

      // 5. Also clean up entries older than 30 days
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      conversionKeys.forEach((key) => {
        const metaKey = `${key}_meta`;
        try {
          const meta = localStorage.getItem(metaKey);
          if (meta) {
            const { lastAccessed } = JSON.parse(meta);
            if (now - lastAccessed > THIRTY_DAYS_MS) {
              localStorage.removeItem(key);
              localStorage.removeItem(metaKey);
            }
          }
        } catch (e) {
          // If error, just skip this key
        }
      });
    } catch (e) {
      console.error("Error cleaning up localStorage:", e);
      // Don't throw - this is a background operation
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
          <CurrencyExchangeIcon color="primary" fontSize="large" />
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Currency Converter
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Converter Card */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Convert Currency
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter an amount and select currencies to convert between
                  different currencies.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: fromCurrency ? (
                        <Box
                          component="span"
                          sx={{ mr: 1, display: "flex", alignItems: "center" }}
                        >
                          {currencyList.find(
                            (item) => item.code === fromCurrency
                          )?.flag && (
                            <img
                              src={
                                currencyList.find(
                                  (item) => item.code === fromCurrency
                                )?.flag ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={fromCurrency}
                              width="20"
                              height="14"
                              style={{ marginRight: 4 }}
                            />
                          )}
                        </Box>
                      ) : null,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    options={currencyList}
                    getOptionLabel={(option) => String(option.code)}
                    value={
                      currencyList.find((item) => item.code === fromCurrency) ||
                      null
                    }
                    onChange={(_, newValue) =>
                      setFromCurrency(newValue ? newValue.code : "")
                    }
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {option.flag && (
                          <img
                            src={option.flag || "/placeholder.svg"}
                            alt={option.code}
                            width="20"
                            height="14"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        {option.code}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="From Currency"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment:
                            fromCurrency &&
                            currencyList.find(
                              (item) => item.code === fromCurrency
                            )?.flag ? (
                              <img
                                src={
                                  currencyList.find(
                                    (item) => item.code === fromCurrency
                                  )?.flag ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={fromCurrency}
                                width="20"
                                height="14"
                                style={{ marginRight: 8 }}
                              />
                            ) : null,
                        }}
                      />
                    )}
                    fullWidth
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={2}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    onClick={swapCurrencies}
                    sx={{
                      p: 1.5,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.03)",
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                      },
                      transform: isMobile ? "rotate(90deg)" : "none",
                      my: isMobile ? 1 : 0,
                    }}
                  >
                    <SwapHorizIcon />
                  </IconButton>
                </Grid>

                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    options={currencyList}
                    getOptionLabel={(option) => String(option.code)}
                    value={
                      currencyList.find((item) => item.code === toCurrency) ||
                      null
                    }
                    onChange={(_, newValue) =>
                      setToCurrency(newValue ? newValue.code : "")
                    }
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {option.flag && (
                          <img
                            src={option.flag || "/placeholder.svg"}
                            alt={option.code}
                            width="20"
                            height="14"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        {option.code}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="To Currency"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment:
                            toCurrency &&
                            currencyList.find(
                              (item) => item.code === toCurrency
                            )?.flag ? (
                              <img
                                src={
                                  currencyList.find(
                                    (item) => item.code === toCurrency
                                  )?.flag ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={toCurrency}
                                width="20"
                                height="14"
                                style={{ marginRight: 8 }}
                              />
                            ) : null,
                        }}
                      />
                    )}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleConvert}
                    disabled={loading}
                    sx={{
                      py: { xs: 1, sm: 1.5 },
                      mt: 1,
                      fontWeight: "bold",
                      borderRadius: 1.5,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Convert"
                    )}
                  </Button>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              {convertedAmount !== null && amount !== "" && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Conversion Result
                  </Typography>
                  <Typography variant="h5" fontWeight="medium" gutterBottom>
                    {Number.parseFloat(amount).toLocaleString()} {fromCurrency}{" "}
                    ={" "}
                    {convertedAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {toCurrency}
                  </Typography>
                  {conversionRate && (
                    <Typography variant="body2" color="text.secondary">
                      1 {fromCurrency} = {conversionRate.toFixed(6)}{" "}
                      {toCurrency}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Conversions Card */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Conversions
              </Typography>

              {recentConversions.length > 0 ? (
                <Box>
                  {recentConversions.map((conversion, index) => (
                    <React.Fragment key={conversion.id}>
                      <Box sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {conversion.amount.toLocaleString()}{" "}
                            {conversion.from} →{" "}
                            {conversion.result.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}{" "}
                            {conversion.to}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(conversion.timestamp)}
                        </Typography>
                      </Box>
                      {index < recentConversions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Your recent conversions will appear here
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default CurrencyConverter;
