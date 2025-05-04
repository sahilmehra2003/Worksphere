import React from 'react';
import { Box, Grid, Typography, Link, Divider } from '@mui/material';
import { FaPhoneSquareAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { IoLogoLinkedin, IoLogoInstagram, IoLogoFacebook, IoLogoTwitter } from 'react-icons/io5';
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: 'inherit', padding: '2rem 0' }}>
      <Grid container spacing={4} sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* First Column: Brief description of Worksphere */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            About Worksphere
          </Typography>
          <Typography variant="body2" sx={{ marginTop: '1rem' }}>
            Worksphere is a powerful platform that connects teams and clients, helping businesses stay organized and productive. Our goal is to streamline project management and improve collaboration.
          </Typography>
        </Grid>

        {/* Second Column: Important Navlinks */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Quick Links
          </Typography>
          <Box sx={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                color: 'white',
                textDecoration: 'none',
                marginBottom: '0.5rem',
                ...(isActive ? { color: 'inherit' } : {}),
              })}
              onMouseEnter={(e) => e.target.style.color = 'purple'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              style={({ isActive }) => ({
                color: 'white',
                textDecoration: 'none',
                marginBottom: '0.5rem',
                ...(isActive ? { color: 'inherit' } : {}),
              })}
              onMouseEnter={(e) => e.target.style.color = 'purple'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              About
            </NavLink>
            <NavLink
              to="/features"
              style={({ isActive }) => ({
                color: 'white',
                textDecoration: 'none',
                marginBottom: '0.5rem',
                ...(isActive ? { color: 'inherit' } : {}),
              })}
              onMouseEnter={(e) => e.target.style.color = 'purple'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              Features
            </NavLink>
            <NavLink
              to="/contact"
              style={({ isActive }) => ({
                color: 'white',
                textDecoration: 'none',
                marginBottom: '0.5rem',
                ...(isActive ? { color: 'inherit' } : {}),
              })}
              onMouseEnter={(e) => e.target.style.color = 'purple'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              Contact Us
            </NavLink>
          </Box>
        </Grid>

        {/* Third Column: Contact Info */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Contact Info
          </Typography>
          <Box sx={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FaPhoneSquareAlt /> Phone
            </Typography>
            <Typography variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
              <FaEnvelope /> Contact Us
            </Typography>
            <Typography variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
              <FaMapMarkerAlt /> Delhi, India
            </Typography>
          </Box>
        </Grid>

        {/* Fourth Column: Social Media Links */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Follow Us
          </Typography>
          <Box sx={{ marginTop: '1rem', display: 'inline-flex', gap: '16px' }}>
            <Link href="https://www.linkedin.com" target="_blank" sx={{ color: 'inherit' }}>
              <IoLogoLinkedin size={30} />
            </Link>
            <Link href="https://www.instagram.com" target="_blank" sx={{ color: 'inherit' }}>
              <IoLogoInstagram size={30} />
            </Link>
            <Link href="https://www.facebook.com" target="_blank" sx={{ color: 'inherit' }}>
              <IoLogoFacebook size={30} />
            </Link>
            <Link href="https://www.twitter.com" target="_blank" sx={{ color: 'inherit' }}>
              <IoLogoTwitter size={30} />
            </Link>
          </Box>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ margin: '2rem 0', backgroundColor: '#ddd' }} />

      <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
        © {new Date().getFullYear()} Worksphere. All Rights Reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

