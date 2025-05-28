// Dashboard.jsx (Restored)
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid2,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  fetchCommonDashboardData,
  fetchRecentActivities,
  fetchNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  fetchEmployeeDashboardSummary,
  fetchManagerDashboardSummary,
  fetchAdminDashboardSummary,
  fetchHrDashboardSummary,
} from "../../redux/Slices/dashboardSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    recentActivities,
    notifications,
    performanceMetrics,
    leaveStats,
    timesheetStats,
    employeeSummary,
    managerSummary,
    adminSummary,
    hrSummary,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Fetch common data
    dispatch(fetchCommonDashboardData());
    dispatch(fetchRecentActivities());
    dispatch(fetchNotifications());

    // Fetch role-specific data
    switch (user?.role) {
      case 'Employee':
        dispatch(fetchEmployeeDashboardSummary());
        break;
      case 'Manager':
        dispatch(fetchManagerDashboardSummary());
        break;
      case 'Admin':
        dispatch(fetchAdminDashboardSummary());
        break;
      case 'HR':
        dispatch(fetchHrDashboardSummary());
        break;
      default:
        break;
    }
  }, [dispatch, user?.role]);

  const handleMarkNotificationAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleClearAllNotifications = () => {
    dispatch(clearAllNotifications());
  };

  if (loading.common || loading[user?.role?.toLowerCase()]) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error.common || error[user?.role?.toLowerCase()]) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading dashboard: {error.common || error[user?.role?.toLowerCase()]}
        </Typography>
      </Box>
    );
  }

  const renderRoleSpecificContent = () => {
    switch (user?.role) {
      case 'Employee':
        return (
          <>
            {/* Employee-specific content */}
            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Holidays
                  </Typography>
                  <List>
                    {employeeSummary?.upcomingHolidays?.map((holiday, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={holiday.name}
                            secondary={new Date(holiday.date).toLocaleDateString()}
                          />
                        </ListItem>
                        {index < employeeSummary.upcomingHolidays.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pending Tasks
                  </Typography>
                  <List>
                    {employeeSummary?.pendingTasks?.upcoming?.map((task, index) => (
                      <React.Fragment key={task._id}>
                        <ListItem>
                          <ListItemIcon>
                            <AssignmentIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={task.title}
                            secondary={`Due: ${new Date(task.deadlineDate).toLocaleDateString()}`}
                          />
                          <Chip
                            label={task.priority}
                            color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'success'}
                            size="small"
                          />
                        </ListItem>
                        {index < employeeSummary.pendingTasks.upcoming.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid2>
          </>
        );

      case 'Manager':
        return (
          <>
            {/* Manager-specific content */}
            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Overview
                  </Typography>
                  <List>
                    {managerSummary?.teamMembersQuickList?.map((member, index) => (
                      <React.Fragment key={member._id}>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={member.name}
                            secondary={member.position}
                          />
                        </ListItem>
                        {index < managerSummary.teamMembersQuickList.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pending Approvals
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Leave Requests
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {managerSummary?.pendingLeaveApprovalsCount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Timesheet Approvals
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {managerSummary?.pendingTimesheetApprovalsCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          </>
        );

      case 'Admin':
        return (
          <>
            {/* Admin-specific content */}
            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Overview
                  </Typography>
                  <Grid2 container spacing={2}>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {adminSummary?.totalActiveEmployees}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Active Employees
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {adminSummary?.totalDepartments}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Departments
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {adminSummary?.totalProjects}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Active Projects
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {adminSummary?.totalClients}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Active Clients
                        </Typography>
                      </Box>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Financial Overview
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Revenue (This Month)
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ${adminSummary?.financials?.totalRevenueThisMonth}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Expenses (This Month)
                    </Typography>
                    <Typography variant="h6" color="error">
                      ${adminSummary?.financials?.totalExpensesThisMonth}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Net Profit (This Month)
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${adminSummary?.financials?.netProfitThisMonth}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          </>
        );

      case 'HR':
        return (
          <>
            {/* HR-specific content */}
            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Employee Overview
                  </Typography>
                  <Grid2 container spacing={2}>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {hrSummary?.totalEmployees}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Employees
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {hrSummary?.newHiresThisMonth}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          New Hires (This Month)
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {hrSummary?.upcomingAnniversariesCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Upcoming Anniversaries
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {hrSummary?.upcomingBirthdaysCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Upcoming Birthdays
                        </Typography>
                      </Box>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Management
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Active Review Cycles
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {hrSummary?.activeReviewCyclesCount}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Pending Self-Assessments
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {hrSummary?.reviewsPendingSelfAssessmentCount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Pending Manager Reviews
                    </Typography>
                    <Typography variant="h6" color="error">
                      {hrSummary?.reviewsPendingManagerReviewCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome, {user?.name}! 👋
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Here&apos;s your dashboard overview
        </Typography>
      </Box>

      {/* Main Grid */}
      <Grid2 container spacing={3}>
        {/* Role-specific content */}
        {renderRoleSpecificContent()}

        {/* Common content */}
        {/* Performance Metrics */}
        <Grid2 item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Tasks Completed
                      </Typography>
                      <Typography variant="h6">
                        {performanceMetrics.tasksCompleted}
                      </Typography>
                    </Box>
                  </Box>
                </Grid2>
                <Grid2 item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Tasks Pending
                      </Typography>
                      <Typography variant="h6">
                        {performanceMetrics.tasksPending}
                      </Typography>
                    </Box>
                  </Box>
                </Grid2>
                <Grid2 item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Attendance Rate
                      </Typography>
                      <Typography variant="h6">
                        {performanceMetrics.attendanceRate}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid2>
                <Grid2 item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon color="info" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Project Contribution
                      </Typography>
                      <Typography variant="h6">
                        {performanceMetrics.projectContribution}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>

        {/* Recent Activities */}
        <Grid2 item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities?.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.timestamp}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid2>

        {/* Notifications */}
        <Grid2 item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Notifications
                </Typography>
                <IconButton onClick={handleClearAllNotifications} size="small">
                  <Badge badgeContent={notifications?.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Box>
              <List>
                {notifications?.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon color={notification.read ? "disabled" : "primary"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.message}
                      />
                      {!notification.read && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkNotificationAsRead(notification.id)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                    {index < notifications?.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid2>

        {/* Leave Stats */}
        <Grid2 item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Status
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {leaveStats.availableLeaves}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Available
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error">
                      {leaveStats.takenLeaves}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Taken
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {leaveStats.pendingRequests}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending
                    </Typography>
                  </Box>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>

        {/* Timesheet Stats */}
        <Grid2 item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Timesheet Overview
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {timesheetStats.totalHours}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {timesheetStats.billableHours}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Billable
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {timesheetStats.nonBillableHours}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Non-Billable
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {timesheetStats.overtimeHours}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Overtime
                    </Typography>
                  </Box>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default Dashboard;