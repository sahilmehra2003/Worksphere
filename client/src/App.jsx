import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { themeSettings } from './theme';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from './Pages/Layout/Layout';
import EmployeeData from './Pages/Employees/EmployeeData';
import TransactionChart from './Pages/transaction/Transaction';
import AddTransactionDetails from './components/AddTransactionDetails';
import ClientGrid from './Pages/Client/Client';
import Projects from './Pages/Projects/index';
import LandingPage from './Pages/Landing Page/LandingPage';
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import Features from './Pages/Features/Features';
import Signup from './Pages/SignUp/Signup';
import Login from './Pages/Login/Login';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import Contact from './Pages/Contact Us/Contact';
import Protected from './components/Protected';
import 'leaflet/dist/leaflet.css'
import { Toaster } from 'react-hot-toast';
import DepartmentSlider from './Pages/Department/Department';
import GeoLocation from './Pages/Geography/GeoLocation';
import CompanyHolidayCalendar from './Pages/Leave Management/Calender/OrganisationCalender';
import UserLeavePage from './Pages/Leave Management/UserLeavePage';
import LeaveApproval from './Pages/Leave Management/LeaveApproval';
import CompleteProfile from './Pages/Profile/CompleteProfile';
import ViewProfile from './Pages/Profile/ViewProfile';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskPage from './Pages/Tasks/index';
import Teams from './Pages/Teams/Teams';
import ScrollbarStyles from './components/ScrollBarStylex';
import ApprovalPage from './Pages/transaction/TransactionApproval';
import RecurringTransactions from './Pages/transaction/RecurringTransaction';
import TimeLog from './Pages/TimeLog/TimeLog';
import BonusSystemPage from './Pages/Bonus System/BonusSystem';
import Performance from './Pages/Performance/Performance';
import ReviewCycleManagement from './Pages/Review Cycle/ReviewCycle';
import GoalPage from './Pages/Goal/Goal';
import SubscriptionPage from './Pages/Subscription/SubscriptionPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/home" replace />
      },
      {
        path: '/home',
        element: <Home />
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "features",
        element: <Features />
      },
      {
        path: "signup",
        element: <Signup />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "reset-password",
        element: <ResetPassword />
      },
      {
        path: "contact",
        element: <Contact />
      },
      {
        path: "subscribe",
        element: <SubscriptionPage />
      }
    ]
  },
  {
    path: "/app",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Navigate to="client" replace />
      },
      {
        path: "complete-profile",
        element: (
          <Protected>
            <CompleteProfile />
          </Protected>
        ),
      },
      {
        path: "profile",
        element: (
          <Protected>
            <ViewProfile />
          </Protected>
        ),
      },
      {
        path: "client",
        element: (
          <Protected role="Admin">
            <ClientGrid />
          </Protected>
        ),
      },
      {
        path: "employees",
        element: <EmployeeData />,
      },
      {
        path: "performance",
        element: <Performance />
      },
      {
        path: "transactions",
        element: <TransactionChart />,
      },
      {
        path: "recurring-transactions",
        element: <RecurringTransactions />
      },
      {
        path: 'add-transactions',
        element: <AddTransactionDetails />
      },
      {
        path: 'approve-transactions',
        element: <ApprovalPage />
      },
      {
        path: "clients",
        element: <ClientGrid />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "departments",
        element: <DepartmentSlider />,
      },
      {
        path: "geography",
        element: <GeoLocation />,
      },
      {
        path: 'calendar',
        element: <CompanyHolidayCalendar />
      },
      {
        path: 'leave-system',
        element: <UserLeavePage />
      },
      {
        path: 'leave-approval',
        element: <LeaveApproval />
      },
      {
        path: 'timelog',
        element: <TimeLog />
      },
      {
        path: 'tasks',
        element: <TaskPage />
      },
      {
        path: 'teams',
        element: <Teams />
      },
      {
        path: 'bonus-system',
        element: <BonusSystemPage />
      },
      {
        path: 'review-cycle',
        element: <ReviewCycleManagement />
      },
      {
        path: 'goal',
        element: <GoalPage />
      }
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);


function App() {

  const mode = useSelector((state) => state.theme.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className='app'>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <ScrollbarStyles />
          <Toaster />
          <RouterProvider router={router} />
        </LocalizationProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
