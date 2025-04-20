"use client";

import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";

/**
 * A statistics card component with value, trend indicator and icon
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Stat title
 * @param {string|number} props.value - Stat value
 * @param {React.ReactNode} [props.icon] - Icon to display
 * @param {Object} [props.trend] - Trend data
 * @param {number} props.trend.value - Trend percentage value
 * @param {boolean} props.trend.isPositive - Whether trend is positive
 * @param {string} [props.color='primary'] - Card accent color
 * @param {Object} [props.sx] - Additional styles
 */
const StatCard = ({ title, value, icon, trend, color = "primary", sx }) => {
  const theme = useTheme();

  const getColorValue = () => {
    switch (color) {
      case "primary":
        return theme.palette.primary.main;
      case "secondary":
        return theme.palette.secondary.main;
      case "success":
        return theme.palette.success.main;
      case "error":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "info":
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const colorValue = getColorValue();

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: `0 10px 20px rgba(0,0,0,0.08)`,
        },
        ...sx,
      }}
    >
      <CardContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                my: 1,
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Typography
                variant="caption"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontWeight: 500,
                  bgcolor:
                    color === "error"
                      ? "error.lighter"
                      : color === "warning"
                      ? "warning.lighter"
                      : "success.lighter",
                  color:
                    color === "error"
                      ? "error.main"
                      : color === "warning"
                      ? "warning.main"
                      : "success.main",
                  p: "3px 8px",
                  borderRadius: 1,
                }}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                backgroundColor: `${colorValue}15`,
                color: colorValue,
                alignSelf: { xs: "flex-start", sm: "flex-start" },
                ml: { xs: 0, sm: "auto" },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: colorValue,
        }}
      />
    </Card>
  );
};

export default StatCard;
