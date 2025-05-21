import React, { useState, useEffect } from 'react';
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
} from '@mui/icons-material';
import FlexBetween from './FlexBetween';
import { useNavigate } from 'react-router-dom';

import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import profileimg from '../assets/profileimg.jpg';
import { jwtDecode } from 'jwt-decode';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({ name: '', role: '' });
  const isOpen = Boolean(anchorEl);

  useEffect(() => {
    const userDataString = localStorage.getItem("worksphereUser"); // CORRECT KEY
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser({
          name: userData.name || "User",
          role: userData.role || "Role",
        });
      } catch (e) {
        console.error("Navbar: Failed to parse user data from localStorage", e);
        setUser({ name: "User", role: "Role" }); // Fallback
      }
    } else {
      console.warn("Navbar: 'worksphereUser' not found in localStorage. Displaying default user info.");
      setUser({ name: "User", role: "Role" }); // Fallback
      // navigate("/login"); // <<< REMOVE THIS LINE
    }
    // }, [navigate]); // Consider if 'navigate' is truly needed if you remove the navigation call.
    // If only setting local state, it might just need to run once:
  }, []); // Run once on mount to get user display info

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    localStorage.removeItem('token');
    navigate('/home');
    setAnchorEl(null);
  }

  return (
    <AppBar
      sx={{
        position: 'static',
        background: 'none',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <FlexBetween>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </IconButton>
          <FlexBetween
            backgroundColor={theme.palette.background.alt}
            borderRadius="9px"
            gap="3rem"
            p="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        </FlexBetween>

        <FlexBetween gap="1.5rem">
          <FlexBetween>
            <Button
              onClick={handleClick}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textTransform: 'none',
                gap: '1rem',
              }}
            >
              <Box
                component="img"
                alt="profile"
                src={profileimg}
                height="32px"
                width="32px"
                borderRadius="50%"
                sx={{ objectFit: 'cover' }}
              />
              <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="0.6rem"
                  sx={{ color: theme.palette.neutral.main }}
                >
                  {user.name}
                </Typography>
                <Typography
                  fontSize="0.7rem"
                  sx={{ color: theme.palette.neutral.main }}
                >
                  {user.role}
                </Typography>
              </Box>
              <ArrowDropDownOutlined
                sx={{ color: theme.palette.secondary[300], fontSize: '25px' }}
              />
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <MenuItem onClick={handleClose}>Log Out</MenuItem>
            </Menu>
          </FlexBetween>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

