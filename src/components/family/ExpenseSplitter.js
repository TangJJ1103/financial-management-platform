"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Slider,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  PercentOutlined,
  AttachMoneyOutlined,
  EqualizeOutlined,
  RestartAltOutlined,
} from "@mui/icons-material";

/**
 * A component for splitting expenses between family members
 *
 * @param {Object} props - Component props
 * @param {Array} props.members - List of family members to split between
 * @param {number} props.totalAmount - Total amount to split
 * @param {Function} props.onChange - Function to call when split changes
 * @param {string} props.splitMethod - Split method ('equal', 'percentage', 'amount')
 * @param {Function} props.onSplitMethodChange - Function to call when split method changes
 */
const ExpenseSplitter = ({
  members = [],
  totalAmount = 0,
  onChange,
  splitMethod = "equal",
  onSplitMethodChange,
}) => {
  const theme = useTheme();
  const [splits, setSplits] = useState([]);

  // Initialize splits when members or total amount changes
  useEffect(() => {
    if (members.length > 0 && totalAmount > 0) {
      const equalShare = totalAmount / members.length;
      const equalPercentage = 100 / members.length;

      const initialSplits = members.map((member) => ({
        member,
        percentage: equalPercentage,
        amount: equalShare,
      }));

      setSplits(initialSplits);
      if (onChange) onChange(initialSplits);
    }
  }, [members, totalAmount]);

  // Update all splits when split method changes
  useEffect(() => {
    if (splits.length > 0) {
      let updatedSplits = [...splits];

      if (splitMethod === "equal") {
        const equalShare = totalAmount / members.length;
        const equalPercentage = 100 / members.length;

        updatedSplits = members.map((member) => ({
          member,
          percentage: equalPercentage,
          amount: equalShare,
        }));
      }

      setSplits(updatedSplits);
      if (onChange) onChange(updatedSplits);
    }
  }, [splitMethod]);

  // Handle percentage change for a member
  const handlePercentageChange = (index, newValue) => {
    if (splitMethod !== "percentage") return;

    const updatedSplits = [...splits];
    updatedSplits[index].percentage = newValue;
    updatedSplits[index].amount = (totalAmount * newValue) / 100;

    // Adjust other percentages to ensure total is 100%
    const currentTotal = updatedSplits.reduce(
      (sum, split) => sum + split.percentage,
      0
    );
    if (currentTotal !== 100) {
      const diff = 100 - currentTotal;
      const othersCount = updatedSplits.length - 1;

      if (othersCount > 0) {
        const adjustPerMember = diff / othersCount;
        updatedSplits.forEach((split, i) => {
          if (i !== index) {
            split.percentage += adjustPerMember;
            split.amount = (totalAmount * split.percentage) / 100;
          }
        });
      }
    }

    setSplits(updatedSplits);
    if (onChange) onChange(updatedSplits);
  };

  // Handle amount change for a member
  const handleAmountChange = (index, newValue) => {
    if (splitMethod !== "amount") return;

    const updatedSplits = [...splits];
    updatedSplits[index].amount = newValue;
    updatedSplits[index].percentage = (newValue / totalAmount) * 100;

    // Adjust other amounts to ensure total is correct
    const currentTotal = updatedSplits.reduce(
      (sum, split) => sum + split.amount,
      0
    );
    if (currentTotal !== totalAmount) {
      const diff = totalAmount - currentTotal;
      const othersCount = updatedSplits.length - 1;

      if (othersCount > 0) {
        const adjustPerMember = diff / othersCount;
        updatedSplits.forEach((split, i) => {
          if (i !== index) {
            split.amount += adjustPerMember;
            split.percentage = (split.amount / totalAmount) * 100;
          }
        });
      }
    }

    setSplits(updatedSplits);
    if (onChange) onChange(updatedSplits);
  };

  // Reset to equal split
  const resetToEqual = () => {
    const equalShare = totalAmount / members.length;
    const equalPercentage = 100 / members.length;

    const resetSplits = members.map((member) => ({
      member,
      percentage: equalPercentage,
      amount: equalShare,
    }));

    setSplits(resetSplits);
    if (onChange) onChange(resetSplits);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Split Expense
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Equal Split">
            <IconButton
              size="small"
              color={splitMethod === "equal" ? "primary" : "default"}
              onClick={() => onSplitMethodChange("equal")}
            >
              <EqualizeOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Percentage Split">
            <IconButton
              size="small"
              color={splitMethod === "percentage" ? "primary" : "default"}
              onClick={() => onSplitMethodChange("percentage")}
            >
              <PercentOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Amount Split">
            <IconButton
              size="small"
              color={splitMethod === "amount" ? "primary" : "default"}
              onClick={() => onSplitMethodChange("amount")}
            >
              <AttachMoneyOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset to Equal">
            <IconButton size="small" onClick={resetToEqual}>
              <RestartAltOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {splits.map((split, index) => (
        <Grid
          container
          spacing={2}
          key={split.member.id}
          sx={{ mb: 2, alignItems: "center" }}
        >
          <Grid item xs={3} sm={2}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={split.member.avatar}
                alt={split.member.name}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography variant="body2" noWrap>
                {split.member.name}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={5} sm={6}>
            {splitMethod === "equal" ? (
              <Chip
                label={`Equal: ${(100 / members.length).toFixed(0)}%`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ) : splitMethod === "percentage" ? (
              <Slider
                value={split.percentage}
                onChange={(_, newValue) =>
                  handlePercentageChange(index, newValue)
                }
                aria-labelledby="percentage-slider"
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value.toFixed(0)}%`}
                step={1}
                min={0}
                max={100}
                sx={{ color: theme.palette.primary.main }}
              />
            ) : (
              <Slider
                value={split.amount}
                onChange={(_, newValue) => handleAmountChange(index, newValue)}
                aria-labelledby="amount-slider"
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `$${value.toFixed(2)}`}
                step={1}
                min={0}
                max={totalAmount}
                sx={{ color: theme.palette.primary.main }}
              />
            )}
          </Grid>

          <Grid item xs={4}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Chip
                label={`${split.percentage.toFixed(0)}%`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`$${split.amount.toFixed(2)}`}
                size="small"
                color="primary"
              />
            </Box>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default ExpenseSplitter;
