import React from 'react';
import { Grid, Typography, Box, Container, Button } from '@mui/material';
import background from '../assets/vecteezy_abstract-dark-background-with-line-grid-gradient-color_13755473.jpg';
import frontImage from '../assets/mainpicture.jpg';
import { NavLink } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa6";
import CountUp from 'react-countup';

const Header = () => {
  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      {/* Background Image */}
      <img
        src={background}
        alt="background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        loading="eager"
      />

      {/* Content Box */}
      <Container sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={4}>
          {/* Left Side - Welcome Message and Additional Content */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', fontSize:"2rem" }}>
              Your Hub for Seamless Collaboration
            </Typography>
            <Typography variant="h6" sx={{ color: '#fff', marginTop: '1rem' }}>
              Unlock the power of seamless collaboration and efficient task management. With Worksphere, you can streamline your workflow, improve team performance, and grow your business.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '3rem' }}>
              <Button variant="contained" color="primary" size="large">
                <NavLink to="/signup" style={{ color: "white", textDecoration: "none" }}>
                  Get Started <span><FaArrowRight /></span>
                </NavLink>
              </Button>
            </Box>
            
            {/* Stats Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold',fontSize:"1.5rem" }}>
                  Active Users
                </Typography>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold',fontSize:"2rem" }}>
                  <CountUp start={0} end={500} duration={2} />
                  +
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold',fontSize:"1.5rem" }}>
                  Positive Reviews
                </Typography>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold',fontSize:"2rem" }}>
                  <CountUp start={0} end={450} duration={2} />
                  +
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold',fontSize:"1.5rem" }}>
                  Hours Saved
                </Typography>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', fontSize:"2rem" }}>
                  <CountUp start={0} end={10000} duration={2} />+
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Front Image */}
          <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={frontImage}
              alt="main"
              style={{
                width: '90%',
                height: "360px",
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                transition: 'transform 0.3s ease',
              }}
              loading="eager"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Header;


