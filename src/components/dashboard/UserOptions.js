"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { paperClasses } from "@mui/material/Paper";
import { listClasses } from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuButton from "./MenuButton";
import { useNavigate } from "react-router-dom";

const MenuItem = styled(MuiMenuItem)({
  margin: "2px 0",
});

export default function OptionsMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogOut = () => {
    sessionStorage.clear();
    navigate("");
  };
  return (
    <React.Fragment>
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: "transparent" }}
      >
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: "4px",
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .MuiDivider-root`]: {
            margin: "4px -4px",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/account");
          }}
        >
          <ListItemText>My account</ListItemText>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleLogOut()}
          sx={{
            [`& .MuiListItemIcon-root`]: {
              ml: "auto",
              minWidth: 0,
            },
          }}
        >
          <ListItemText>Logout</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
