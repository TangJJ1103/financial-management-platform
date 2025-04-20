"use client";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import CalculateIcon from "@mui/icons-material/Calculate";
import TimelineIcon from "@mui/icons-material/Timeline";
import SavingsIcon from "@mui/icons-material/Savings";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const tools = [
  {
    id: "currencyConverter",
    title: "Currency Converter",
    description:
      "Convert between different currencies with real-time exchange rates",
    icon: <CurrencyExchangeIcon fontSize="large" color="primary" />,
    available: true,
  },
  {
    id: "loanCalculator",
    title: "Loan Calculator",
    description:
      "Calculate loan payments, interest, and amortization schedules",
    icon: <CalculateIcon fontSize="large" color="primary" />,
    available: false,
  },
  {
    id: "investmentCalculator",
    title: "Investment Calculator",
    description: "Project investment growth and analyze returns over time",
    icon: <TimelineIcon fontSize="large" color="primary" />,
    available: false,
  },
  {
    id: "savingsCalculator",
    title: "Savings Goal Calculator",
    description: "Plan and track your progress toward savings goals",
    icon: <SavingsIcon fontSize="large" color="primary" />,
    available: false,
  },
];

const ToolDashboard = () => {
  const navigate = useNavigate();

  const handleToolSelect = (toolId) => {
    if (toolId === "currencyConverter") {
      navigate("/currency-converter");
    } else {
      // For future tools
      console.log(`Selected tool: ${toolId}`);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Financial Tools
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Use these tools to help with your financial planning and decision
            making
          </Typography>

          <Grid container spacing={3}>
            {tools.map((tool) => (
              <Grid item xs={12} sm={6} md={4} key={tool.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    opacity: tool.available ? 1 : 0.7,
                  }}
                >
                  <CardActionArea
                    sx={{ height: "100%", p: 2 }}
                    onClick={() => tool.available && handleToolSelect(tool.id)}
                    disabled={!tool.available}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Box sx={{ mb: 2 }}>{tool.icon}</Box>
                      <Typography variant="h6" gutterBottom>
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                      {!tool.available && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 2,
                            color: "text.disabled",
                            fontStyle: "italic",
                          }}
                        >
                          Coming soon
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ToolDashboard;
