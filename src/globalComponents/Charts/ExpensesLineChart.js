"use client";
import { useState, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import Box from "@mui/material/Box";
import TimeRangeFilter from "./TimeRangeFilter";
import dayjs from "dayjs";

/**
 * Creates a gradient for the area under the line chart
 * @param {string} color - The color for the gradient
 * @param {string} id - Unique ID for the gradient
 */
function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

/**
 * A reusable expenses line chart component
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {Array} props.xAxisData - X-axis data points (optional)
 * @param {Array} props.series - Series data for the chart (optional)
 * @param {Array} props.rawData - Raw expenses data from API (optional)
 * @param {function} props.onFilterChange - Function to call when filter changes
 * @param {number} props.height - Chart height (default: 250)
 * @param {Object} props.margin - Chart margins
 * @param {boolean} props.showLegend - Whether to show the legend (default: false)
 * @param {boolean} props.showFilter - Whether to show the time range filter (default: true)
 * @param {Object} props.cardProps - Additional props for the Card component
 */
const ExpensesLineChart = ({
  title,
  subtitle,
  xAxisData: propXAxisData,
  series: propSeries,
  rawData,
  onFilterChange,
  height = 250,
  margin = { left: 50, right: 20, top: 20, bottom: 50 },
  showLegend = false,
  showFilter = true,
  cardProps = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [timeRange, setTimeRange] = useState("this-month");
  const [xAxisData, setXAxisData] = useState(propXAxisData || []);
  const [series, setSeries] = useState(propSeries || []);

  // Generate color palette based on theme
  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  // Process raw data if provided
  useEffect(() => {
    if (rawData && Array.isArray(rawData)) {
      processRawData(rawData, timeRange);
    }
  }, [rawData, timeRange]);

  // Process raw data into chart format based on time range
  const processRawData = (data, range) => {
    if (!data || data.length === 0) {
      setXAxisData([]);
      setSeries([]);
      return;
    }

    // Sort data by date
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.expensesDate).getTime() - new Date(b.expensesDate).getTime()
    );

    const groupedData = {};
    const now = dayjs();

    if (range === "this-week") {
      // Current week (last 7 days)
      for (let i = 6; i >= 0; i--) {
        const day = now.subtract(i, "day");
        const dayLabel = day.format("MMM D");

        groupedData[dayLabel] = 0;

        // Sum expenses for this day
        sortedData.forEach((expense) => {
          const expenseDate = dayjs(expense.expensesDate);
          if (expenseDate.format("YYYY-MM-DD") === day.format("YYYY-MM-DD")) {
            groupedData[dayLabel] += expense.amountConverted;
          }
        });
      }
    } else if (range === "this-month") {
      // Current month (days in current month)
      const daysInMonth = now.daysInMonth();
      const monthStart = now.startOf("month");

      for (let i = 0; i < daysInMonth; i++) {
        const day = monthStart.add(i, "day");
        const dayLabel = day.format("MMM D");

        groupedData[dayLabel] = 0;

        // Sum expenses for this day
        sortedData.forEach((expense) => {
          const expenseDate = dayjs(expense.expensesDate);
          if (expenseDate.format("YYYY-MM-DD") === day.format("YYYY-MM-DD")) {
            groupedData[dayLabel] += expense.amountConverted;
          }
        });
      }
    } else if (range === "this-year") {
      // Current year (by months)
      const yearStart = now.startOf("year");

      for (let i = 0; i < 12; i++) {
        const month = yearStart.add(i, "month");
        const monthLabel = month.format("MMM YYYY");

        groupedData[monthLabel] = 0;

        // Sum expenses for this month
        sortedData.forEach((expense) => {
          const expenseDate = dayjs(expense.expensesDate);
          if (expenseDate.format("YYYY-MM") === month.format("YYYY-MM")) {
            groupedData[monthLabel] += expense.amountConverted;
          }
        });
      }
    } else if (range === "last-year") {
      // Last year (by months)
      const lastYearStart = now.subtract(1, "year").startOf("year");

      for (let i = 0; i < 12; i++) {
        const month = lastYearStart.add(i, "month");
        const monthLabel = month.format("MMM YYYY");

        groupedData[monthLabel] = 0;

        // Sum expenses for this month in last year
        sortedData.forEach((expense) => {
          const expenseDate = dayjs(expense.expensesDate);
          if (expenseDate.format("YYYY-MM") === month.format("YYYY-MM")) {
            groupedData[monthLabel] += expense.amountConverted;
          }
        });
      }
    }

    // Convert to chart format
    const labels = Object.keys(groupedData);
    const values = Object.values(groupedData);

    setXAxisData(labels);

    setSeries([
      {
        id: "expenses",
        data: values,
        showMark: false,
        curve: "linear",
        area: true,
        color: theme.palette.primary.main,
        valueFormatter: (value) => formatCurrency(value),
      },
    ]);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate CSS for gradient fills
  const gradientCss = {};
  series.forEach((s) => {
    gradientCss[`& .MuiAreaElement-series-${s.id}`] = {
      fill: `url('#${s.id}')`,
    };
  });

  const handleFilterChange = (value) => {
    setTimeRange(value);

    // Process raw data with new time range if available
    if (rawData && Array.isArray(rawData)) {
      processRawData(rawData, value);
    }

    // Call parent callback if provided
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  return (
    <Card variant="outlined" sx={{ width: "100%", ...cardProps.sx }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box>
            <Typography
              component="h2"
              variant="subtitle2"
              gutterBottom
              sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
            >
              {title}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: isMobile ? "0.7rem" : "0.75rem",
                display: "block",
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          {showFilter && (
            <TimeRangeFilter
              value={timeRange}
              onChange={handleFilterChange}
              sx={{ mt: -1 }}
            />
          )}
        </Box>

        {xAxisData && xAxisData.length > 0 && series && series.length > 0 ? (
          <Box sx={{ height: height, position: "relative" }}>
            <LineChart
              colors={colorPalette}
              xAxis={[
                {
                  scaleType: "point",
                  data: xAxisData,
                  tickLabelStyle: {
                    fontSize: isMobile ? 10 : 12,
                    color: theme.palette.text.secondary,
                    angle: 45,
                    textAnchor: "start",
                  },
                  tickInterval: (index) =>
                    isMobile ? index % 4 === 0 : index % 2 === 0,
                },
              ]}
              series={series}
              height={height}
              margin={margin}
              grid={{ horizontal: true }}
              sx={gradientCss}
              slotProps={{
                legend: {
                  hidden: !showLegend,
                  position: { vertical: "top", horizontal: "right" },
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  markGap: 5,
                  itemGap: 10,
                  labelStyle: {
                    fontSize: isTablet ? 10 : 12,
                    color: theme.palette.text.secondary,
                  },
                },
                tooltip: {
                  className: "custom-tooltip",
                  componentsProps: {
                    tooltip: {
                      sx: {
                        "& .MuiMarkElement": {
                          display: "none",
                        },
                        "& .MuiTooltip-series": {
                          display: "none",
                        },
                      },
                    },
                  },
                  slotProps: {
                    itemContent: {
                      formatter: (params) => {
                        return `${
                          xAxisData[params.dataIndex]
                        }: ${formatCurrency(params.value)}`;
                      },
                    },
                  },
                },
              }}
            >
              {series.map((s) => (
                <AreaGradient
                  key={s.id}
                  color={
                    s.color ||
                    colorPalette[series.indexOf(s) % colorPalette.length]
                  }
                  id={s.id}
                />
              ))}
            </LineChart>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: height,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No data available for this time period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesLineChart;
