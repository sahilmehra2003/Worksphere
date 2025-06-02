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
    Assignment,
    Groups,
    CalendarMonthOutlined,
    Task,
    FilterList,
    History,
    LocalOffer
} from "@mui/icons-material";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import { PublicOutlined } from '@mui/icons-material';
import logo from '../assets/logo-png.png';
import FlexBetween from './FlexBetween';
const logoStyle = {
    filter: "invert(1) hue-rotate(180deg)",
};
const navItems = [
    { id: 'client-section', text: "Client Facing", icon: null, isSectionHeader: true },
    { id: 'clients', text: "Clients", icon: <Groups2Outlined />, path: 'clients' },
    { id: 'projects', text: "Projects", icon: <Assignment />, path: 'projects' },
    { id: 'geography', text: "Geography", icon: <PublicOutlined />, path: 'geography' },
    { id: 'transaction-section', text: "Transaction Data", icon: null, isSectionHeader: true },
    { id: 'transactions', text: "Transactions", icon: <ReceiptLongOutlined />, path: 'transactions' },
    { id: 'transaction-filters', text: "Transaction Filters", icon: <FilterList />, path: 'transaction-filters' },
    { id: 'payment-history', text: "Payment History", icon: <History />, path: 'payment-history' },
    { id: 'transaction-tags', text: "Transaction Tags", icon: <LocalOffer />, path: 'transaction-tags' },
    { id: 'employee-section', text: "Employee Data", icon: null, isSectionHeader: true },
    { id: 'employees', text: "Employees", icon: <PersonIcon />, path: 'employees' },
    { id: 'task', text: "Tasks", icon: <Task />, path: 'tasks' },
    { id: 'department-section', text: "Department Data", icon: null, isSectionHeader: true },
    { id: 'departments', text: "Departments", icon: <ApartmentIcon />, path: 'departments' },
    { id: 'project-teams', text: "Teams", icon: <Groups />, path: 'teams' },
    { id: 'management-section', text: "Management", icon: null, isSectionHeader: true },
    { id: 'company calendar', text: "Calendar", icon: <CalendarMonthOutlined />, path: 'calendar' },
    { id: 'leave', text: 'Leave System', icon: <EventBusyIcon />, path: 'Leave System' },
    { id: 'timesheet', text: 'Timesheet', icon: <Assignment />, path: 'timesheet' },
].filter(Boolean);

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
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            boxSizing: "border-box",
                            borderWidth: isNonMobile ? 0 : "2px",
                            width: drawerWidth,
                            overflowX: "hidden"
                        },
                    }}
                >

                    <Box
                        sx={{
                            position: "fixed",
                            top: 0,
                            zIndex: 1, // Sits below the logo box if logo needs to float above blur
                            height: '50px',
                            backgroundColor: theme.palette.background.default,
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            padding: "10px",
                            width: '242px',
                        }}
                    />
                    <Box
                        sx={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            padding: "10px",
                            width: '90px',
                            height: '40px',
                            scale: "1.1",
                            //  marginBlock: "10px",
                            ...(theme.palette.mode === "light" && logoStyle),
                        }}
                    >
                        <FlexBetween>
                            <Box display="flex" alignItems="center" gap="0.5rem">
                                <Box component="img" src={logo} alt="Logo" sx={{ width: 160, scale: "1.7" }} />
                            </Box>
                            {!isNonMobile && (
                                <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    <ChevronLeft sx={{ color: theme.palette.primary.light }} />
                                </IconButton>
                            )}
                        </FlexBetween>
                    </Box>


                    {/* Navigation Items */}
                    <Box width="100%">
                        <List>
                            {navItems.map(({ id, text, icon, isSectionHeader, isSticky, path }) => {
                                if (isSectionHeader) {
                                    return (
                                        <Typography
                                            key={`section-${id}`}
                                            sx={{
                                                m: "1.5rem 2rem 2rem 3rem",
                                                color: theme.palette.neutral.main,
                                            }}
                                        >
                                            {text}
                                        </Typography>
                                    );
                                }

                                const isActive = active === id;

                                return (
                                    <ListItem
                                        key={id}
                                        disablePadding
                                        sx={isSticky ? {
                                            position: "sticky",
                                            top: 60,
                                            zIndex: 1,
                                            backgroundColor: theme.palette.primary.dark,
                                        } : {}}
                                    >
                                        <ListItemButton
                                            onClick={() => {
                                                navigate(`/app/${path}`);
                                                setActive(id);
                                            }}
                                            sx={{
                                                backgroundColor: isActive ? theme.palette.primary.main : "transparent",
                                                color: isActive ? theme.palette.text.light : theme.palette.text.primary,
                                            }}
                                        >
                                            <ListItemIcon sx={{
                                                ml: "2rem",
                                                color: isActive ? theme.palette.text.light : theme.palette.text.primary,
                                            }}>
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText primary={text} />
                                            {isActive && (
                                                <ChevronRightOutlined sx={{ ml: "auto", color: theme.palette.neutral.main }} />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>

                    </Box>
                </Drawer>
            )}
        </Box>
    );
};

export default Sidebar;
