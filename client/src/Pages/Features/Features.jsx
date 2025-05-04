import React from 'react';
import { Box, Grid, Typography, Paper, Button, Divider, Link } from '@mui/material';
import { FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import '../../../node_modules/swiper/swiper-bundle.min.css';
import Footer from '../../components/Footer';
import { FaSync } from "react-icons/fa";
import { GrAnalytics } from 'react-icons/gr';
import { ImEnlarge } from "react-icons/im";
import { NavLink } from 'react-router-dom';
const Features = () => {
  return (
    <Box sx={{ background: 'inherit', padding: '4rem 0' }}>
      <Grid container spacing={4} sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Feature 1: Time Management */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Paper elevation={3} sx={{ padding: '2rem', backgroundColor: 'inherit', textAlign: 'start',borderRadius:"15px" }}>
                 <FaSync
                  style={{
                    fontSize: "30px",
                  }}
                />
              <Typography variant="h6" sx={{ marginTop: '1rem',fontSize:"1.4rem" }}>Syncing & Automation</Typography>
              <Typography variant="body2" sx={{ marginTop: '1rem',fontSize:"0.8rem" }}>
                Streamline your workflow with automated processes and syncing between team members, reducing manual work and errors.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>

        {/* Feature 2: Collaboration */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Paper elevation={3} sx={{ padding: '2rem', backgroundColor: 'inherit', textAlign: 'start',borderRadius:"15px" }}>
             <GrAnalytics
                  style={{
                    fontSize: "30px",
                    
                  }}
                />
              <Typography variant="h6" sx={{ marginTop: '1rem',fontSize:"1.4rem" }}>Performance Analytics</Typography>
              <Typography variant="body2" sx={{ marginTop: '1rem',fontSize:"0.8rem" }}>
                  Get actionable insights with performance tracking and analytics to ensure maximum efficiency for your team and organization.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>

        {/* Feature 3: Task Management */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Paper elevation={3} sx={{ padding: '2rem', backgroundColor: 'inherit', textAlign: 'start',borderRadius:"15px" }}>
             <ImEnlarge
                  style={{
                    fontSize: "30px",
                  }}
                />
              <Typography variant="h6" sx={{ marginTop: '1rem',fontSize:"1.4rem" }}>Scalability</Typography>
              <Typography variant="body2" sx={{ marginTop: '1rem',fontSize:"0.8rem" }}>
              Whether you're a small team or a large enterprise, Worksphere scales with your business and helps you stay organized.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ margin: '2rem 0', backgroundColor: 'inherit' }} />

      {/* Impact Section */}
      <Typography variant="h4" align="center" sx={{ color: 'white', marginBottom: '2rem' }}>
        How Worksphere Improves Your Efficiency
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Swiper spaceBetween={50} slidesPerView={3} loop={true}>
          <SwiperSlide>
            <Paper sx={{ padding: '2rem', backgroundColor: 'inherit' }}>
              <Typography variant="h6">Improved Task Completion</Typography>
              <Typography variant="body2" sx={{ marginTop: '1rem' }}>
                By automating repetitive tasks, Worksphere accelerates project timelines and improves outcomes.
              </Typography>
            </Paper>
          </SwiperSlide>
          <SwiperSlide>
            <Paper sx={{ padding: '2rem', backgroundColor: 'inherit' }}>
              <Typography variant="h6">Effective Communication</Typography>
              <Typography variant="body2" sx={{ marginTop: '1rem' }}>
                Centralize team communication for better clarity and faster decision-making.
              </Typography>
            </Paper>
          </SwiperSlide>
          <SwiperSlide>
            <Paper sx={{ padding: '2rem', backgroundColor: 'inherit' }}>
              <Typography variant="h6">Real-Time Collaboration</Typography>
              <Typography variant="body2" sx={{ marginTop: '1rem' }}>
                Collaborate with your team in real-time, eliminating delays in project completion.
              </Typography>
            </Paper>
          </SwiperSlide>
        </Swiper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <Button variant="contained" color="primary" size="large">
         <NavLink to="/signup" style={{color:"white",textDecoration:"none"}}>
            Get Started with Worksphere
         </NavLink>
        </Button>
      </Box>
      <Footer/>
    </Box>
  );
};

export default Features;

