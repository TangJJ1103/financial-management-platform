"use client";
import { useTheme, useMediaQuery } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts";

/**
 * A reusable pie chart component for budget visualization
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {Array} props.data - Data for the pie chart
 * @param {number} props.height - Chart height (default: 250)
 * @param {Object} props.margin - Chart margins
 * @param {boolean} props.showLegend - Whether to show the legend (default: true)
 * @param {Object} props.cardProps - Additional props for the Card component
 */
const BudgetPieChart = ({
  title,
  subtitle,
  data,
  height = 250,
  margin = { top: 10, bottom: 10, left: 10, right: 10 },
  showLegend = false,
  cardProps = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Generate color palette based on theme
  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
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

        {data && data.length > 0 ? (
          <Box sx={{ height: height, position: "relative" }}>
            <PieChart
              series={[
                {
                  data,
                  highlightScope: { faded: "global", highlighted: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                  arcLabel: (item) =>
                    `${Math.round(
                      (item.value / data.reduce((sum, d) => sum + d.value, 0)) *
                        100
                    )}%`,
                  arcLabelMinAngle: 20,
                  cornerRadius: 4,
                  paddingAngle: 2,
                  innerRadius: isMobile ? 20 : 30,
                },
              ]}
              colors={colorPalette}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: theme.palette.text.primary,
                  fontWeight: "bold",
                  fontSize: isMobile ? 10 : 12,
                },
              }}
              height={height}
              margin={margin}
              slotProps={{
                legend: {
                  hidden: !showLegend,
                  position: {
                    vertical: isTablet ? "bottom" : "middle",
                    horizontal: isTablet ? "middle" : "left",
                  },
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  markGap: 5,
                  itemGap: 10,
                  labelStyle: {
                    fontSize: isTablet ? 10 : 12,
                    color: theme.palette.text.secondary,
                  },
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

export default BudgetPieChart;
