"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  Snackbar,
  Alert,
  Select,
  InputLabel,
  FormControl,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { addUserExpense } from "../../dataHooks/expensesHooks";
import { getCurrencyList } from "../../dataHooks/currencyHooks";
import currency_flags from "../../currency_flags.json";
import { getCategoryNames } from "../../constants/financeCategories";

const paymentMethodOptions = ["Card", "Cash", "Touch n Go", "Bank Transfer"];

const AddPersonalExpenses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const categories = getCategoryNames();

  const [expenseData, setExpenseData] = useState({
    userId: JSON.parse(sessionStorage.getItem("user"))?.userId || "", // ✅ Proper parsing
    amountEntry: "",
    currencyType: "MYR",
    category: "",
    description: "",
    expensesDate: new Date().toISOString(), // ✅ Stores full DateTime (C# compatible)
    paymentMethod: "",
  });
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currencyList, setCurrencyList] = useState(
    sessionStorage.getItem("currencyList").split(",") || []
  );

  useEffect(() => {
    fetchCurrencyList();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseData((prevData) => ({
      ...prevData,
      [name]: name === "amountEntry" ? Number.parseFloat(value) || 0 : value, // ✅ Ensures it's a number
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!expenseData.amountEntry || !expenseData.category) {
      setAlert({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }
    try {
      const response = await addUserExpense(expenseData);
      if (!response.error) {
        setAlert({
          open: true,
          message: "Expense added successfully!",
          severity: "success",
        });

        setExpenseData({
          userId: sessionStorage.getItem("user").userId,
          amountEntry: "",
          currencyType: "MYR",
          category: "",
          description: "",
          expensesDate: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
          paymentMethod: "",
        });
      } else {
        setAlert({
          open: true,
          message: "Failed to add expense. Please try again.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Add expenses error:", error);
      setAlert({
        open: true,
        message: "Failed to add expense. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", p: { xs: 1, sm: 2 } }}>
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
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            sx={{
              mb: 3,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Add Personal Expense
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Amount"
                  name="amountEntry"
                  type="number"
                  value={expenseData.amountEntry}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel id="currencyTypeLabel">Currency Type</InputLabel>
                  <Select
                    required
                    labelId="currencyTypeLabel"
                    label="Currency Type"
                    name="currencyType"
                    value={expenseData.currencyType}
                    onChange={handleChange}
                  >
                    {currencyList.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        <img
                          src={currency.flag || "/placeholder.svg"} // Use the flag image URL
                          alt={currency.code}
                          style={{
                            width: 20,
                            height: 14,
                            marginRight: 8,
                          }}
                        />
                        {currency.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Category"
                  name="category"
                  value={expenseData.category}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Date & Time"
                    value={
                      expenseData.expensesDate
                        ? dayjs(expenseData.expensesDate)
                        : null
                    } // ✅ Convert to Dayjs
                    onChange={(newValue) => {
                      if (!newValue) return; // Prevent errors if no value is selected

                      const now = dayjs(); // ✅ Ensure comparison with Dayjs object
                      if (newValue.isBefore(now)) {
                        setExpenseData({
                          ...expenseData,
                          expensesDate: newValue.toISOString(), // ✅ Store as ISO string
                        });
                      } else {
                        setAlert({
                          open: true,
                          message: "Future dates are not allowed",
                          severity: "error",
                        });
                      }
                    }}
                    maxDateTime={dayjs()} // ✅ Ensure max date is Dayjs
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        size: isMobile ? "small" : "medium",
                      },
                    }}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel id="PersonalPaymentMethod">
                    Payment Method
                  </InputLabel>
                  <Select
                    required
                    labelId="PersonalPaymentMethod"
                    label="Payment Method"
                    name="paymentMethod"
                    value={expenseData.paymentMethod}
                    onChange={handleChange}
                  >
                    {paymentMethodOptions.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={expenseData.description}
                  onChange={handleChange}
                  multiline
                  rows={isMobile ? 2 : 3}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ mt: 2, py: isMobile ? 1 : 1.5 }}
                >
                  Add Expense
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>

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

export default AddPersonalExpenses;
