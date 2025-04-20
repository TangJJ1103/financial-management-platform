import {
  Restaurant,
  Home,
  DirectionsCar,
  Theaters,
  LocalHospital,
  School,
  Lightbulb,
  Flight,
  ShoppingCart,
  ChildCare,
  HomeRepairService,
  ShoppingBag,
  Savings,
  TrendingUp,
  Celebration,
  Description,
} from "@mui/icons-material";

/**
 * Standardized finance categories for use across the application
 * Each category includes a name, icon, and color for consistent UI
 */
export const FINANCE_CATEGORIES = [
  {
    id: "food_dining",
    name: "Food & Dining",
    icon: <Restaurant />,
    color: "success.main",
  },
  { id: "housing", name: "Housing", icon: <Home />, color: "primary.main" },
  {
    id: "transportation",
    name: "Transportation",
    icon: <DirectionsCar />,
    color: "info.main",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: <Theaters />,
    color: "secondary.main",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: <LocalHospital />,
    color: "error.main",
  },
  {
    id: "education",
    name: "Education",
    icon: <School />,
    color: "warning.main",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: <Lightbulb />,
    color: "info.main",
  },
  { id: "travel", name: "Travel", icon: <Flight />, color: "secondary.main" },
  {
    id: "groceries",
    name: "Groceries",
    icon: <ShoppingCart />,
    color: "success.main",
  },
  {
    id: "childcare",
    name: "Childcare",
    icon: <ChildCare />,
    color: "warning.main",
  },
  {
    id: "home_improvement",
    name: "Home Improvement",
    icon: <HomeRepairService />,
    color: "primary.main",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: <ShoppingBag />,
    color: "secondary.main",
  },
  { id: "savings", name: "Savings", icon: <Savings />, color: "primary.main" },
  {
    id: "investments",
    name: "Investments",
    icon: <TrendingUp />,
    color: "success.main",
  },
  {
    id: "gifts",
    name: "Gifts & Celebrations",
    icon: <Celebration />,
    color: "secondary.main",
  },
  { id: "other", name: "Other", icon: <Description />, color: "default" },
];

/**
 * Get category names only
 * @returns {string[]} Array of category names
 */
export const getCategoryNames = () =>
  FINANCE_CATEGORIES.map((category) => category.name);

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Object|undefined} Category object or undefined if not found
 */
export const getCategoryById = (id) =>
  FINANCE_CATEGORIES.find((category) => category.id === id);

/**
 * Get category by name
 * @param {string} name - Category name
 * @returns {Object|undefined} Category object or undefined if not found
 */
export const getCategoryByName = (name) =>
  FINANCE_CATEGORIES.find((category) => category.name === name);

/**
 * Get icon for category by name
 * @param {string} name - Category name
 * @returns {React.ReactNode} Icon component or default icon if not found
 */
export const getCategoryIcon = (name) => {
  const category = getCategoryByName(name);
  return category ? category.icon : <Description />;
};

/**
 * Get color for category by name
 * @param {string} name - Category name
 * @returns {string} Color string or default color if not found
 */
export const getCategoryColor = (name) => {
  const category = getCategoryByName(name);
  if (!category) return "default";

  // Extract just the base color name (e.g., "primary" from "primary.main")
  const colorString = category.color || "default";
  return colorString.split(".")[0]; // Return just "primary" instead of "primary.main"
};

export default FINANCE_CATEGORIES;
