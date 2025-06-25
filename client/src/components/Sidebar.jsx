/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
    Money,
    Reviews,
    ReviewsSharp,
    Dashboard,
    Approval,
} from "@mui/icons-material";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import { PublicOutlined } from '@mui/icons-material';
import logo from '../assets/logo-png.png';
import FlexBetween from './FlexBetween';
import { GrPerformance } from 'react-icons/gr';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
    { id: 'recurring-transactions', text: "Recurring", icon: <AutorenewIcon />, path: 'recurring-transactions' },
    { id: 'add-transactions', text: "Add Txn", icon: <AddCircleOutlineIcon />, path: 'add-transactions' },
    { id: 'aprove-transactions', text: "Approve Txn", icon: <CheckCircleOutlineIcon />, path: 'approve-transactions' },
    { id: 'employee-section', text: "Employee Data", icon: null, isSectionHeader: true },
    // { id: 'dashboard', text: "Dashboard", icon: <Dashboard />, path: 'dashboard' },
    { id: 'employees', text: "Employees", icon: <PersonIcon />, path: 'employees' },
    { id: 'task', text: "Tasks", icon: <Task />, path: 'tasks' },
    { id: 'performance', text: "Performace", icon: <Reviews />, path: 'performance' },
    { id: 'goal', text: "Goal", icon: <GrPerformance />, path: 'goal' },
    { id: 'department-section', text: "Department Data", icon: null, isSectionHeader: true },
    { id: 'departments', text: "Departments", icon: <ApartmentIcon />, path: 'departments' },
    { id: 'project-teams', text: "Teams", icon: <Groups />, path: 'teams' },
    { id: 'management-section', text: "Management", icon: null, isSectionHeader: true },
    { id: 'logs', text: 'TimeLog', icon: <Assignment />, path: 'timelog' },
    { id: 'company calendar', text: "Calendar", icon: <CalendarMonthOutlined />, path: 'calendar' },
    { id: 'leave', text: 'Leave System', icon: <EventBusyIcon />, path: 'leave-system' },
    { id: 'bonus-system', text: 'Bonus System', icon: <Money />, path: 'bonus-system' },
    { id: 'review-cycle', text: 'Review Cycle', icon: <ReviewsSharp />, path: 'review-cycle' },
    { id: 'leave-approval', text: 'Leave Approval', icon: <Approval />, path: 'leave-approval' }
].filter(Boolean);

const Sidebar = ({ drawerWidth, isSidebarOpen, setIsSidebarOpen, isNonMobile }) => {
    const theme = useTheme();
    const { pathname } = useLocation();
    const [active, setActive] = useState("");
    const navigate = useNavigate();
    const { user: authUser } = useSelector((state) => state.auth);
    const userRole = authUser?.role;

    useEffect(() => {
        setActive(pathname.substring(pathname.lastIndexOf('/') + 1));
    }, [pathname]);

    // Filter navItems based on user role
    const filteredNavItems = navItems.filter(item => {
        // Show leave approval only for Admin, HR, and Manager
        if (item.id === 'leave-approval') {
            return ['Admin', 'HR', 'Manager'].includes(userRole);
        }
        return true; // Show all other items
    });

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
                                <Box component="img" src={logo} alt="Logo" sx={{ width: 160, scale: "1.7", paddingBottom: "25px" }} />
                            </Box>
                            {!isNonMobile && (
                                <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    <ChevronLeft sx={{ color: theme.palette.primary.light }} />
                                </IconButton>
                            )}
                        </FlexBetween>
                    </Box>



                    <Box width="100%">
                        <List>
                            {filteredNavItems.map(({ id, text, icon, isSectionHeader, isSticky, path }) => {
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
