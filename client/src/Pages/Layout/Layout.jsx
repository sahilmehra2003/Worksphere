// Layout.jsx - Back to Normal (Original Dynamic Version)
import { useState } from 'react';
import { Box, useMediaQuery } from "@mui/material"; // Ensure useMediaQuery is imported
import Navbar from '../../components/Navbar';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const Layout = () => {
  // This log is useful to see how often Layout renders. Keep it for a bit if you like.
  console.log("Layout component rendering (Normal Dynamic Version)");

  const isNonMobile = useMediaQuery("(min-width: 600px)"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  return (
    <Box display={isNonMobile ? "flex" : "block"} width="100%" height="100%">
      <Sidebar
        isNonMobile={isNonMobile} 
        drawerWidth="250px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Box flexGrow={1}>
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Outlet />
      </Box>
    </Box>
  );
}
export default Layout;