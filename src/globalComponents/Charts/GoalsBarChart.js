"use client";
import { useTheme, useMediaQuery } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts";
import { useMemo } from "react";

/**
 * A reusable bar chart component for goals visualization
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {number} props.totalValue - Total value to display (optional)
 * @param {Object} props.trend - Trend data (optional)
 * @param {number} props.trend.value - Trend percentage value
 * @param {boolean} props.trend.isPositive - Whether trend is positive
 * @param {Array} props.xAxisData - X-axis data points
 * @param {Array} props.series - Series data for the chart
 * @param {number} props.height - Chart height (default: 250)
 * @param {Object} props.margin - Chart margins
 * @param {boolean} props.showLegend - Whether to show the legend (default: true)
 * @param {Object} props.cardProps - Additional props for the Card component
 */
const GoalsBarChart = ({
  title,
  subtitle,
  totalValue,
  trend,
  xAxisData,
  series,
  height = { xs: 250, sm: 280, md: 300 },
  margin = {
    left: 50,
    right: 20,
    top: 20,
    bottom: 50,
  },
  showLegend = true,
  cardProps = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const calculatedMargin = useMemo(() => {
    return {
      ...margin,
      top: isTablet ? 10 : 20,
      bottom: isTablet ? 80 : 50,
    };
  }, [isTablet, margin]);

  // Generate color palette based on theme
  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  return (
    <Card variant="outlined" sx={{ width: "100%", ...cardProps.sx }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
        >
          {title}
        </Typography>

        {totalValue && (
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Typography variant="h5" component="p" fontWeight="medium">
              {totalValue}
            </Typography>
            {trend && (
              <Chip
                size="small"
                color={trend.isPositive ? "success" : "error"}
                label={`${trend.isPositive ? "+" : "-"}${Math.abs(
                  trend.value
                )}%`}
              />
            )}
          </Stack>
        )}

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: isMobile ? "0.7rem" : "0.75rem",
            display: "block",
            mb: 1,
          }}
        >
          {subtitle}
        </Typography>

        {xAxisData && series && xAxisData.length > 0 ? (
          <Box
            sx={{
              height:
                typeof height === "object"
                  ? height[isTablet ? "xs" : "md"]
                  : height,
              position: "relative",
              pt: isTablet ? 0 : 2,
              pb: isTablet ? 2 : 0,
            }}
          >
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: xAxisData,
                  tickLabelStyle: {
                    fontSize: isMobile ? 10 : 12,
                    color: theme.palette.text.secondary,
                    angle: 45,
                    textAnchor: "start",
                  },
                },
              ]}
              series={series.map((s, index) => ({
                ...s,
                color: s.color || colorPalette[index % colorPalette.length],
              }))}
              colors={colorPalette}
              height={
                typeof height === "object"
                  ? height[isTablet ? "xs" : "md"]
                  : height
              }
              margin={calculatedMargin}
              grid={{ horizontal: true, vertical: false }}
              slotProps={{
                legend: {
                  hidden: !showLegend,
                  position: {
                    vertical: isTablet ? "bottom" : "top",
                    horizontal: "right",
                  },
                  direction: isTablet ? "row" : "column",
                  padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: isTablet ? 10 : 0,
                  },
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  markGap: 5,
                  itemGap: isTablet ? 15 : 10,
                  labelStyle: {
                    fontSize: isTablet ? 10 : 12,
                    color: theme.palette.text.secondary,
                  },
                  margin: { top: 5, bottom: 5, left: 5, right: 5 },
                },
              }}
            />
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
              No data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsBarChart;
