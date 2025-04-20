"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  useTheme,
} from "@mui/material";

/**
 * A modern styled card component with optional title, subtitle, and icon
 *
 * @param {Object} props - Component props
 * @param {string} [props.title] - Card title
 * @param {string} [props.subtitle] - Card subtitle
 * @param {React.ReactNode} [props.icon] - Icon to display next to title
 * @param {React.ReactNode} [props.action] - Action component to display in header
 * @param {boolean} [props.gradient=false] - Whether to use gradient background
 * @param {React.ReactNode} props.children - Card content
 * @param {string|number} [props.height='auto'] - Card height
 */
const ModernCard = ({
  title,
  subtitle,
  icon,
  action,
  gradient = false,
  children,
  height = "auto",
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        border: "none",
        ...(gradient && {
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #383f55 0%, #2d3546 100%)"
              : "linear-gradient(135deg, #f6f9ff 0%, #edf1f9 100%)",
        }),
      }}
    >
      {(title || icon || action) && (
        <CardHeader
          title={
            title && (
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {icon && (
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    {icon}
                  </Box>
                )}
                {title}
              </Typography>
            )
          }
          subheader={
            subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )
          }
          action={action}
          sx={{
            py: { xs: 1, sm: 1.5 },
            px: { xs: 1.5, sm: 2.5 },
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        />
      )}
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, flexGrow: 1 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernCard;
