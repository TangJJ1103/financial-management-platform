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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  AvatarGroup,
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
  PeopleAlt as PeopleAltIcon,
  FamilyRestroomTwoTone,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import {
  getFamilyGoals,
  addFamilyGoal,
  updateFamilyGoal,
  deleteFamilyGoal,
} from "../../dataHooks/savingGoalsHooks";
import {
  getFamilyGoalTransactions,
  addFamilyGoalTransaction,
} from "../../dataHooks/goalTransactionsHooks";
import { getFamilyMembers } from "../../dataHooks/familyHooks";

// First, make sure we're importing the components at the top of the file
import {
  TransactionHistoryDialog,
  TransactionHistoryDialogMobile,
  TransactionDetailsDialog,
  TransactionDetailsDialogMobile,
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

const FamilyGoals = () => {
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
    contributors: [],
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
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openTransactionDetails, setOpenTransactionDetails] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const familyRole = sessionStorage.getItem("familyRole");

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Get default avatar for users
  const getDefaultAvatar = (name) => {
    if (!name) return { color: "#9e9e9e", initials: "?" };

    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate HSL color with good saturation and lightness for visibility in both themes
    const h = Math.abs(hash) % 360;
    const s = 65 + (Math.abs(hash) % 25); // 65-90% saturation
    const l = 55 + (Math.abs(hash) % 10); // 55-65% lightness for good contrast

    // Get initials (first letter of first and last name)
    const nameParts = name.split(" ");
    let initials = nameParts[0][0].toUpperCase();
    if (nameParts.length > 1 && nameParts[1].length > 0) {
      initials += nameParts[1][0].toUpperCase();
    } else if (name.length > 1) {
      initials += name[1].toUpperCase();
    }

    return {
      color: `hsl(${h}, ${s}%, ${l}%)`,
      initials: initials,
    };
  };

  // Fetch goals data
  useEffect(() => {
    const fetchGoalsData = async () => {
      try {
        setLoading(true);
        setAchievedLoading(true);
        setError(null);

        const response = await getFamilyGoals();

        if (response.error) {
          setError(response.message || "Failed to load goals data");
          setLoading(false);
          setAchievedLoading(false);
          return;
        }

        const userId = JSON.parse(sessionStorage.getItem("user")).userId;
        const allGoals = response.data.goalsData || [];
        const activeGoals = allGoals.filter(
          (goal) =>
            !goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );
        const completedGoals = allGoals.filter(
          (goal) =>
            goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );

        setGoals(activeGoals);
        setAchievedGoals(completedGoals);

        setLoading(false);
        setAchievedLoading(false);
      } catch (err) {
        console.error("Error fetching goals data:", err);
        setError("Failed to load goals data. Please try again later.");
        setGoals([]);
        setAchievedGoals([]);
        setLoading(false);
        setAchievedLoading(false);
      }
    };

    fetchGoalsData();
  }, []);

  // Add a new useEffect to fetch family members
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;
        if (!familyId) {
          console.error("Family ID not found");
          return;
        }

        const response = await getFamilyMembers(familyId);
        if (response.error) {
          console.error("Error fetching family members:", response.message);
          return;
        }

        setFamilyMembers(response.data.members || []);
      } catch (err) {
        console.error("Error fetching family members:", err);
      }
    };

    fetchFamilyMembers();
  }, []);

  // Handle dialog open for adding new goal
  const handleAddGoal = () => {
    setDialogMode("add");
    setFormData({
      goalName: "",
      category: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: dayjs().add(1, "month").format("YYYY-MM-DD"),
      timeframe: "1 month",
      description: "",
      priority: "Medium",
      contributors: [
        // Add the current user as a default contributor
        {
          userId: JSON.parse(sessionStorage.getItem("user"))?.userId,
          name: JSON.parse(sessionStorage.getItem("user"))?.username || "You",
        },
      ],
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing goal
  const handleEditGoal = (goal) => {
    setDialogMode("edit");
    setCurrentGoal(goal);
    setFormData({
      goalName: goal.goalName || goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline
        ? goal.deadline.split("T")[0]
        : dayjs(goal.targetDate).format("YYYY-MM-DD"),
      timeframe: goal.timeframe || "1 month",
      description: goal.description || "",
      priority: goal.priority || "Medium",
      contributors: goal.contributors || [],
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

  // Handle contributor selection
  const handleContributorToggle = (member) => {
    setFormData((prev) => {
      const isAlreadyContributor = prev.contributors.some(
        (c) => c.userId === member.userId
      );

      if (isAlreadyContributor) {
        return {
          ...prev,
          contributors: prev.contributors.filter(
            (c) => c.userId !== member.userId
          ),
        };
      } else {
        return {
          ...prev,
          contributors: [...prev.contributors, member],
        };
      }
    });
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

    if (formData.contributors.length === 0) {
      setError("Please select at least one contributor for this goal");
      return;
    }

    const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;
    if (!familyId) {
      setError(
        "Family ID not found. Please make sure you're part of a family."
      );
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      // Prepare data for API according to the required format
      const familyId = JSON.parse(sessionStorage.getItem("family"))?.familyId;
      const targetAmount = Number.parseFloat(formData.targetAmount);
      const currentAmount = Number.parseFloat(formData.currentAmount);

      // Ensure contributors are in the correct format
      const contributors = formData.contributors.map((contributor) => ({
        userId: contributor.userId,
        name: contributor.username,
      }));

      // Create the request payload according to the required format
      const goalData = {
        familyId: familyId,
        goalName: formData.goalName,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        description: formData.description || "",
        priority: formData.priority || "Medium",
        category: formData.category,
        isAchieved: false, // New goals are not achieved yet
        deadline: formData.deadline,
        contributors: contributors,
      };

      let response;

      if (dialogMode === "add") {
        // Add new goal
        response = await addFamilyGoal(goalData);
      } else if (dialogMode === "edit") {
        // Update existing goal - include goalId for updates
        response = await updateFamilyGoal({
          ...goalData,
          userId: JSON.parse(sessionStorage.getItem("user")).userId,
          goalId: currentGoal.goalId,
          isAchieved: currentGoal.isAchieved || false, // Preserve achievement status
        });
      }

      if (response.error) {
        setError(response.message || "Operation failed. Please try again.");
        setSubmitLoading(false);
        return;
      }

      // Refresh goals data
      const goalsResponse = await getFamilyGoals();
      if (!goalsResponse.error) {
        const userId = JSON.parse(sessionStorage.getItem("user")).userId;
        const allGoals = goalsResponse.data.goalsData || [];
        const activeGoals = allGoals.filter(
          (goal) =>
            !goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );
        const completedGoals = allGoals.filter(
          (goal) =>
            goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );

        setGoals(activeGoals);
        setAchievedGoals(completedGoals);
      }

      setSubmitLoading(false);
      handleCloseDialog();
    } catch (err) {
      console.error("Goal operation error:", err);
      setError("An error occurred. Please try again.");
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
      const amount = Number.parseFloat(savingsData.amount);

      // Calculate new current amount
      const newCurrentAmount = currentGoal.currentAmount + amount;

      // Check if new amount exceeds target
      if (newCurrentAmount > currentGoal.targetAmount) {
        setError("The amount you're adding would exceed the target amount");
        setSubmitLoading(false);
        return;
      }

      // Prepare transaction data
      const transactionData = {
        goalId: currentGoal.goalId,
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
        amount,
        description: savingsData.description || "Savings deposit",
      };

      // Add transaction
      const response = await addFamilyGoalTransaction(transactionData);

      if (response.error) {
        setError(
          response.message || "Failed to add savings. Please try again."
        );
        setSubmitLoading(false);
        return;
      }

      // Refresh goals data
      const goalsResponse = await getFamilyGoals();
      if (!goalsResponse.error) {
        const userId = JSON.parse(sessionStorage.getItem("user")).userId;
        const allGoals = goalsResponse.data.goalsData || [];
        const activeGoals = allGoals.filter(
          (goal) =>
            !goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );
        const completedGoals = allGoals.filter(
          (goal) =>
            goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );

        // Check if any goal was achieved
        const achievedGoal = activeGoals.find(
          (goal) =>
            goal.goalId === currentGoal.goalId &&
            goal.currentAmount + amount >= goal.targetAmount
        );

        if (achievedGoal) {
          setCelebrateGoal(achievedGoal);
          setTimeout(() => setCelebrateGoal(null), 5000);
        }

        setGoals(activeGoals);
        setAchievedGoals(completedGoals);
      }

      setSubmitLoading(false);
      handleCloseDialog();
    } catch (err) {
      console.error("Add savings error:", err);
      setError("An error occurred. Please try again.");
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

    setDeleteLoading(true);
    try {
      const response = await deleteFamilyGoal(goalToDelete.goalId);

      if (response.error) {
        setError(
          response.message || "Failed to delete goal. Please try again."
        );
        setDeleteLoading(false);
        handleCloseDeleteDialog();
        return;
      }

      // Refresh goals data
      const goalsResponse = await getFamilyGoals();
      if (!goalsResponse.error) {
        const userId = JSON.parse(sessionStorage.getItem("user")).userId;
        const allGoals = goalsResponse.data.goalsData || [];
        const activeGoals = allGoals.filter(
          (goal) =>
            !goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );
        const completedGoals = allGoals.filter(
          (goal) =>
            goal.isAchieved &&
            goal.contributors.some(
              (contributor) => contributor.userId === userId
            )
        );

        setGoals(activeGoals);
        setAchievedGoals(completedGoals);
      }

      setDeleteLoading(false);
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Delete goal error:", err);
      setError("Failed to delete goal. Please try again.");
      setDeleteLoading(false);
      handleCloseDeleteDialog();
    }
  };

  // Handle opening transaction history
  const handleOpenTransactionHistory = async (goal) => {
    setTransactionHistoryGoal(goal);
    setOpenTransactionHistory(true);
    setTransactionsLoading(true);

    try {
      const response = await getFamilyGoalTransactions(goal.goalId);

      if (response.error) {
        setTransactions([]);
        setError(response.message || "Failed to load transactions");
        setTransactionsLoading(false);
        return;
      }

      setTransactions(response.data.transactionData || []);
      setTransactionsLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
      setTransactionsLoading(false);
    }
  };

  const handleViewTransaction = (transaction) => {
    // Make sure the transaction includes the contributor's name
    const enhancedTransaction = {
      ...transaction,
      contributorName: transaction.username || "Unknown", // Ensure we have a name field
    };
    setSelectedTransaction(enhancedTransaction);
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
    const targetDate = goal.deadline || goal.targetDate || null;

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
            <PeopleAltIcon color="primary" />
            Family Goals
          </Typography>

          {familyRole == "parent" && (
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
          )}
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
                  Your family has achieved the goal: {celebrateGoal.goalName}
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
                  const targetDate = goal.deadline || goal.targetDate || null;

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
                                {goal.goalName}
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
                                Contributors
                              </Typography>
                              <Box
                                sx={{
                                  mt: 0.5,
                                  display: "flex",
                                  alignItems: "left",
                                }}
                              >
                                <AvatarGroup
                                  max={4}
                                  sx={{
                                    "& .MuiAvatar-root": {
                                      width: 24,
                                      height: 24,
                                      fontSize: "0.75rem",
                                      fontWeight: "bold",
                                      color: "white",
                                      border: `1px solid ${theme.palette.divider}`,
                                    },
                                  }}
                                >
                                  {goal.contributors?.map((member) => {
                                    const avatar = getDefaultAvatar(
                                      member?.username || "User"
                                    );

                                    return (
                                      <Tooltip
                                        key={member.userId}
                                        title={member.username}
                                      >
                                        <Avatar
                                          src={member.imageUrl || undefined}
                                          alt={member.username}
                                          sx={{
                                            bgcolor: member.imageUrl
                                              ? "transparent"
                                              : avatar.color,
                                            fontSize: "0.75rem",
                                            color: "white",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {!member.imageUrl && avatar.initials}
                                        </Avatar>
                                      </Tooltip>
                                    );
                                  })}
                                </AvatarGroup>
                              </Box>
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
                              {familyRole != "child" && (
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditGoal(goal)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {familyRole != "child" && (
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(goal)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
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
                  No Active Family Goals
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  You don't have any active family savings goals. Click "Add
                  Goal" to create your first goal.
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
                              {goal.goalName}
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
                              {goal.targetDate
                                ? formatDate(goal.targetDate)
                                : "No deadline set"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Contributors
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <AvatarGroup
                                max={4}
                                sx={{
                                  "& .MuiAvatar-root": {
                                    width: 24,
                                    height: 24,
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                    color: "white",
                                    border: `1px solid ${theme.palette.divider}`,
                                  },
                                }}
                              >
                                {goal.contributors?.map((member) => {
                                  const avatar = getDefaultAvatar(
                                    member?.username || "User"
                                  );

                                  return (
                                    <Tooltip
                                      key={member.userId}
                                      title={member.username}
                                    >
                                      <Avatar
                                        src={member.imageUrl || undefined}
                                        alt={member.username}
                                        sx={{
                                          bgcolor: member.imageUrl
                                            ? "transparent"
                                            : avatar.color,
                                          fontSize: "0.75rem",
                                          color: "white",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {!member.imageUrl && avatar.initials}
                                      </Avatar>
                                    </Tooltip>
                                  );
                                })}
                              </AvatarGroup>
                            </Box>
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
                          goal.targetDate &&
                          dayjs(goal.achivedDate).isBefore(
                            dayjs(goal.targetDate)
                          ) ? (
                            <Chip
                              label={`Achieved ${dayjs(goal.targetDate).diff(
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
                  No Achieved Family Goals Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your family hasn't achieved any savings goals yet. Complete
                  your active goals to see them here.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </motion.div>

      {/* Add/Edit Goal Dialog */}
      <Dialog
        open={openDialog && dialogMode !== "addSavings"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "add" ? "Add New Family Goal" : "Edit Family Goal"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                name="goalName"
                value={formData.goalName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {goalCategories.map((category) => (
                  <MenuItem key={category.name} value={category.name}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {category.icon}
                      <span>{category.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                {priorityOptions.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Timeframe"
                name="timeframe"
                value={formData.timeframe}
                onChange={handleInputChange}
              >
                {goalTimeframes.map((timeframe) => (
                  <MenuItem key={timeframe} value={timeframe}>
                    {timeframe}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Amount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">MYR</InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Amount"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">MYR</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Date"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: dayjs().format("YYYY-MM-DD"),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Select Contributors
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Choose family members who will contribute to this goal. Click on
                a member to select/deselect.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                {familyMembers.length > 0 ? (
                  familyMembers.map((member) => {
                    const isSelected = formData.contributors.some(
                      (c) => c.userId === member.userId
                    );

                    const avatarData = getDefaultAvatar(member.username);

                    return (
                      <Chip
                        key={member.userId}
                        avatar={
                          member.imageUrl ? (
                            <Avatar
                              src={member.imageUrl}
                              alt={member.username}
                            />
                          ) : (
                            <Avatar sx={{ bgcolor: avatarData.color }}>
                              {avatarData.initials}
                            </Avatar>
                          )
                        }
                        label={member.username}
                        onClick={() => handleContributorToggle(member)}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        sx={{
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 1,
                          },
                        }}
                      />
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No family members available. Please add members to your
                    family first.
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Add details about your family goal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <CircularProgress size={24} />
            ) : dialogMode === "add" ? (
              "Add"
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Savings Dialog */}
      <Dialog
        open={openDialog && dialogMode === "addSavings"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Savings to Family Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Adding savings to: {currentGoal?.goalName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Current progress:{" "}
                    {currentGoal
                      ? formatCurrency(currentGoal.currentAmount)
                      : ""}{" "}
                    of{" "}
                    {currentGoal
                      ? formatCurrency(currentGoal.targetAmount)
                      : ""}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {currentGoal
                      ? calculatePercentage(
                          currentGoal.currentAmount,
                          currentGoal.targetAmount
                        )
                      : 0}
                    %
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    currentGoal
                      ? calculatePercentage(
                          currentGoal.currentAmount,
                          currentGoal.targetAmount
                        )
                      : 0
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount to Add"
                name="amount"
                value={savingsData.amount}
                onChange={handleSavingsInputChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>MYR</Typography>,
                }}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={savingsData.description}
                onChange={handleSavingsInputChange}
                placeholder="e.g., Monthly savings, Bonus deposit"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Remaining to goal:{" "}
                {currentGoal
                  ? formatCurrency(
                      currentGoal.targetAmount - currentGoal.currentAmount
                    )
                  : ""}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitSavings}
            variant="contained"
            disabled={submitLoading}
          >
            {submitLoading ? <CircularProgress size={24} /> : "Add Savings"}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Delete Goal Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Goal</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this goal? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteGoal}
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Custom Transaction Details Dialog for Family Goals */}
      <Dialog
        open={openTransactionDetails && selectedTransaction}
        onClose={handleCloseTransactionDetails}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {formatCurrency(selectedTransaction.amount)}
                </Typography>
              </Paper>

              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                  {selectedTransaction.description || "No description provided"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Contributed By
                </Typography>
                <Typography variant="body1">
                  {selectedTransaction.username || "Unknown"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(
                    selectedTransaction.transactionDate ||
                      selectedTransaction.createdOn
                  )}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {selectedTransaction.transactionId}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDetails} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FamilyGoals;
