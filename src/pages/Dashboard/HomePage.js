"use client";

import React from "react";

import { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { AccountBalance, Receipt, TrendingUp } from "@mui/icons-material";
import StatCard from "../../components/dashboard/StatCard";
import ModernCard from "../../components/dashboard/ModernCard";
import ExpensesLineChart from "../../globalComponents/Charts/ExpensesLineChart";
import BudgetPieChart from "../../globalComponents/Charts/BudgetPieChart";
import GoalsBarChart from "../../globalComponents/Charts/GoalsBarChart";
import { getUserExpenses } from "../../dataHooks/expensesHooks";
import { getUserBudget } from "../../dataHooks/budgetHooks";
import dayjs from "dayjs";
import { getCategoryIcon } from "../../constants/financeCategories";

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expensesData, setExpensesData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [filteredCategoryData, setFilteredCategoryData] = useState([]);
  const [filteredBudgetVsActualData, setFilteredBudgetVsActualData] = useState({
    xAxisData: [],
    series: [],
  });

  // Financial summary stats
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const currencyType =
    JSON.parse(sessionStorage.getItem("user"))?.currencyType || "MYR";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all required data in parallel
        const [expensesResponse, budgetResponse] = await Promise.all([
          getUserExpenses(),
          getUserBudget(),
        ]);

        // Process expenses data
        if (!expensesResponse.error) {
          const expenses = expensesResponse.data.expensesData || [];
          setExpensesData(expenses);

          // Calculate total expenses for all time
          const total = expenses.reduce(
            (sum, expense) => sum + expense.amountConverted,
            0
          );

          // Calculate current month expenses only
          const now = dayjs();
          const currentMonthStart = now.startOf("month");
          const currentMonthEnd = now.endOf("month");

          const currentMonthExpenses = expenses.filter((expense) => {
            const expenseDate = dayjs(expense.expensesDate);
            return (
              expenseDate.isAfter(currentMonthStart) &&
              expenseDate.isBefore(currentMonthEnd)
            );
          });

          const currentMonthTotal = currentMonthExpenses.reduce(
            (sum, expense) => sum + expense.amountConverted,
            0
          );

          setTotalExpenses(currentMonthTotal); // Set only current month expenses

          // Process category data for pie chart - only current month
          const nowPie = dayjs();
          const currentMonthStartPie = nowPie.startOf("month");
          const currentMonthEndPie = nowPie.endOf("month");

          // Filter expenses for current month only
          const currentMonthExpensesPie = expenses.filter((expense) => {
            const expenseDate = dayjs(expense.expensesDate);
            return (
              expenseDate.isAfter(currentMonthStartPie) &&
              expenseDate.isBefore(currentMonthEndPie)
            );
          });

          // Create category map from filtered expenses
          const categoryMap = currentMonthExpensesPie.reduce((acc, expense) => {
            const category = expense.category || "Other";
            acc[category] = (acc[category] || 0) + expense.amountConverted;
            return acc;
          }, {});

          const categoryChartData = Object.entries(categoryMap).map(
            ([name, value]) => ({
              id: name,
              value: value,
              label: name,
            })
          );

          setCategoryData(categoryChartData);
          setFilteredCategoryData(categoryChartData);

          // Set recent transactions
          const sortedExpenses = [...expenses].sort(
            (a, b) => new Date(b.expensesDate) - new Date(a.expensesDate)
          );
          setRecentTransactions(sortedExpenses.slice(0, 5));
        }

        // Process budget data
        if (!budgetResponse.error) {
          const budgets = budgetResponse.data.budgetData || [];
          setBudgetData(budgets);

          // Calculate total budget
          const total = budgets.reduce(
            (sum, budget) => sum + budget.monthlyBudget,
            0
          );
          setTotalBudget(total);

          // Initialize filtered data
          setFilteredBudgetVsActualData(prepareBudgetVsActualData(budgets));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currencyType,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM D, YYYY");
  };

  // Replace the getCategoryIcon function with one that returns themed icons
  // And replace with an import at the top of the file:

  // Prepare data for the budget vs actual chart
  const prepareBudgetVsActualData = (data = budgetData) => {
    if (!data.length) return { xAxisData: [], series: [] };

    // Extract categories for x-axis
    const xAxisData = data.map((item) => item.category);

    // Create series data
    const series = [
      {
        id: "budget",
        label: "Budget",
        data: data.map((item) => item.monthlyBudget),
        color: theme.palette.primary.main,
        valueFormatter: (value) => formatCurrency(value),
      },
      {
        id: "spent",
        label: "Spent",
        data: data.map((item) => item.monthlyBudget - item.currentBudget),
        color: theme.palette.error.main,
        valueFormatter: (value) => formatCurrency(value),
      },
    ];

    return { xAxisData, series };
  };

  // Handle filter changes for pie chart
  const handlePieChartFilterChange = (timeRange) => {
    // In a real app, you would filter the data based on the time range
    // For demo purposes, we'll just simulate different data for different time ranges
    if (timeRange === "today") {
      // Filter data for today
      const filteredData = categoryData.map((item) => ({
        ...item,
        value: item.value * 0.03, // Simulate today's data (3% of monthly)
      }));
      setFilteredCategoryData(filteredData);
    } else if (timeRange === "this-week") {
      // Filter data for the current week
      const filteredData = categoryData.map((item) => ({
        ...item,
        value: item.value * 0.25, // Simulate weekly data (25% of monthly)
      }));
      setFilteredCategoryData(filteredData);
    } else if (timeRange === "this-month") {
      // Use the original monthly data
      setFilteredCategoryData(categoryData);
    } else if (timeRange === "this-year") {
      // Simulate yearly data (12x monthly)
      const filteredData = categoryData.map((item) => ({
        ...item,
        value: item.value * 12,
      }));
      setFilteredCategoryData(filteredData);
    } else if (timeRange === "last-year") {
      // Simulate last year's data (10x monthly)
      const filteredData = categoryData.map((item) => ({
        ...item,
        value: item.value * 10,
      }));
      setFilteredCategoryData(filteredData);
    }
  };

  // Handle filter changes for budget vs actual chart
  const handleBudgetVsActualFilterChange = (timeRange) => {
    // In a real app, you would filter the data based on the time range
    // For demo purposes, we'll just simulate different data for different time ranges
    if (timeRange === "today") {
      // Create today's data (subset of categories)
      const todayData = budgetData.slice(0, 2).map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 0.03,
        currentBudget: item.currentBudget * 0.03,
      }));
      setFilteredBudgetVsActualData(prepareBudgetVsActualData(todayData));
    } else if (timeRange === "this-week") {
      // Create weekly data (subset of categories)
      const weeklyData = budgetData.slice(0, 3).map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 0.25,
        currentBudget: item.currentBudget * 0.25,
      }));
      setFilteredBudgetVsActualData(prepareBudgetVsActualData(weeklyData));
    } else if (timeRange === "this-month") {
      // Use the original monthly data
      setFilteredBudgetVsActualData(prepareBudgetVsActualData(budgetData));
    } else if (timeRange === "this-year") {
      // Create yearly data (all categories with 12x values)
      const yearlyData = budgetData.map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 12,
        currentBudget: item.currentBudget * 12,
      }));
      setFilteredBudgetVsActualData(prepareBudgetVsActualData(yearlyData));
    } else if (timeRange === "last-year") {
      // Create last year's data (all categories with 10x values)
      const lastYearData = budgetData.map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 10,
        currentBudget: item.currentBudget * 10,
      }));
      setFilteredBudgetVsActualData(prepareBudgetVsActualData(lastYearData));
    }
  };

  if (loading) {
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

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h4"
        fontWeight="700"
        sx={{
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
        }}
      >
        Financial Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {/* Stats Row */}
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Budget"
            value={formatCurrency(totalBudget)}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<Receipt />}
            trend={{
              value:
                totalBudget > 0
                  ? Math.round(
                      Math.abs((totalExpenses / totalBudget) * 100 - 100)
                    )
                  : 0,
              isPositive: totalExpenses <= totalBudget,
            }}
            color={
              totalExpenses > totalBudget
                ? "error"
                : totalExpenses > totalBudget * 0.8
                ? "warning"
                : "success"
            }
          />
        </Grid>

        {/* Expense by Category Chart */}
        <Grid item xs={12} md={6} lg={5}>
          <BudgetPieChart
            title="Expenses by Category"
            subtitle="Breakdown of your spending by category"
            data={filteredCategoryData}
            onFilterChange={handlePieChartFilterChange}
            height={isMobile ? 250 : isTablet ? 280 : 300}
            cardProps={{
              sx: { height: "100%" },
            }}
          />
        </Grid>

        {/* Monthly Spending Trends */}
        <Grid item xs={12} md={6} lg={7}>
          <Box sx={{ height: "100%" }}>
            {expensesData.length > 0 ? (
              <ExpensesLineChart
                title="Spending Trends"
                subtitle="Your spending patterns over time"
                rawData={expensesData}
                height={isMobile ? 250 : isTablet ? 280 : 300}
                margin={{
                  top: 20,
                  bottom: isTablet ? 80 : 70,
                  left: isTablet ? 50 : 70,
                  right: 20,
                }}
                cardProps={{
                  sx: { height: "100%" },
                }}
              />
            ) : (
              <ModernCard
                title="Spending Trends"
                subtitle="Your spending patterns over time"
                icon={<TrendingUp />}
                gradient
                height={{ xs: 250, sm: 280, md: 300 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No trend data available
                  </Typography>
                </Box>
              </ModernCard>
            )}
          </Box>
        </Grid>

        {/* Budget vs Actual */}
        <Grid item xs={12} md={6}>
          <GoalsBarChart
            title="Budget vs Actual"
            subtitle="Comparison of budgeted and actual spending by category"
            xAxisData={filteredBudgetVsActualData.xAxisData}
            series={filteredBudgetVsActualData.series}
            onFilterChange={handleBudgetVsActualFilterChange}
            height={isMobile ? 250 : isTablet ? 280 : 300}
            margin={{
              top: 20,
              bottom: isTablet ? 80 : 70,
              left: isTablet ? 50 : 70,
              right: 20,
            }}
            cardProps={{
              sx: { height: "100%" },
            }}
          />
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <ModernCard
            title="Recent Transactions"
            subtitle="Your latest financial activities"
            icon={<Receipt />}
            height="auto" // Change to auto height to adapt to content
          >
            {recentTransactions.length > 0 ? (
              <Box
                sx={{
                  width: "100%",
                  maxHeight: { xs: 200, sm: 250, md: 300, lg: 350 }, // Responsive max height
                  overflow: "auto",
                  // Add scrollbar styling for better visibility
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.2)",
                    borderRadius: "10px",
                    "&:hover": {
                      background:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(0,0,0,0.3)",
                    },
                  },
                }}
              >
                <List sx={{ width: "100%", p: 0 }}>
                  {recentTransactions.map((transaction, index) => (
                    <React.Fragment key={transaction.expensesId || index}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: { xs: 0.5, sm: 1 }, // Reduce padding on small screens
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        {/* Update the Recent Transactions section to use the new icons */}
                        <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 56 } }}>
                          <Avatar
                            sx={{
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.05)",
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 },
                            }}
                          >
                            <Box sx={{ color: theme.palette.primary.main }}>
                              {getCategoryIcon(transaction.category)}
                            </Box>
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                component="span"
                                sx={{
                                  mr: 1,
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  maxWidth: {
                                    xs: "120px",
                                    sm: "150px",
                                    md: "auto",
                                  },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {transaction.description ||
                                  transaction.category}
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                component="span"
                                color="error.main"
                                fontWeight="bold"
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                -{formatCurrency(transaction.amountConverted)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                variant="body2"
                                component="span"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              >
                                {formatDate(transaction.expensesDate)}
                              </Typography>
                              <Chip
                                label={transaction.category}
                                size="small"
                                sx={{
                                  ml: 1,
                                  height: { xs: 16, sm: 20 },
                                  fontSize: { xs: "0.6rem", sm: "0.7rem" },
                                }}
                              />
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < recentTransactions.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: 200,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No recent transactions
                </Typography>
              </Box>
            )}
          </ModernCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
