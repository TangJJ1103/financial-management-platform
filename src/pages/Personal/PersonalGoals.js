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
  Tabs,
  Tab,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  EmojiEvents as EmojiEventsIcon,
  Savings as SavingsIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  FlightTakeoff as TravelIcon,
  Celebration as CelebrationIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import {
  addUserGoal,
  getUserGoals,
  updateUserGoal,
  deleteUserGoal,
} from "../../dataHooks/savingGoalsHooks";
import {
  addGoalTransaction,
  getGoalTransactions,
} from "../../dataHooks/goalTransactionsHooks";

// Import the new dialog components at the top of the file
import {
  TransactionHistoryDialog,
  TransactionHistoryDialogMobile,
  TransactionDetailsDialog,
  TransactionDetailsDialogMobile,
  GoalFormDialog,
  AddSavingsDialog,
  DeleteGoalDialog,
} from "../../components/dialogs/savingTransactions";

// Goal categories with icons
const goalCategories = [
  { name: "Savings", icon: <SavingsIcon /> },
  { name: "Education", icon: <SchoolIcon /> },
  { name: "Housing", icon: <HomeIcon /> },
  { name: "Vehicle", icon: <CarIcon /> },
  { name: "Travel", icon: <TravelIcon /> },
  { name: "Other", icon: <FlagIcon /> },
];

// Goal timeframes
const goalTimeframes = [
  "1 month",
  "3 months",
  "6 months",
  "1 year",
  "2 years",
  "5 years",
  "10 years",
  "Custom",
];

// Add priority options
const priorityOptions = ["Low", "Medium", "High"];

const PersonalGoals = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [tabValue, setTabValue] = useState(0);
  const [goals, setGoals] = useState([]);
  const [achievedGoals, setAchievedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [achievedLoading, setAchievedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add", "edit", "addSavings"
  const [currentGoal, setCurrentGoal] = useState(null);
  const [formData, setFormData] = useState({
    goalName: "",
    category: "",
    targetAmount: "",
    currentAmount: "",
    deadline: dayjs().add(1, "month").format("YYYY-MM-DD"),
    timeframe: "1 month", // UI-only field, not sent to backend
    description: "",
    priority: "Medium",
  });
  const [savingsData, setSavingsData] = useState({
    amount: "",
    description: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [celebrateGoal, setCelebrateGoal] = useState(null);
  const [openTransactionHistory, setOpenTransactionHistory] = useState(false);
  const [transactionHistoryGoal, setTransactionHistoryGoal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null); // New state variable
  const [openTransactionDetails, setOpenTransactionDetails] = useState(false); // New state variable
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch goals data
  useEffect(() => {
    const fetchGoalsData = async () => {
      try {
        setLoading(true);
        setAchievedLoading(true);
        const response = await getUserGoals();

        if (response.error) {
          setError(response.message || "Failed to load goals data");
          setGoals([]);
          setAchievedGoals([]);
        } else {
          // Handle the case where goalsData might be empty or not exist
          const allGoals = response.data.goalsData || [];

          // Filter goals based on isAchieved attribute
          const activeGoals = allGoals.filter((goal) => !goal.isAchieved);
          const completedGoals = allGoals.filter((goal) => goal.isAchieved);

          setGoals(activeGoals);
          setAchievedGoals(completedGoals);
        }
      } catch (err) {
        console.error("Error fetching goals data:", err);
        setError("Failed to load goals data. Please try again later.");
        setGoals([]);
        setAchievedGoals([]);
      } finally {
        setLoading(false);
        setAchievedLoading(false);
      }
    };

    fetchGoalsData();
  }, []);

  // Handle dialog open for adding new goal
  const handleAddGoal = () => {
    setDialogMode("add");
    setFormData({
      goalName: "",
      category: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: dayjs().add(1, "month").format("YYYY-MM-DD"), // Ensure this is at least 1 month in the future
      timeframe: "1 month", // Keep for UI only
      description: "",
      priority: "Medium",
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing goal
  const handleEditGoal = (goal) => {
    setDialogMode("edit");
    setCurrentGoal(goal);
    setFormData({
      goalName: goal.goalName || goal.name, // Use goalName if available, fallback to name
      category: goal.category,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline ? goal.deadline.split("T")[0] : goal.targetDate, // Extract date part from deadline
      timeframe: goal.timeframe || "1 month", // Keep for UI only
      description: goal.description || "",
      priority: goal.priority || "Medium",
    });
    setOpenDialog(true);
  };

  // Handle dialog open for adding savings to goal
  const handleAddSavings = (goal) => {
    setDialogMode("addSavings");
    setCurrentGoal(goal);
    setSavingsData({
      amount: "",
      description: "",
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGoal(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "timeframe" && value === "Custom") {
      // If custom timeframe is selected, don't update the deadline
      setFormData({
        ...formData,
        [name]: value,
      });
      return;
    }

    if (name === "timeframe") {
      // Update deadline based on timeframe (UI-only field, not stored in backend)
      let deadline = dayjs();

      switch (value) {
        case "1 month":
          deadline = deadline.add(1, "month");
          break;
        case "3 months":
          deadline = deadline.add(3, "months");
          break;
        case "6 months":
          deadline = deadline.add(6, "months");
          break;
        case "1 year":
          deadline = deadline.add(1, "year");
          break;
        case "2 years":
          deadline = deadline.add(2, "years");
          break;
        case "5 years":
          deadline = deadline.add(5, "years");
          break;
        case "10 years":
          deadline = deadline.add(10, "years");
          break;
        default:
          break;
      }

      setFormData({
        ...formData,
        [name]: value,
        deadline: deadline.format("YYYY-MM-DD"),
      });
    } else if (name === "deadline") {
      // Check if selected date is not before today
      const selectedDate = dayjs(value);
      const today = dayjs().startOf("day");

      if (selectedDate.isBefore(today)) {
        setError("Target date cannot be in the past");
        return;
      }

      // If deadline is changed manually, set timeframe to Custom
      setFormData({
        ...formData,
        [name]: value,
        timeframe: "Custom",
      });
    } else if (name === "targetAmount" || name === "currentAmount") {
      // Only allow numbers and decimal point for amounts
      setFormData({
        ...formData,
        [name]: value.replace(/[^0-9.]/g, ""),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle savings input changes
  const handleSavingsInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // Only allow numbers and decimal point for amount
      setSavingsData({
        ...savingsData,
        [name]: value.replace(/[^0-9.]/g, ""),
      });
    } else {
      setSavingsData({
        ...savingsData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formData.goalName || !formData.category || !formData.targetAmount) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      isNaN(Number.parseFloat(formData.targetAmount)) ||
      Number.parseFloat(formData.targetAmount) <= 0
    ) {
      setError("Please enter a valid target amount");
      return;
    }

    if (
      isNaN(Number.parseFloat(formData.currentAmount)) ||
      Number.parseFloat(formData.currentAmount) < 0
    ) {
      setError("Please enter a valid current amount");
      return;
    }

    if (
      Number.parseFloat(formData.currentAmount) >
      Number.parseFloat(formData.targetAmount)
    ) {
      setError("Current amount cannot be greater than target amount");
      return;
    }

    if (dayjs(formData.deadline).isBefore(dayjs().startOf("day"))) {
      setError("Target date cannot be in the past");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      // Use a GUID format for userId to match backend expectations
      const userId = JSON.parse(sessionStorage.getItem("user"))?.userId || "";
      const targetAmount = Number.parseFloat(formData.targetAmount);
      const currentAmount = Number.parseFloat(formData.currentAmount);

      let response;
      if (dialogMode === "add") {
        // Add new goal
        response = await addUserGoal({
          userId,
          goalName: formData.goalName,
          category: formData.category,
          targetAmount,
          currentAmount,
          deadline: formData.deadline,
          description: formData.description,
          priority: formData.priority || "Medium",
          // timeframe is intentionally not included as it's only for UI
        });
        if (response.error) {
          setError(response.message || "Operation failed");
        } else {
          // Refresh goals data
          const response = await getUserGoals();
          if (response.data.goalsData) {
            const allGoals = response.data.goalsData || [];

            // Filter goals based on isAchieved attribute
            const activeGoals = allGoals.filter((goal) => !goal.isAchieved);
            const completedGoals = allGoals.filter((goal) => goal.isAchieved);

            setGoals(activeGoals);
            setAchievedGoals(completedGoals);
          }
          handleCloseDialog();
        }
      } else if (dialogMode === "edit") {
        // Update existing goal
        response = await updateUserGoal({
          goalId: currentGoal.goalId,
          userId,
          goalName: formData.goalName,
          category: formData.category,
          targetAmount,
          currentAmount,
          deadline: formData.deadline,
          description: formData.description,
          priority: formData.priority || "Medium",
        });

        if (response.error) {
          setError(response.message || "Operation failed");
        } else {
          // Refresh goals data
          const response = await getUserGoals();
          if (response.data.goalsData) {
            const allGoals = response.data.goalsData || [];

            // Filter goals based on isAchieved attribute
            const activeGoals = allGoals.filter((goal) => !goal.isAchieved);
            const completedGoals = allGoals.filter((goal) => goal.isAchieved);

            setGoals(activeGoals);
            setAchievedGoals(completedGoals);
          }
          handleCloseDialog();
        }
      }
    } catch (err) {
      console.error("Goal operation error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle adding savings to goal
  const handleSubmitSavings = async () => {
    // Validate form
    if (!savingsData.amount) {
      setError("Please enter an amount");
      return;
    }

    if (
      isNaN(Number.parseFloat(savingsData.amount)) ||
      Number.parseFloat(savingsData.amount) <= 0
    ) {
      setError("Please enter a valid amount");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const userId = JSON.parse(sessionStorage.getItem("user"))?.userId || 1; // Default to 1 for dummy data
      const amount = Number.parseFloat(savingsData.amount);

      // Calculate new current amount
      const newCurrentAmount = currentGoal.currentAmount + amount;

      // Check if new amount exceeds target
      if (newCurrentAmount > currentGoal.targetAmount) {
        setError("The amount you're adding would exceed the target amount");
        setSubmitLoading(false);
        return;
      }

      // Add savings transaction
      const response = await addGoalTransaction({
        goalId: currentGoal.goalId,
        userId,
        amount,
        description: savingsData.description || "Savings deposit",
      });

      if (response.error) {
        setError(response.message || "Operation failed");
      } else {
        const response = await getUserGoals();
        if (response.data.goalsData) {
          const allGoals = response.data.goalsData || [];

          // Filter goals based on isAchieved attribute
          const activeGoals = allGoals.filter((goal) => !goal.isAchieved);
          const completedGoals = allGoals.filter((goal) => goal.isAchieved);

          setGoals(activeGoals);
          setAchievedGoals(completedGoals);
        }
        handleCloseDialog();
      }
    } catch (err) {
      console.error("Add savings error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle opening delete confirmation dialog
  const handleOpenDeleteDialog = (goal) => {
    setGoalToDelete(goal);
    setOpenDeleteDialog(true);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setGoalToDelete(null);
  };

  // Handle goal deletion
  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await deleteUserGoal(goalToDelete.goalId);

      if (response.error) {
        setError(response.message || "Failed to delete goal");
      } else {
        setGoals((prevGoals) =>
          prevGoals.filter((g) => g.goalId !== goalToDelete.goalId)
        );
        handleCloseDeleteDialog();
      }
    } catch (err) {
      console.error("Delete goal error:", err);
      setError("Failed to delete goal. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle opening transaction history
  const handleOpenTransactionHistory = async (goal) => {
    setTransactionHistoryGoal(goal);
    setOpenTransactionHistory(true);
    setTransactionsLoading(true);

    try {
      const response = await getGoalTransactions(goal.goalId);

      if (response.error) {
        setTransactions([]);
      } else {
        setTransactions(response.data.transactionData || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenTransactionDetails(true);
  };

  // Handle closing transaction history
  const handleCloseTransactionHistory = () => {
    setOpenTransactionHistory(false);
    setTransactionHistoryGoal(null);
  };

  const handleCloseTransactionDetails = () => {
    setOpenTransactionDetails(false);
    setSelectedTransaction(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM D, YYYY");
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    return dayjs(dateString).format("MMM D, YYYY h:mm A");
  };

  // Calculate percentage
  const calculatePercentage = (current, target) => {
    if (target <= 0) return 0;
    // Use toFixed(1) to get one decimal place and convert back to number with parseFloat
    return Math.min(
      Number.parseFloat(((current / target) * 100).toFixed(1)),
      100
    );
  };

  // Get icon for category
  const getCategoryIcon = (categoryName) => {
    const category = goalCategories.find((cat) => cat.name === categoryName);
    return category ? category.icon : <FlagIcon />;
  };

  // Get days remaining until target date
  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return "No deadline set";

    const today = dayjs();
    const target = dayjs(targetDate);
    const days = target.diff(today, "day");

    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  // Get status chip for goal
  const getStatusChip = (goal) => {
    const percentage = calculatePercentage(
      goal.currentAmount,
      goal.targetAmount
    );
    const targetDate = goal.deadline || null;

    // If no deadline is set, only show progress-based status
    if (!targetDate) {
      if (percentage === 100) {
        return (
          <Chip
            label="Ready to Complete"
            size="small"
            color="success"
            variant="outlined"
            icon={<CheckCircleIcon />}
          />
        );
      }

      if (percentage >= 75) {
        return (
          <Chip
            label="Almost There"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      }

      if (percentage >= 50) {
        return (
          <Chip
            label="Good Progress"
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      }

      return (
        <Chip
          label="In Progress"
          size="small"
          color="default"
          variant="outlined"
        />
      );
    }

    // If deadline is set, include deadline-based status
    const daysRemaining = getDaysRemaining(targetDate);

    if (daysRemaining === "Overdue") {
      return (
        <Chip label="Overdue" size="small" color="error" variant="outlined" />
      );
    }

    if (percentage === 100) {
      return (
        <Chip
          label="Ready to Complete"
          size="small"
          color="success"
          variant="outlined"
          icon={<CheckCircleIcon />}
        />
      );
    }

    if (percentage >= 75) {
      return (
        <Chip
          label="Almost There"
          size="small"
          color="success"
          variant="outlined"
        />
      );
    }

    if (percentage >= 50) {
      return (
        <Chip
          label="Good Progress"
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    return (
      <Chip
        label="In Progress"
        size="small"
        color="default"
        variant="outlined"
      />
    );
  };

  if (loading && goals.length === 0 && tabValue === 0) {
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

  if (achievedLoading && achievedGoals.length === 0 && tabValue === 1) {
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
            <FlagIcon color="primary" />
            Personal Goals
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddGoal}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              py: 1,
            }}
          >
            Add Goal
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Celebration animation */}
        <AnimatePresence>
          {celebrateGoal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <Alert
                severity="success"
                icon={<CelebrationIcon />}
                sx={{
                  mb: 3,
                  backgroundColor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  "& .MuiAlert-icon": {
                    color: theme.palette.success.contrastText,
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Congratulations! 🎉
                </Typography>
                <Typography variant="body2">
                  You've achieved your goal: {celebrateGoal.name}
                </Typography>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab
              label="Active Goals"
              icon={<FlagIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              label="Achieved Goals"
              icon={<EmojiEventsIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Box>

        {/* Active Goals Tab */}
        {tabValue === 0 && (
          <Box>
            {goals.length > 0 ? (
              <Grid container spacing={2}>
                {goals.map((goal) => {
                  const percentage = calculatePercentage(
                    goal.currentAmount,
                    goal.targetAmount
                  );
                  const targetDate = goal.deadline || null;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={goal.goalId}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          height: "100%",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.primary.main,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {getCategoryIcon(goal.category)}
                              </Avatar>
                              <Typography
                                variant="subtitle1"
                                fontWeight="medium"
                                noWrap
                              >
                                {goal.name || goal.goalName}
                              </Typography>
                            </Box>
                            {getStatusChip(goal)}
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Progress
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {percentage}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              color={percentage === 100 ? "success" : "primary"}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>

                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Current
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(goal.currentAmount)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Target
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(goal.targetAmount)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Category
                              </Typography>
                              <Typography variant="body2">
                                {goal.category}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Priority
                              </Typography>
                              <Typography variant="body2">
                                {goal.priority || "Medium"}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Target Date
                              </Typography>
                              <Typography variant="body2">
                                {targetDate
                                  ? formatDate(targetDate)
                                  : "No deadline set"}
                              </Typography>
                            </Grid>
                          </Grid>

                          {goal.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {goal.description}
                            </Typography>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            {targetDate ? (
                              <Chip
                                label={getDaysRemaining(targetDate)}
                                size="small"
                                color={
                                  getDaysRemaining(targetDate) === "Overdue"
                                    ? "error"
                                    : getDaysRemaining(targetDate) === "Today"
                                    ? "warning"
                                    : "default"
                                }
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                label="No deadline"
                                size="small"
                                color="default"
                                variant="outlined"
                              />
                            )}

                            <Box>
                              <Tooltip title="Add Savings">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleAddSavings(goal)}
                                >
                                  <AddCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Transaction History">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleOpenTransactionHistory(goal)
                                  }
                                >
                                  <HistoryIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditGoal(goal)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDeleteDialog(goal)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 2,
                  textAlign: "center",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <FlagIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  No Active Goals
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  You don't have any active savings goals. Click "Add Goal" to
                  create your first goal.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddGoal}
                >
                  Add Your First Goal
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* Achieved Goals Tab */}
        {tabValue === 1 && (
          <Box>
            {achievedGoals.length > 0 ? (
              <Grid container spacing={2}>
                {achievedGoals.map((goal) => (
                  <Grid item xs={12} sm={6} md={4} key={goal.goalId}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        height: "100%",
                        position: "relative",
                        overflow: "hidden",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: 0,
                          height: 0,
                          borderStyle: "solid",
                          borderWidth: "0 40px 40px 0",
                          borderColor: `transparent ${theme.palette.success.main} transparent transparent`,
                          zIndex: 1,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.success.main,
                                width: 32,
                                height: 32,
                              }}
                            >
                              {getCategoryIcon(goal.category)}
                            </Avatar>
                            <Typography
                              variant="subtitle1"
                              fontWeight="medium"
                              noWrap
                            >
                              {goal.name}
                            </Typography>
                          </Box>
                          <Chip
                            label="Achieved"
                            size="small"
                            color="success"
                            icon={<EmojiEventsIcon />}
                          />
                        </Box>

                        <Box
                          sx={{
                            mb: 2,
                          }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={100}
                            color="success"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Saved Amount
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(goal.targetAmount)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Category
                            </Typography>
                            <Typography variant="body2">
                              {goal.category}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Achieved Date
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(goal.achivedDate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Target Date
                            </Typography>
                            <Typography variant="body2">
                              {goal.deadline
                                ? formatDate(goal.deadline)
                                : "No deadline set"}
                            </Typography>
                          </Grid>
                        </Grid>

                        {goal.description && (
                          <Typography variant="body2" color="text.secondary">
                            {goal.description}
                          </Typography>
                        )}

                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {goal.achivedDate &&
                          goal.deadline &&
                          dayjs(goal.achivedDate).isBefore(
                            dayjs(goal.deadline)
                          ) ? (
                            <Chip
                              label={`Achieved ${dayjs(goal.deadline).diff(
                                dayjs(goal.achivedDate),
                                "day"
                              )} days early`}
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<CelebrationIcon />}
                            />
                          ) : (
                            <Chip
                              label="Goal completed"
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<CheckCircleIcon />}
                            />
                          )}
                          <Box>
                            <Tooltip title="Transaction History">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenTransactionHistory(goal)
                                }
                              >
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(goal)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 2,
                  textAlign: "center",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <EmojiEventsIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  No Achieved Goals Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You haven't achieved any savings goals yet. Complete your
                  active goals to see them here.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </motion.div>

      {/* Add/Edit Goal Dialog */}
      <GoalFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        mode={dialogMode}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLoading={submitLoading}
        error={error}
        goalCategories={goalCategories}
        priorityOptions={priorityOptions}
        goalTimeframes={goalTimeframes}
      />

      {/* Add Savings Dialog */}
      <AddSavingsDialog
        open={openDialog && dialogMode === "addSavings"}
        onClose={handleCloseDialog}
        goal={currentGoal}
        savingsData={savingsData}
        onInputChange={handleSavingsInputChange}
        onSubmit={handleSubmitSavings}
        submitLoading={submitLoading}
        error={error}
        formatCurrency={formatCurrency}
        calculatePercentage={calculatePercentage}
      />

      {/* Transaction History Dialog - Responsive version */}
      {isMobile ? (
        <TransactionHistoryDialogMobile
          open={openTransactionHistory}
          onClose={handleCloseTransactionHistory}
          goal={transactionHistoryGoal}
          transactions={transactions}
          loading={transactionsLoading}
          onViewTransaction={handleViewTransaction}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      ) : (
        <TransactionHistoryDialog
          open={openTransactionHistory}
          onClose={handleCloseTransactionHistory}
          goal={transactionHistoryGoal}
          transactions={transactions}
          loading={transactionsLoading}
          onViewTransaction={handleViewTransaction}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Transaction Details Dialog - Responsive version */}
      {isMobile ? (
        <TransactionDetailsDialogMobile
          open={openTransactionDetails}
          onClose={handleCloseTransactionDetails}
          transaction={selectedTransaction}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
        />
      ) : (
        <TransactionDetailsDialog
          open={openTransactionDetails}
          onClose={handleCloseTransactionDetails}
          transaction={selectedTransaction}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Delete Goal Confirmation Dialog */}
      <DeleteGoalDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        goal={goalToDelete}
        onConfirm={handleDeleteGoal}
        loading={deleteLoading}
      />
    </Box>
  );
};

export default PersonalGoals;
