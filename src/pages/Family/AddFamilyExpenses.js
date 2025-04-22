"use client";

import { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PeopleIcon from "@mui/icons-material/People";
import { getCategoryNames } from "../../constants/financeCategories";
import { addFamilyExpense } from "../../dataHooks/expensesHooks";
import { getFamilyMembers } from "../../dataHooks/familyHooks";
import { getCurrencyList } from "../../dataHooks/currencyHooks";
import currency_flags from "../../currency_flags.json";

const paymentMethodOptions = ["Card", "Cash", "Touch n Go", "Bank Transfer"];

const AddFamilyExpenses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const categories = getCategoryNames();

  const [expenseData, setExpenseData] = useState({
    userId: JSON.parse(sessionStorage.getItem("user"))?.userId || "",
    familyId: JSON.parse(sessionStorage.getItem("family"))?.familyId || "",
    amountEntry: "",
    currencyType: "MYR",
    category: "",
    description: "",
    expensesDate: new Date().toISOString(),
    paymentMethod: "",
    splitBetween: [],
  });

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [currencyList, setCurrencyList] = useState(
    sessionStorage.getItem("currencyList").split(",") || []
  );
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState(null);

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

  // Fetch family members
  useEffect(() => {
    fetchCurrencyList();
    const fetchFamilyMembers = async () => {
      setLoadingMembers(true);
      setMembersError(null);

      try {
        const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;
        if (!familyId) {
          throw new Error("Family ID not found");
        }

        const response = await getFamilyMembers(familyId);

        if (response.error) {
          setMembersError(response.message || "Failed to load family members");
          setFamilyMembers([]);
        } else {
          setFamilyMembers(response.data.members || []);
        }
      } catch (error) {
        console.error("Error fetching family members:", error);
        setMembersError(
          "Failed to load family members. Please try again later."
        );
        setFamilyMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchFamilyMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseData((prevData) => ({
      ...prevData,
      [name]: name === "amountEntry" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !expenseData.amountEntry ||
      !expenseData.category ||
      !expenseData.familyId ||
      !expenseData.splitBetween.length > 0
    ) {
      setAlert({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    try {
      // Prepare the data for the API
      const requestData = {
        userId: expenseData.userId,
        familyId: expenseData.familyId,
        amountEntry: Number.parseFloat(expenseData.amountEntry),
        currencyType: expenseData.currencyType,
        category: expenseData.category,
        description: expenseData.description,
        expensesDate: expenseData.expensesDate,
        paymentMethod: expenseData.paymentMethod,
        splitBetween: expenseData.splitBetween.map((userId) => ({ userId })),
      };

      const response = await addFamilyExpense(requestData);
      if (response.status === 200) {
        setAlert({
          open: true,
          message: "Family expense added successfully!",
          severity: "success",
        });

        setExpenseData({
          userId: JSON.parse(sessionStorage.getItem("user"))?.userId || "",
          familyId:
            JSON.parse(sessionStorage.getItem("family"))?.familyId || "",
          amountEntry: "",
          currencyType: "MYR",
          category: "",
          description: "",
          expensesDate: new Date().toISOString(),
          paymentMethod: "",
          splitBetween: [],
        });
      } else {
        setAlert({
          open: true,
          message: response.data?.message || "Failed to add expense",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Add family expenses error:", error);
      setAlert({
        open: true,
        message: "Failed to add family expense. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  // Handle split between selection
  const handleSplitBetweenChange = (e) => {
    const { value } = e.target;
    setExpenseData((prev) => ({
      ...prev,
      splitBetween: value,
    }));
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Add Family Expense
            </Typography>
          </Box>

          {membersError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {membersError}
            </Alert>
          )}

          {loadingMembers ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                    <InputLabel id="currencyTypeLabel">
                      Currency Type
                    </InputLabel>
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
                      }
                      onChange={(newValue) => {
                        if (!newValue) return;

                        const now = dayjs();
                        if (newValue.isBefore(now)) {
                          setExpenseData({
                            ...expenseData,
                            expensesDate: newValue.toISOString(),
                          });
                        } else {
                          setAlert({
                            open: true,
                            message: "Future dates are not allowed",
                            severity: "error",
                          });
                        }
                      }}
                      maxDateTime={dayjs()}
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
                    <InputLabel id="FamilyPaymentMethod">
                      Payment Method
                    </InputLabel>
                    <Select
                      required
                      labelId="FamilyPaymentMethod"
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

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel id="splitBetweenLabel">
                      Split Between
                      {console.log(familyMembers)}
                    </InputLabel>
                    <Select
                      multiple
                      required
                      labelId="splitBetweenLabel"
                      label="Split Between"
                      name="splitBetween"
                      value={expenseData.splitBetween}
                      onChange={handleSplitBetweenChange}
                      renderValue={(selected) => {
                        return selected
                          .map(
                            (id) =>
                              familyMembers.find(
                                (member) => member.userId === id
                              )?.username
                          )
                          .join(", ");
                      }}
                    >
                      {familyMembers.map((member) => (
                        <MenuItem key={member.userId} value={member.userId}>
                          {member.username}
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
                    Add Family Expense
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
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

export default AddFamilyExpenses;
