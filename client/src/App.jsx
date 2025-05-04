import { CssBaseline,ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { themeSettings } from './theme';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import Dashboard from './Pages/dashboard/Dashboard';
import Layout from './Pages/Layout/Layout';
import EmployeeData from './Pages/Employees/EmployeeData';
import TransactionChart from './Pages/transaction/Transaction';
import ClientGrid from './Pages/Client/Client';
import ProjectDataGrid from './Pages/Projects/Projects';
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
function App() {
  const router=createBrowserRouter([
    {
      path:"/",
      element:<LandingPage/>,
      children:[
        {
          path:"/",
          element:<Navigate to="/home" replace/>
        },
        {
          path:'/home',
          element:<Home/>
        },
        {
          path:"about",
          element:<About/>
        },
        {
          path:"features",
          element:<Features/>
        },
        {
          path:"signup",
          element:<Signup/>
        },
        {
          path:"login",
          element:<Login/>
        },
        {
          path:"contact",
          element:<Contact/>
        }
      ]
    },
    {
      path: "/app",
      element: <Layout />,
      children: [
        {
          path: "/app",
          element: <Protected role="Admin" />, 
          children: [
            {
              path: "dashboard",
              element: <Dashboard />,
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
              element: <ProjectDataGrid />,
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
              path:'calendar',
              element: <CompanyHolidayCalendar/>
            },
            {
              path:'Leave System',
              element:<UserLeavePage/>
            },
          ],
        },
      ],
    },
    {
      path: "/login",
      element: <Login/>,
    },
    {
      path: "/signup",
      element: <Signup/>,
    },
    
  ])
 const mode=useSelector((state)=>state.theme.mode)
 const theme=useMemo(()=>createTheme(themeSettings(mode)),[mode])

  return (
    <div className='app'>
       <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Toaster/>
        <RouterProvider router={router}/>
       </ThemeProvider>
      
    </div>
  )
}

export default App
