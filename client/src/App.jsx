import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { themeSettings } from './theme';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'; // Added RouterProvider here for clarity
import Dashboard from './Pages/dashboard/Dashboard';
import Layout from './Pages/Layout/Layout';
import EmployeeData from './Pages/Employees/EmployeeData';
import TransactionChart from './Pages/transaction/Transaction';
import ClientGrid from './Pages/Client/Client';
import Projects from './Pages/Projects/index';
import LandingPage from './Pages/Landing Page/LandingPage';
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import Features from './Pages/Features/Features';
import Signup from './Pages/SignUp/Signup';
import Login from './Pages/Login/Login';
import Contact from './Pages/Contact Us/Contact';
import Protected from './components/Protected';
import 'leaflet/dist/leaflet.css'
import { Toaster } from 'react-hot-toast';
import DepartmentSlider from './Pages/Department/Department';
import GeoLocation from './Pages/Geography/GeoLocation';
import CompanyHolidayCalendar from './Pages/Leave Management/Calender/OrganisationCalender';
import UserLeavePage from './Pages/Leave Management/UserLeavePage';
import CompleteProfile from './Pages/Profile/CompleteProfile';
import ViewProfile from './Pages/Profile/ViewProfile';
import Timesheet from './Pages/Timesheet/index';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskPage from './Pages/Tasks/index';
import Teams from './Pages/Teams/Teams';
import ScrollbarStyles from './components/ScrollBarStylex';

// VVVVVV MOVED OUTSIDE THE COMPONENT VVVVVV
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
        path: "contact",
        element: <Contact />
      }
    ]
  },
  {
    path: "/app",
    element: <Layout />,
    children: [
      {
        path: "complete-profile",
        element: (
          <Protected> {/* Assuming no role needed, or add if necessary */}
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
        path: "dashboard",
        element: (
          <Protected role="Admin">
            <Dashboard />
          </Protected>
        ),
      },
      {
        path: "employees",
        element: <EmployeeData />,
      },
      {
        path: "transactions",
        element: <TransactionChart />,
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
        path: 'Leave System',
        element: <UserLeavePage />
      },
      {
        path: 'timesheet',
        element: <Timesheet />
      },
      {
        path: 'tasks',
        element: <TaskPage />
      },
      {
        path: 'teams',
        element: <Teams />
      }
    ],
  },
  {
    path: "/login", // These are fine if they are meant to be top-level, standalone routes
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);
// ^^^^^^ MOVED OUTSIDE THE COMPONENT ^^^^^^

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