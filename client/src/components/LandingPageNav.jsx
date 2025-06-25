import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import logo from "../assets/logo-png.png";

const LandingPageNav = () => {
    const [activeButton,setActiveButton]=useState("signup");
    function handleButtonClick(button){
        setActiveButton(button)
    }

    const navLinks = ["Home", "About", "Features", "Plans", "Contact"];

  return (
    <AppBar position="fixed" color="inherit" elevation={0}
      sx={{
        backgroundColor: '#0F1020',
        color: 'white',
        boxShadow: 'none',
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          padding: { xs: "0 1rem", md: "0 2rem" },
          minHeight: { xs: '64px', md: '80px' },
        }}
      >
        <NavLink to="/" style={{ textDecoration: "none" }}>
          <Box
            component="img"
            src={logo}
            alt="Worksphere Logo"
            sx={{ width: 160 }}
          />
        </NavLink>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          {navLinks.map((text, index) => (
            <NavLink
              key={index}
              to={text === "Plans" ? "/subscribe" : `/${text.toLowerCase().replace(/\s/g, '')}`}
              style={{ textDecoration: "none" }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontWeight: text === "Plans" ? 'bold' : 'normal',
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#5B8FB9",
                  },
                }}
              >
                {text}
              </Typography>
            </NavLink>
          ))}
        </Box>

        <Box>
            <Button
                component={NavLink}
                to="/login"
                variant={activeButton === "login" ? "contained" : "outlined"}
                sx={{
                    marginRight: 1,
                    color: activeButton === "login" ? 'white' : 'white',
                    borderColor: 'white',
                    '&:hover': {
                        borderColor: '#5B8FB9',
                        backgroundColor: activeButton === "login" ? undefined : 'rgba(91, 143, 185, 0.1)',
                    },
                    backgroundColor: activeButton === "login" ? '#5B8FB9' : 'transparent',
                }}
                onClick={() => handleButtonClick("login")}
            >
                Login
            </Button>
            <Button
                component={NavLink}
                to="/signup"
                variant={activeButton === "signup" ? "contained" : "outlined"}
                sx={{
                    color: activeButton === "signup" ? 'white' : 'white',
                    borderColor: 'white',
                     '&:hover': {
                        borderColor: '#5B8FB9',
                        backgroundColor: activeButton === "signup" ? undefined : 'rgba(91, 143, 185, 0.1)',
                    },
                    backgroundColor: activeButton === "signup" ? '#5B8FB9' : 'transparent',
                }}
                onClick={() => handleButtonClick("signup")}
            >
                Sign Up
            </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default LandingPageNav;