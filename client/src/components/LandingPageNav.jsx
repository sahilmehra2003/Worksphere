import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import logo from "../assets/logo-png.png";

const LandingPageNav = () => {
    const [activeButton,setActiveButton]=useState("signup");
    function handleButtonClick(button){
        setActiveButton(button)
    }
  return (
    <AppBar position="fixed" color="inherit" elevation={0}>
      <Toolbar
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1rem",
        }}
      >
        <NavLink to="/" style={{ textDecoration: "none" }}>
          <Box component="img" src={logo} alt="Logo" sx={{ width: 160,scale:"1.7" }} />
        </NavLink>
        <Box
          sx={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          {["Home", "About", "Features", "Contact"].map((text, index) => (
            <NavLink
              key={index}
              to={`/${text.toLowerCase()}`}
              style={{ textDecoration: "none" }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#50b8e7", 
                  },
                }}
              >
                {text}
              </Typography>
            </NavLink>
          ))}
        </Box>

        {/* Auth Buttons */}
        <Box>
        <Button
            component={NavLink}
            to="/login"
            variant={activeButton === "login" ? "contained" : "outlined"}
            sx={{
              marginRight: 1,
            }}
            onClick={() => handleButtonClick("login")}
          >
            Login
          </Button>
          <Button
            component={NavLink}
            to="/signup"
            variant={activeButton === "signup" ? "contained" : "outlined"}
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


