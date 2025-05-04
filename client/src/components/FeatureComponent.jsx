import React from 'react';
import { Box, Grid, Typography, Container, Paper, Button } from '@mui/material';
import { GrDocumentTime, GrAnalytics } from "react-icons/gr";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaSync, FaTasks } from "react-icons/fa";
import { ImEnlarge } from "react-icons/im";
import { NavLink } from 'react-router-dom';
import feature from '../assets/feature.jpg';

const FeatureComponent = () => {
  return (
    <Box
      sx={{
        backgroundImage: `url(${feature})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity:"0.9",
        padding: '4rem 0',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          sx={{ fontWeight: 'bold', marginBottom: '2rem', color: 'lightblue' }}
        >
          Why Choose Worksphere
        </Typography>

        <Grid container spacing={5}>
          {/* First Feature: Time Management */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={4}
              sx={{
                padding: '2rem',
                backgroundColor: 'translucent',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                borderRadius: '15px',
                fontSize:"1.2rem",
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.5)',
                  opacity:'0.9'
                },
                height: '100%',
              }}
            >
              <Typography
                style={{
                  textAlign: 'center',
                  marginTop: '10px',
                  display: 'inline-block',
                }}
              >
                <GrDocumentTime style={{ fontSize: '30px' }} />
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem',fontSize:"1.4rem", }}>
                Time Management
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: '1rem',fontSize:"1rem" }}>
                Worksphere helps you track and manage your tasks efficiently, saving time on repetitive activities and prioritizing your work effectively.
              </Typography>
            </Paper>
          </Grid>

          {/* Second Feature: Collaboration */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                padding: '2rem',
                backgroundColor: 'translucent',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                borderRadius: '15px',
                color:"white",
                fontSize:"1.2rem",
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.5)',
                  opacity:'0.8'
                },
                height: '100%',
              }}
            >
              <Typography
                style={{
                  textAlign: 'center',
                  marginTop: '10px',
                  display: 'inline-block',
                }}
              >
                <FaPeopleGroup style={{ fontSize: '30px' }} />
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem',fontSize:"1.4rem" }}>
                Enhanced Collaboration
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: '1rem',fontSize:"1rem" }}>
                Collaborate seamlessly with your team and clients, share ideas, documents, and track progress with ease, enhancing productivity.
              </Typography>
            </Paper>
          </Grid>

          {/* Third Feature: Task Management */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                padding: '2rem',
                backgroundColor: 'translucent',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                borderRadius: '15px',
                fontSize:"1.2rem",
                opacity:"80",
                color:"white",
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.5)',
                  opacity:'0.8'
                },
                height: '100%',
              }}
            >
              <Typography
                style={{
                  textAlign: 'center',
                  marginTop: '10px',
                  display: 'inline-block',
                }}
              >
                <FaTasks style={{ fontSize: '30px' }} />
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem',fontSize:"1.4rem", }}>
                Task Management
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: '1rem',fontSize:"1rem" }}>
                Assign and monitor tasks efficiently. With Worksphere, you'll never miss a deadline again and can keep track of your team's performance.
              </Typography>
            </Paper>
            
          </Grid>
        </Grid>

        {/* Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '3rem'}}>
          <Button variant="contained" size="large"  sx={{
                  padding: "1rem",
                  backgroundColor: "#20a7db",
                  '&:hover': {
                    backgroundColor: "#1c96c5", 
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    borderRadius:"6px"
                  },
          }} >
            <NavLink to="/signup" style={{ color: 'white', textDecoration: 'none' }}>
              Get Started with Worksphere
            </NavLink>
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeatureComponent;


