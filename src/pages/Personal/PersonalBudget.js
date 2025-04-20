"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  LinearProgress,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import BudgetPieChart from "../../globalComponents/Charts/BudgetPieChart";
import GoalsBarChart from "../../globalComponents/Charts/GoalsBarChart";
import {
  getUserBudget,
  addUserBudget,
  updateUserBudget,
} from "../../dataHooks/budgetHooks";

// Import the new dialog components
import {
  BudgetFormDialog,
  DeleteBudgetDialog,
} from "../../components/dialogs/budgetDialogs";

const PersonalBudget = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [currentBudget, setCurrentBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    monthlyBudget: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);

  // New state for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Fetch budget data
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        const response = await getUserBudget();

        if (response.error) {
          setError(response.message || "Failed to load budget data");
          setBudgets([]);
        }
        setBudgets(response.data.budgetData);
        calculateTotals(response.data.budgetData);
      } catch (err) {
        console.error("Error fetching budget data:", err);
        setError("Failed to load budget data. Please try again later.");
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  // Calculate total budget, spent, and remaining
  const calculateTotals = (budgetData) => {
    const total = budgetData.reduce(
      (sum, budget) => sum + budget.monthlyBudget,
      0
    );
    const spent = budgetData.reduce(
      (sum, budget) => sum + (budget.monthlyBudget - budget.currentBudget),
      0
    );

    setTotalBudget(total);
    setTotalSpent(spent);
    setRemainingBudget(total - spent);
  };

  // Handle dialog open for adding new budget
  const handleAddBudget = () => {
    setDialogMode("add");
    setFormData({
      category: "",
      monthlyBudget: "",
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing budget
  const handleEditBudget = (budget) => {
    setDialogMode("edit");
    setCurrentBudget(budget);
    setFormData({
      category: budget.category,
      monthlyBudget: budget.monthlyBudget.toString(),
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBudget(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "monthlyBudget" ? value.replace(/[^0-9.]/g, "") : value,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formData.category || !formData.monthlyBudget) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      isNaN(Number.parseFloat(formData.monthlyBudget)) ||
      Number.parseFloat(formData.monthlyBudget) <= 0
    ) {
      setError("Please enter a valid budget amount");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const userId = JSON.parse(sessionStorage.getItem("user")).userId;
      const budgetAmount = Number.parseFloat(formData.monthlyBudget);

      let response;
      if (dialogMode === "add") {
        // Check if category already exists
        const existingCategory = budgets.find(
          (b) => b.category === formData.category
        );
        if (existingCategory) {
          setError(
            "This category already has a budget. Please edit the existing one."
          );
          setSubmitLoading(false);
          return;
        }

        response = await addUserBudget({
          userId,
          category: formData.category,
          monthlyBudget: budgetAmount,
          currentBudget: budgetAmount, // Initially, current budget equals monthly budget
        });
      } else {
        response = await updateUserBudget({
          budgetId: currentBudget.budgetId,
          monthlyBudget: budgetAmount,
        });
      }

      if (response.error) {
        setError(response.message || "Operation failed");
      } else {
        // Refresh budget data
        const response = await getUserBudget();
        if (response.data.budgetData) {
          setBudgets(response.data.budgetData);
          calculateTotals(response.data.budgetData);
        }
        handleCloseDialog();
      }
    } catch (err) {
      console.error("Budget operation error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle opening delete confirmation dialog
  const handleOpenDeleteDialog = (budget) => {
    setBudgetToDelete(budget);
    setOpenDeleteDialog(true);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setBudgetToDelete(null);
  };

  // Handle budget deletion
  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;

    try {
      setDeleteLoading(true);
      // const response = await deleteUserBudget(budgetToDelete.budgetId);

      // if (response.error) {
      //   setError(response.message || "Failed to delete budget");
      // } else {
      //   // Refresh budget data
      //   const data = await getUserBudget();
      //   if (data.budgetData) {
      //     setBudgets(data.budgetData);
      //     calculateTotals(data.budgetData);
      //   }
      // }

      // For demo purposes, just remove from state
      setBudgets(
        budgets.filter((budget) => budget.budgetId !== budgetToDelete.budgetId)
      );
      calculateTotals(
        budgets.filter((budget) => budget.budgetId !== budgetToDelete.budgetId)
      );

      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Delete budget error:", err);
      setError("Failed to delete budget. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Prepare data for pie chart
  const preparePieChartData = () => {
    return budgets.map((budget) => ({
      id: budget.category,
      value: budget.monthlyBudget,
      label: budget.category,
    }));
  };

  // Prepare data for bar chart
  const prepareBarChartData = () => {
    if (!budgets.length) return { xAxisData: [], series: [] };

    // Extract categories for x-axis
    const xAxisData = budgets.map((budget) => budget.category);

    // Create series data
    const series = [
      {
        id: "budget",
        label: "Budget",
        data: budgets.map((budget) => budget.monthlyBudget),
        color: theme.palette.primary.main,
        valueFormatter: (value) => formatCurrency(value),
      },
      {
        id: "spent",
        label: "Spent",
        data: budgets.map(
          (budget) => budget.monthlyBudget - budget.currentBudget
        ),
        color: theme.palette.error.main,
        valueFormatter: (value) => formatCurrency(value),
      },
    ];

    return { xAxisData, series };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  // Calculate percentage
  const calculatePercentage = (used, total) => {
    if (total <= 0) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
  };

  if (loading && budgets.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Get chart data
  const pieChartData = preparePieChartData();
  const barChartData = prepareBarChartData();

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: { xs: 2, sm: 0 },
            }}
          >
            <AccountBalanceIcon color="primary" />
            Personal Budget
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBudget}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              py: 1,
            }}
          >
            Add Budget
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Budget
                </Typography>
                <Typography variant="h5" component="div" fontWeight="medium">
                  {formatCurrency(totalBudget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Spent
                </Typography>
                <Typography
                  variant="h5"
                  component="div"
                  fontWeight="medium"
                  color={
                    totalSpent > totalBudget ? "error.main" : "text.primary"
                  }
                >
                  {formatCurrency(totalSpent)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Remaining Budget
                </Typography>
                <Typography
                  variant="h5"
                  component="div"
                  fontWeight="medium"
                  color={remainingBudget < 0 ? "error.main" : "success.main"}
                >
                  {formatCurrency(remainingBudget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        {budgets.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <BudgetPieChart
                title="Budget Allocation"
                subtitle="How your budget is distributed across categories"
                totalValue={formatCurrency(totalBudget)}
                data={pieChartData}
                height={300}
                cardProps={{
                  sx: { height: "100%" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <GoalsBarChart
                title="Budget vs. Spending"
                subtitle="Comparison of budgeted and actual spending by category"
                xAxisData={barChartData.xAxisData}
                series={barChartData.series}
                height={300}
                margin={{
                  top: 20,
                  bottom: 70,
                  left: 70,
                  right: 20,
                }}
                cardProps={{
                  sx: { height: "100%" },
                }}
              />
            </Grid>
          </Grid>
        )}

        {/* Budget List */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">Budget Categories</Typography>
          </Box>

          {budgets.length > 0 ? (
            <Box>
              {budgets.map((budget) => {
                const spentAmount = budget.monthlyBudget - budget.currentBudget;
                const spentPercentage = calculatePercentage(
                  spentAmount,
                  budget.monthlyBudget
                );
                const isOverBudget = spentAmount > budget.monthlyBudget;

                return (
                  <Box
                    key={budget.budgetId}
                    sx={{
                      p: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                      "&:last-child": { borderBottom: 0 },
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {budget.category}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Box sx={{ width: "100%" }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(spentAmount)} of{" "}
                              {formatCurrency(budget.monthlyBudget)}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              color={
                                isOverBudget
                                  ? "error.main"
                                  : spentPercentage > 80
                                  ? "warning.main"
                                  : "success.main"
                              }
                            >
                              {spentPercentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={spentPercentage}
                            color={
                              isOverBudget
                                ? "error"
                                : spentPercentage > 80
                                ? "warning"
                                : "success"
                            }
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={3}
                        sx={{
                          display: "flex",
                          justifyContent: { xs: "flex-start", sm: "flex-end" },
                        }}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditBudget(budget)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleOpenDeleteDialog(budget)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No budget categories found. Click "Add Budget" to create your
                first budget category.
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Add/Edit Budget Dialog - Using the extracted component */}
      <BudgetFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        mode={dialogMode}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLoading={submitLoading}
        error={error}
      />

      {/* Delete Budget Confirmation Dialog - Using the extracted component */}
      <DeleteBudgetDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        budget={budgetToDelete}
        onConfirm={handleDeleteBudget}
        loading={deleteLoading}
      />
    </Box>
  );
};

export default PersonalBudget;
