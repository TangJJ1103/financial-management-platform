"use client";
import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";

/**
 * A reusable time range filter component for charts
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected time range
 * @param {function} props.onChange - Function to call when time range changes
 * @param {Array} props.options - Custom filter options (optional)
 * @param {Object} props.sx - Additional styles
 */
const TimeRangeFilter = ({
  value = "this-month",
  onChange,
  options = [
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "this-year", label: "This Year" },
    { value: "last-year", label: "Last Year" },
  ],
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1, ...sx }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="time range"
        size={isMobile ? "small" : "medium"}
        sx={{
          ".MuiToggleButtonGroup-grouped": {
            border: 1,
            borderColor: "divider",
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton
            key={option.value}
            value={option.value}
            sx={{
              textTransform: "none",
              px: { xs: 1, sm: 2 },
              py: 0.5,
            }}
          >
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default TimeRangeFilter;
