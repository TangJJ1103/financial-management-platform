"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getCategoryNames,
  getCategoryColor,
} from "../../constants/financeCategories";
import {
  getFamilyExpenses,
  deleteFamilyExpense,
} from "../../dataHooks/expensesHooks";

// Add "All Categories" to the standardized categories
const categories = ["All Categories", ...getCategoryNames()];

const ViewFamilyExpenses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const familyRole = sessionStorage.getItem("familyRole");

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);

  // Sorting states
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("expensesDate");

  // Summary statistics
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [averageExpense, setAverageExpense] = useState(0);
  const [highestExpense, setHighestExpense] = useState(0);
  const [mostCommonCategory, setMostCommonCategory] = useState("");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await getFamilyExpenses();

        if (response.error) {
          setError(
            response.message ||
              "Failed to load expenses. Please try again later."
          );
          setExpenses([]);
        } else {
          setExpenses(response.data.expensesData || []);
          setFilteredExpenses(response.data.expensesData || []);
          calculateStatistics(response.data.expensesData || []);
        }
      } catch (err) {
        console.error("Error fetching family expenses:", err);
        setError("Failed to load expenses. Please try again later.");
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const calculateStatistics = (expensesData) => {
    if (!expensesData.length) return;

    // Total expenses
    const total = expensesData.reduce(
      (sum, expense) => sum + expense.amountConverted,
      0
    );
    setTotalExpenses(total);

    // Average expense
    setAverageExpense(total / expensesData.length);

    // Highest expense
    const highest = Math.max(
      ...expensesData.map((expense) => expense.amountConverted)
    );
    setHighestExpense(highest);

    // Most common category
    const categoryCount = expensesData.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + 1;
      return acc;
    }, {});

    const mostCommon = Object.entries(categoryCount).sort(
      (a, b) => b[1] - a[1]
    )[0];
    setMostCommonCategory(mostCommon ? mostCommon[0] : "None");
  };

  useEffect(() => {
    // Apply filters
    let result = expenses;

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.description?.toLowerCase().includes(term) ||
          expense.category?.toLowerCase().includes(term) ||
          expense.paymentMethod?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter && categoryFilter !== "All Categories") {
      result = result.filter((expense) => expense.category === categoryFilter);
    }

    // Date filter
    const now = dayjs();
    if (dateFilter === "today") {
      result = result.filter(
        (expense) =>
          dayjs(expense.expensesDate).format("YYYY-MM-DD") ===
          now.format("YYYY-MM-DD")
      );
    } else if (dateFilter === "week") {
      const weekAgo = now.subtract(7, "day");
      result = result.filter((expense) =>
        dayjs(expense.expensesDate).isAfter(weekAgo)
      );
    } else if (dateFilter === "month") {
      const monthAgo = now.subtract(30, "day");
      result = result.filter((expense) =>
        dayjs(expense.expensesDate).isAfter(monthAgo)
      );
    }

    // Member filter
    if (memberFilter !== "all") {
      result = result.filter((expense) =>
        expense.splitBetween.some((member) => member.userId === memberFilter)
      );
    }

    // Apply sorting
    result = stableSort(result, getComparator(order, orderBy));

    setFilteredExpenses(result);
    calculateStatistics(result);
  }, [
    expenses,
    searchTerm,
    categoryFilter,
    dateFilter,
    memberFilter,
    order,
    orderBy,
  ]);

  // Sorting functions
  function descendingComparator(a, b, orderBy) {
    // Special handling for dates
    if (orderBy === "expensesDate") {
      return new Date(b[orderBy]) - new Date(a[orderBy]);
    }

    // Special handling for nested properties
    if (!a[orderBy] && !b[orderBy]) return 0;
    if (!a[orderBy]) return 1;
    if (!b[orderBy]) return -1;

    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM D, YYYY h:mm A");
  };

  // Add this new function to generate default avatars
  const getDefaultAvatar = (name) => {
    if (!name) return "/placeholder.svg?height=40&width=40";

    // Generate a consistent color based on the name with better contrast
    const stringToColor = (string) => {
      let hash = 0;
      for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Generate more vibrant colors for better visibility in both themes
      const hue = Math.abs(hash) % 360;
      const saturation = 65 + (Math.abs(hash) % 25); // 65-90%
      const lightness = 55 + (Math.abs(hash) % 10); // 55-65%

      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // Get initials from name
    const getInitials = (name) => {
      const names = name.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : name.substring(0, 2).toUpperCase();
    };

    return {
      initials: getInitials(name),
      color: stringToColor(name),
    };
  };

  // Export to Excel function
  const exportToExcel = () => {
    setExportLoading(true);

    try {
      // Prepare data for export
      const exportData = filteredExpenses.map((expense) => ({
        Description: expense.description || "No description",
        Category: expense.category,
        "Amount (MYR)": expense.amountConverted,
        "Original Amount": `${expense.amountEntry} ${expense.currencyType}`,
        "Payment Method": expense.paymentMethod,
        "Split Between": expense.splitBetween
          .map((member) => member.username)
          .join(", "),
        Date: formatDate(expense.expensesDate),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const wscols = [
        { wch: 30 }, // Description
        { wch: 15 }, // Category
        { wch: 15 }, // Amount
        { wch: 20 }, // Original Amount
        { wch: 15 }, // Payment Method
        { wch: 15 }, // Paid By
        { wch: 30 }, // Split Between
        { wch: 20 }, // Date
      ];
      ws["!cols"] = wscols;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Family Expenses");

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Save file
      saveAs(data, `Family_Expenses_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleOpenDeleteDialog = (expense) => {
    setExpenseToDelete(expense);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setExpenseToDelete(null);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await deleteFamilyExpense(expenseToDelete.expensesId);

      if (response.error) {
        setError(
          response.message || "Failed to delete expense. Please try again."
        );
      } else {
        // Remove the deleted expense from the list
        setExpenses(
          expenses.filter(
            (expense) => expense.expensesId !== expenseToDelete.expensesId
          )
        );
        setFilteredExpenses(
          filteredExpenses.filter(
            (expense) => expense.expensesId !== expenseToDelete.expensesId
          )
        );

        // Recalculate statistics
        calculateStatistics(
          expenses.filter(
            (expense) => expense.expensesId !== expenseToDelete.expensesId
          )
        );
      }
    } catch (err) {
      console.error("Delete expense error:", err);
      setError("Failed to delete expense. Please try again.");
    } finally {
      setDeleteLoading(false);
      handleCloseDeleteDialog();
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
            <GroupIcon color="primary" />
            Family Expenses
          </Typography>

          <Button
            variant="outlined"
            startIcon={
              exportLoading ? (
                <CircularProgress size={20} />
              ) : (
                <FileDownloadIcon />
              )
            }
            onClick={exportToExcel}
            disabled={exportLoading || filteredExpenses.length === 0}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              py: 1,
            }}
          >
            Export to Excel
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h5" component="div">
                  {formatCurrency(totalExpenses)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Average Expense
                </Typography>
                <Typography variant="h5" component="div">
                  {formatCurrency(averageExpense)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Highest Expense
                </Typography>
                <Typography variant="h5" component="div">
                  {formatCurrency(highestExpense)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Most Common Category
                </Typography>
                <Typography variant="h5" component="div">
                  {mostCommonCategory || "None"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 2 }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel id="date-filter-label">Time Period</InputLabel>
                <Select
                  labelId="date-filter-label"
                  value={dateFilter}
                  label="Time Period"
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel id="member-filter-label">Family Member</InputLabel>
                <Select
                  labelId="member-filter-label"
                  value={memberFilter}
                  label="Family Member"
                  onChange={(e) => setMemberFilter(e.target.value)}
                >
                  <MenuItem value="all">All Members</MenuItem>
                  {expenses.length > 0 &&
                    [
                      ...new Map(
                        expenses
                          .flatMap((expense) => expense.splitBetween || [])
                          .map((member) => [member.userId, member])
                      ).values(),
                    ].map((member) => {
                      const avatar = getDefaultAvatar(member.username);
                      const hasImage = !!member.imageUrl;

                      return (
                        <MenuItem key={member.userId} value={member.userId}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              src={hasImage ? member.imageUrl : undefined}
                              alt={member.username}
                              sx={{
                                bgcolor: hasImage ? undefined : avatar.color,
                                width: 24,
                                height: 24,
                                fontSize: "0.75rem",
                                border: (theme) =>
                                  `1px solid ${theme.palette.divider}`,
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              {!hasImage && avatar.initials}
                            </Avatar>
                            {member.username}
                          </Box>
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Expenses Table */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "description"}
                      direction={orderBy === "description" ? order : "asc"}
                      onClick={() => handleRequestSort("description")}
                    >
                      Description
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "category"}
                      direction={orderBy === "category" ? order : "asc"}
                      onClick={() => handleRequestSort("category")}
                    >
                      Category
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "amountConverted"}
                      direction={orderBy === "amountConverted" ? order : "asc"}
                      onClick={() => handleRequestSort("amountConverted")}
                    >
                      Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Split Between</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "expensesDate"}
                      direction={orderBy === "expensesDate" ? order : "asc"}
                      onClick={() => handleRequestSort("expensesDate")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  {familyRole !== "child" && (
                    <TableCell align="center">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((expense) => (
                      <TableRow key={expense.expensesId} hover>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {expense.description || "No description"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={expense.category}
                            size="small"
                            color={getCategoryColor(expense.category)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(expense.amountConverted)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", justifyContent: "left" }}>
                            <AvatarGroup
                              max={4}
                              sx={{
                                "& .MuiAvatar-root": { width: 24, height: 24 },
                                justifyContent: "center",
                              }}
                            >
                              {expense.splitBetween.map((member) => {
                                const avatar = getDefaultAvatar(
                                  member.username
                                );
                                const hasImage = !!member.imageUrl;

                                return (
                                  <Tooltip
                                    key={member.userId}
                                    title={member.username}
                                  >
                                    <Avatar
                                      src={
                                        hasImage ? member.imageUrl : undefined
                                      }
                                      alt={member.username}
                                      sx={{
                                        bgcolor: hasImage
                                          ? undefined
                                          : avatar.color,
                                        fontSize: "0.75rem",
                                        border: (theme) =>
                                          `1px solid ${theme.palette.divider}`,
                                        color: "white",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {!hasImage && avatar.initials}
                                    </Avatar>
                                  </Tooltip>
                                );
                              })}
                            </AvatarGroup>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {formatDate(expense.expensesDate)}
                          </Typography>
                        </TableCell>
                        {familyRole !== "child" && (
                          <TableCell align="center">
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(expense)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 6 : 7}
                      align="center"
                      sx={{ py: 3 }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        No expenses found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Delete Expense</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteExpense}
              color="error"
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default ViewFamilyExpenses;
