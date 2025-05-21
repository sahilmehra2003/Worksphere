/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Drawer, IconButton, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Typography, useTheme
} from "@mui/material";
import {
    ChevronLeft,
    ChevronRightOutlined,
    Groups2Outlined,
    ReceiptLongOutlined,
    // HomeOutlined,          // Uncomment later
    Assignment,
    // Groups,                // Uncomment later
    // CheckCircle,           // Uncomment later
    // TrendingUpOutlined,    // Uncomment later
    CalendarMonthOutlined,
    Task
} from "@mui/icons-material";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import { PublicOutlined } from '@mui/icons-material';
import logo from '../assets/logo-png.png';
import FlexBetween from './FlexBetween';
import { icon } from 'leaflet';

// Organized with future sections in mind
const navItems = [
    /* ===== Dashboard (uncomment later) =====
    {
        id: 'dashboard',
        text: "Dashboard",
        icon: <HomeOutlined />,
        isSticky: true  // Special styling for dashboard
    },
    */

    /* ===== Client Section ===== */
    {
        id: 'client-section',
        text: "Client Facing",
        icon: null,
        isSectionHeader: true
    },
    {
        id: 'clients',
        text: "Clients",
        icon: <Groups2Outlined />
    },

    {
        id: 'projects',
        text: "Projects",
        icon: <Assignment />
    },

    {
        id: 'transactions',
        text: "Transactions",
        icon: <ReceiptLongOutlined />
    },
    {
        id: 'geography',
        text: "Geography",
        icon: <PublicOutlined />
    },

    /* ===== Employee Section ===== */
    {
        id: 'employee-section',
        text: "Employee Data",
        icon: null,
        isSectionHeader: true
    },
    {
        id: 'employees',
        text: "Employees",
        icon: <PersonIcon />
    },
    {
        id: 'task',
        text: "Tasks",
        icon:<Task/>
    },

    /* ===== Department Section ===== */
    {
        id: 'department-section',
        text: "Department Data",
        icon: null,
        isSectionHeader: true
    },
    {
        id: 'departments',
        text: "Departments",
        icon: <ApartmentIcon />
    },
    {
        id: 'company calendar',
        text: "calendar",
        icon: <CalendarMonthOutlined />
    },
    {
        id: 'management-section',
        text: "Management",
        icon: null,
        isSectionHeader: true
    },
    {
        id: 'leave',
        text: 'Leave System',
        icon: <EventBusyIcon />
    },
    {
        id: 'timesheet',
        text: 'Timesheet',
        icon: <Assignment />
    },
    /* ===== Future Sections (uncomment later) =====
    {
        id: 'project-teams',
        text: "Project Teams",
        icon: <Groups />
    },
    {
        id: 'attendance',
        text: "Attendance",
        icon: <CheckCircle />
    },
   
    {
        id: 'performance',
        text: "Performance",
        icon: <TrendingUpOutlined />
    },
    
    */
].filter(Boolean); // Safely removes any undefined/null items

const Sidebar = ({ drawerWidth, isSidebarOpen, setIsSidebarOpen, isNonMobile }) => {
    const theme = useTheme();
    const { pathname } = useLocation();
    const [active, setActive] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setActive(pathname.substring(pathname.lastIndexOf('/') + 1));
    }, [pathname]);

    return (
        <Box component="nav">
            {isSidebarOpen && (
                <Drawer
                    open={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    variant='persistent'
                    anchor='left'
                    sx={{
                        width: drawerWidth,
                        "& .MuiDrawer-paper": {
                            backgroundColor: theme.palette.background.alt,
                            color: 'white',
                            boxSizing: "border-box",
                            borderWidth: isNonMobile ? 0 : "2px",
                            width: drawerWidth,
                        },
                    }}
                >
                    {/* Logo and Close Button */}
                    <Box sx={{ position: "sticky", top: 0, zIndex: 1, p: "1.5rem 2rem 2rem 3rem" }}>
                        <FlexBetween color="#660033">
                            <Box display="flex" alignItems="center" gap="0.5rem">
                                <Box component="img" src={logo} alt="Logo" sx={{ width: 160, scale: "1.7" }} />
                            </Box>
                            {!isNonMobile && (
                                <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    <ChevronLeft sx={{ color: '#B6EADA' }} />
                                </IconButton>
                            )}
                        </FlexBetween>
                    </Box>

                    {/* Navigation Items */}
                    <Box width="100%">
                        <List>
                            {navItems.map(({ id, text, icon, isSectionHeader, isSticky }) => {
                                if (isSectionHeader) {
                                    return (
                                        <Typography
                                            key={`section-${id}`}
                                            sx={{ m: "1.5rem 2rem 2rem 3rem", color: theme.palette.neutral.main }}
                                        >
                                            {text}
                                        </Typography>
                                    );
                                }

                                return (
                                    <ListItem
                                        key={id}
                                        disablePadding
                                        sx={isSticky ? {
                                            position: "sticky",
                                            top: 60,
                                            zIndex: 1,
                                            backgroundColor: '#301E67'
                                        } : {}}
                                    >
                                        <ListItemButton
                                            onClick={() => {
                                                console.log(`/app/${text.toLowerCase()}`)
                                                navigate(`/app/${text.toLowerCase()}`);
                                                setActive(id);
                                            }}
                                            sx={{
                                                backgroundColor: active === id ? '#5B8FB9' : "transparent",
                                                color: active === id ? '#03001C' : '#B6EADA',
                                            }}
                                        >
                                            <ListItemIcon sx={{
                                                ml: "2rem",
                                                color: active === id ? '#03001C' : '#B6EADA',
                                            }}>
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText primary={text} />
                                            {active === id && (
                                                <ChevronRightOutlined sx={{ ml: "auto", color: theme.palette.neutral.main }} />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                        <br /><br />
                    </Box>
                </Drawer>
            )}
        </Box>
    );
};

export default Sidebar;