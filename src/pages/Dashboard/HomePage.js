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
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import {
  AccountBalance,
  Receipt,
  TrendingUp,
  Person,
  People,
} from "@mui/icons-material";
import StatCard from "../../components/dashboard/StatCard";
import ModernCard from "../../components/dashboard/ModernCard";
import BudgetPieChart from "../../globalComponents/Charts/BudgetPieChart";
import ExpensesLineChart from "../../globalComponents/Charts/ExpensesLineChart";
import GoalsBarChart from "../../globalComponents/Charts/GoalsBarChart";
import {
  getUserExpenses,
  getFamilyExpenses,
} from "../../dataHooks/expensesHooks";
import { getUserBudget, getFamilyBudget } from "../../dataHooks/budgetHooks";
import { getFamilyMembers } from "../../dataHooks/familyHooks";
import dayjs from "dayjs";
import { getCategoryIcon } from "../../constants/financeCategories";

// Tab Panel component for accessibility
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function for tab accessibility
function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    "aria-controls": `dashboard-tabpanel-${index}`,
  };
}

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Personal dashboard states
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

  // Family dashboard states
  const [familyLoading, setFamilyLoading] = useState(true);
  const [familyError, setFamilyError] = useState(null);
  const [familyExpensesData, setFamilyExpensesData] = useState([]);
  const [familyBudgetData, setFamilyBudgetData] = useState([]);
  const [familyCategoryData, setFamilyCategoryData] = useState([]);
  const [familyRecentTransactions, setFamilyRecentTransactions] = useState([]);
  const [familyFilteredCategoryData, setFamilyFilteredCategoryData] = useState(
    []
  );
  const [
    familyFilteredBudgetVsActualData,
    setFamilyFilteredBudgetVsActualData,
  ] = useState({
    xAxisData: [],
    series: [],
  });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [hasFamilyAccess, setHasFamilyAccess] = useState(false);

  // Financial summary stats
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [familyTotalBudget, setFamilyTotalBudget] = useState(0);
  const [familyTotalExpenses, setFamilyTotalExpenses] = useState(0);
  const currencyType =
    JSON.parse(sessionStorage.getItem("user"))?.currencyType || "MYR";

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Load family data if switching to family tab and not already loaded
    if (newValue === 1 && familyLoading && hasFamilyAccess) {
      fetchFamilyDashboardData();
    }
  };

  useEffect(() => {
    setHasFamilyAccess(sessionStorage.getItem("hasFamily") === "true");

    fetchPersonalDashboardData();
  }, []);

  const fetchPersonalDashboardData = async () => {
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

  const fetchFamilyDashboardData = async () => {
    setFamilyLoading(true);
    setFamilyError(null);

    try {
      // Fetch all required family data in parallel
      const [
        familyExpensesResponse,
        familyBudgetResponse,
        familyMembersResponse,
      ] = await Promise.all([
        getFamilyExpenses(),
        getFamilyBudget(),
        getFamilyMembers(JSON.parse(sessionStorage.getItem("family")).familyId),
      ]);

      // Process family members data
      if (!familyMembersResponse.error) {
        console.log(familyMembersResponse);
        const members = familyMembersResponse.data.members || [];
        setFamilyMembers(members);
      }

      // Process family expenses data
      if (!familyExpensesResponse.error) {
        const expenses = familyExpensesResponse.data.expensesData || [];
        setFamilyExpensesData(expenses);

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

        setFamilyTotalExpenses(currentMonthTotal);

        // Process category data for pie chart - only current month
        // Create category map from filtered expenses
        const categoryMap = currentMonthExpenses.reduce((acc, expense) => {
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

        setFamilyCategoryData(categoryChartData);
        setFamilyFilteredCategoryData(categoryChartData);

        // Set recent transactions
        const sortedExpenses = [...expenses].sort(
          (a, b) => new Date(b.expensesDate) - new Date(a.expensesDate)
        );
        setFamilyRecentTransactions(sortedExpenses.slice(0, 5));
      }

      // Process family budget data
      if (!familyBudgetResponse.error) {
        const budgets = familyBudgetResponse.data.budgetData || [];
        setFamilyBudgetData(budgets);

        // Calculate total budget
        const total = budgets.reduce(
          (sum, budget) => sum + budget.monthlyBudget,
          0
        );
        setFamilyTotalBudget(total);

        // Initialize filtered data
        setFamilyFilteredBudgetVsActualData(
          prepareBudgetVsActualData(budgets, true)
        );
      }
    } catch (err) {
      console.error("Error fetching family dashboard data:", err);
      setFamilyError("Failed to load family dashboard data. Please try again.");
    } finally {
      setFamilyLoading(false);
    }
  };

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

  // Prepare data for the budget vs actual chart
  const prepareBudgetVsActualData = (data = [], isFamily = false) => {
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
  const handlePieChartFilterChange = (timeRange, isFamily = false) => {
    // In a real app, you would filter the data based on the time range
    // For demo purposes, we'll just simulate different data for different time ranges
    const sourceData = isFamily ? familyCategoryData : categoryData;
    const setFilteredData = isFamily
      ? setFamilyFilteredCategoryData
      : setFilteredCategoryData;

    if (timeRange === "today") {
      // Filter data for today
      const filteredData = sourceData.map((item) => ({
        ...item,
        value: item.value * 0.03, // Simulate today's data (3% of monthly)
      }));
      setFilteredData(filteredData);
    } else if (timeRange === "this-week") {
      // Filter data for the current week
      const filteredData = sourceData.map((item) => ({
        ...item,
        value: item.value * 0.25, // Simulate weekly data (25% of monthly)
      }));
      setFilteredData(filteredData);
    } else if (timeRange === "this-month") {
      // Use the original monthly data
      setFilteredData(sourceData);
    } else if (timeRange === "this-year") {
      // Simulate yearly data (12x monthly)
      const filteredData = sourceData.map((item) => ({
        ...item,
        value: item.value * 12,
      }));
      setFilteredData(filteredData);
    } else if (timeRange === "last-year") {
      // Simulate last year's data (10x monthly)
      const filteredData = sourceData.map((item) => ({
        ...item,
        value: item.value * 10,
      }));
      setFilteredData(filteredData);
    }
  };

  // Handle filter changes for budget vs actual chart
  const handleBudgetVsActualFilterChange = (timeRange, isFamily = false) => {
    // In a real app, you would filter the data based on the time range
    // For demo purposes, we'll just simulate different data for different time ranges
    const sourceData = isFamily ? familyBudgetData : budgetData;
    const setFilteredData = isFamily
      ? setFamilyFilteredBudgetVsActualData
      : setFilteredBudgetVsActualData;

    if (timeRange === "today") {
      // Create today's data (subset of categories)
      const todayData = sourceData.slice(0, 2).map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 0.03,
        currentBudget: item.currentBudget * 0.03,
      }));
      setFilteredData(prepareBudgetVsActualData(todayData, isFamily));
    } else if (timeRange === "this-week") {
      // Create weekly data (subset of categories)
      const weeklyData = sourceData.slice(0, 3).map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 0.25,
        currentBudget: item.currentBudget * 0.25,
      }));
      setFilteredData(prepareBudgetVsActualData(weeklyData, isFamily));
    } else if (timeRange === "this-month") {
      // Use the original monthly data
      setFilteredData(prepareBudgetVsActualData(sourceData, isFamily));
    } else if (timeRange === "this-year") {
      // Create yearly data (all categories with 12x values)
      const yearlyData = sourceData.map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 12,
        currentBudget: item.currentBudget * 12,
      }));
      setFilteredData(prepareBudgetVsActualData(yearlyData, isFamily));
    } else if (timeRange === "last-year") {
      // Create last year's data (all categories with 10x values)
      const lastYearData = sourceData.map((item) => ({
        ...item,
        monthlyBudget: item.monthlyBudget * 10,
        currentBudget: item.currentBudget * 10,
      }));
      setFilteredData(prepareBudgetVsActualData(lastYearData, isFamily));
    }
  };

  // Render loading state
  if (loading && tabValue === 0) {
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

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "10px",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
          mb: 2,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: theme.palette.primary.main,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              minHeight: { xs: "48px", sm: "56px" },
            },
          }}
        >
          <Tab
            icon={<Person />}
            iconPosition="start"
            label="Personal"
            {...a11yProps(0)}
          />
          {hasFamilyAccess && (
            <Tab
              icon={<People />}
              iconPosition="start"
              label="Family"
              {...a11yProps(1)}
            />
          )}
        </Tabs>
      </Paper>

      {/* Personal Dashboard Tab */}
      <TabPanel value={tabValue} index={0}>
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
              onFilterChange={(timeRange) =>
                handlePieChartFilterChange(timeRange, false)
              }
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
              onFilterChange={(timeRange) =>
                handleBudgetVsActualFilterChange(timeRange, false)
              }
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
      </TabPanel>

      {/* Family Dashboard Tab */}
      <TabPanel value={tabValue} index={1}>
        {familyLoading ? (
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
        ) : (
          <>
            {familyError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {familyError}
              </Alert>
            )}

            {!hasFamilyAccess ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                You are not part of a family group. Join or create a family to
                access family finances.
              </Alert>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                {/* Family Stats Row */}
                <Grid item xs={12} sm={6}>
                  <StatCard
                    title="Family Budget"
                    value={formatCurrency(familyTotalBudget)}
                    icon={<AccountBalance />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StatCard
                    title="Family Expenses"
                    value={formatCurrency(familyTotalExpenses)}
                    icon={<Receipt />}
                    trend={{
                      value:
                        familyTotalBudget > 0
                          ? Math.round(
                              Math.abs(
                                (familyTotalExpenses / familyTotalBudget) *
                                  100 -
                                  100
                              )
                            )
                          : 0,
                      isPositive: familyTotalExpenses <= familyTotalBudget,
                    }}
                    color={
                      familyTotalExpenses > familyTotalBudget
                        ? "error"
                        : familyTotalExpenses > familyTotalBudget * 0.8
                        ? "warning"
                        : "success"
                    }
                  />
                </Grid>

                {/* Family Members Summary */}
                <Grid item xs={12}>
                  <ModernCard
                    title="Family Members"
                    subtitle="Active members in your family group"
                    icon={<People />}
                    height="auto"
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        justifyContent: "flex-start",
                        p: 2,
                      }}
                    >
                      {console.log(familyMembers)}
                      {familyMembers.length > 0 ? (
                        familyMembers.map((member) => {
                          // Check if this is the current user
                          const currentUserId = JSON.parse(
                            sessionStorage.getItem("user")
                          )?.userId;
                          const isCurrentUser = member.userId === currentUserId;

                          return (
                            <Box
                              key={member.userId}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                p: 1,
                                borderRadius: 1,
                                // Apply a different background color for the current user
                                bgcolor: isCurrentUser
                                  ? theme.palette.mode === "dark"
                                    ? "rgba(94, 129, 246, 0.15)"
                                    : "rgba(62, 106, 225, 0.08)"
                                  : theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.02)",
                                // Apply a subtle border for the current user
                                border: isCurrentUser
                                  ? `1px solid ${theme.palette.primary.main}`
                                  : "none",
                                minWidth: {
                                  xs: "45%",
                                  sm: "30%",
                                  md: "22%",
                                  lg: "18%",
                                },
                                maxWidth: {
                                  xs: "45%",
                                  sm: "30%",
                                  md: "22%",
                                  lg: "18%",
                                },
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 56,
                                  height: 56,
                                  mb: 1,
                                  bgcolor: isCurrentUser
                                    ? theme.palette.secondary.main
                                    : theme.palette.primary.main,
                                }}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography
                                variant="subtitle2"
                                align="center"
                                noWrap
                                sx={{
                                  fontWeight: isCurrentUser ? "bold" : "normal",
                                }}
                              >
                                {isCurrentUser
                                  ? `${member.name} (You)`
                                  : member.name}
                              </Typography>
                              <Chip
                                label={member.role}
                                size="small"
                                color={
                                  member.role === "parent"
                                    ? "primary"
                                    : "default"
                                }
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          );
                        })
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No family members found
                        </Typography>
                      )}
                    </Box>
                  </ModernCard>
                </Grid>

                {/* Family Expense by Category Chart */}
                <Grid item xs={12} md={6} lg={5}>
                  <BudgetPieChart
                    title="Family Expenses by Category"
                    subtitle="Breakdown of family spending by category"
                    data={familyFilteredCategoryData}
                    onFilterChange={(timeRange) =>
                      handlePieChartFilterChange(timeRange, true)
                    }
                    height={isMobile ? 250 : isTablet ? 280 : 300}
                    cardProps={{
                      sx: { height: "100%" },
                    }}
                  />
                </Grid>

                {/* Family Monthly Spending Trends */}
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ height: "100%" }}>
                    {familyExpensesData.length > 0 ? (
                      <ExpensesLineChart
                        title="Family Spending Trends"
                        subtitle="Your family's spending patterns over time"
                        rawData={familyExpensesData}
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
                        title="Family Spending Trends"
                        subtitle="Your family's spending patterns over time"
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
                            No family trend data available
                          </Typography>
                        </Box>
                      </ModernCard>
                    )}
                  </Box>
                </Grid>

                {/* Family Budget vs Actual */}
                <Grid item xs={12} md={6}>
                  <GoalsBarChart
                    title="Family Budget vs Actual"
                    subtitle="Comparison of family budgeted and actual spending by category"
                    xAxisData={familyFilteredBudgetVsActualData.xAxisData}
                    series={familyFilteredBudgetVsActualData.series}
                    onFilterChange={(timeRange) =>
                      handleBudgetVsActualFilterChange(timeRange, true)
                    }
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

                {/* Family Recent Transactions */}
                <Grid item xs={12} md={6}>
                  <ModernCard
                    title="Family Recent Transactions"
                    subtitle="Your family's latest financial activities"
                    icon={<Receipt />}
                    height="auto"
                  >
                    {familyRecentTransactions.length > 0 ? (
                      <Box
                        sx={{
                          width: "100%",
                          maxHeight: { xs: 200, sm: 250, md: 300, lg: 350 },
                          overflow: "auto",
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
                          {familyRecentTransactions.map(
                            (transaction, index) => (
                              <React.Fragment
                                key={transaction.expensesId || index}
                              >
                                <ListItem
                                  alignItems="flex-start"
                                  sx={{
                                    py: { xs: 0.5, sm: 1 },
                                    px: { xs: 1, sm: 2 },
                                  }}
                                >
                                  <ListItemAvatar
                                    sx={{ minWidth: { xs: 40, sm: 56 } }}
                                  >
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
                                      <Box
                                        sx={{
                                          color: theme.palette.primary.main,
                                        }}
                                      >
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
                                            fontSize: {
                                              xs: "0.75rem",
                                              sm: "0.875rem",
                                            },
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
                                            fontSize: {
                                              xs: "0.75rem",
                                              sm: "0.875rem",
                                            },
                                          }}
                                        >
                                          -
                                          {formatCurrency(
                                            transaction.amountConverted
                                          )}
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
                                            fontSize: {
                                              xs: "0.7rem",
                                              sm: "0.75rem",
                                            },
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
                                            fontSize: {
                                              xs: "0.6rem",
                                              sm: "0.7rem",
                                            },
                                          }}
                                        />
                                        {transaction.addedBy && (
                                          <Chip
                                            label={`Added by: ${transaction.addedBy}`}
                                            size="small"
                                            sx={{
                                              ml: 1,
                                              height: { xs: 16, sm: 20 },
                                              fontSize: {
                                                xs: "0.6rem",
                                                sm: "0.7rem",
                                              },
                                            }}
                                          />
                                        )}
                                      </React.Fragment>
                                    }
                                  />
                                </ListItem>
                                {index <
                                  familyRecentTransactions.length - 1 && (
                                  <Divider variant="inset" component="li" />
                                )}
                              </React.Fragment>
                            )
                          )}
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
                          No family transactions
                        </Typography>
                      </Box>
                    )}
                  </ModernCard>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </TabPanel>
    </Box>
  );
};

export default HomePage;
