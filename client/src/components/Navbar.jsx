/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
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

// Redux
import { useDispatch } from 'react-redux';
import { setMode } from '../redux/Slices/themeSlice';
import { logoutUserAsync } from '../redux/Slices/authSlice';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({ name: '', role: '' });
  const isOpen = Boolean(anchorEl);

  useEffect(() => {
    const userDataString = localStorage.getItem('worksphereUser');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser({
          name: userData.name || 'User',
          role: userData.role || 'Role',
        });
      } catch (e) {
        console.error('Navbar: Failed to parse user data from localStorage', e);
        setUser({ name: 'User', role: 'Role' });
      }
    } else {
      console.warn("Navbar: 'worksphereUser' not found in localStorage.");
      setUser({ name: 'User', role: 'Role' });
    }
  }, []);

  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUserAsync());
    navigate('/login');
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    navigate('/app/profile');
    setAnchorEl(null);
  };

  return (
    <AppBar
      sx={{
        position: 'static',
        background: 'none',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Left Section */}
        <FlexBetween>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </IconButton>
          <FlexBetween
            backgroundColor={theme.palette.background.paper}
            borderRadius="9px"
            gap="3rem"
            p="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search..." />
            <IconButton sx={{
              color: theme.palette.mode === 'light'
                ? theme.palette.text.primary
                : '#fff',
            }}>
              <Search />
            </IconButton>
          </FlexBetween>
        </FlexBetween>

        <FlexBetween gap="1.5rem">
          <IconButton
            onClick={() => dispatch(setMode())}
            sx={{
              color: theme.palette.mode === 'light'
                ? theme.palette.text.primary
                : '#fff',
            }}
          >
            {theme.palette.mode === 'dark' ? (
              <DarkModeOutlined sx={{ fontSize: '25px' }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: '25px' }} />
            )}
          </IconButton>

          {/* Profile Dropdown */}
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
                  variant='body1'
                  sx={{ color: theme.palette.neutral.main }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant='body2'
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
              <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Log Out</MenuItem>
            </Menu>
          </FlexBetween>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
