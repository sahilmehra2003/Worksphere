import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Box, Typography, Grid, Container, Divider } from '@mui/material';
import Footer from '../../components/Footer';
import 'react-lazy-load-image-component/src/effects/blur.css';
import stockImage from '../../assets/worksphere_stock_image.jpg'
import missionImage from '../../assets/mission.jpg'
import goals from '../../assets/goals.jpg'
const About = () => {
  return (
    <Box sx={{ padding: '2rem 0', marginTop: '2rem' }}>
      <Container>
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: 'bold', marginBottom: '2rem' }}
        >
          Empowering Teams, Redefining Collaboration
        </Typography>

        <Grid container spacing={4} sx={{ marginBottom: '4rem' }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                What is Worksphere?
              </Typography>
              <Typography variant="body1">
                Worksphere is a cutting-edge platform designed to streamline workplace collaboration, enhance project
                management, and boost team productivity.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', backgroundColor: 'inherit', borderRadius: '20px' }}>
              <LazyLoadImage
                src={stockImage}
                alt="Worksphere Stock"
                width="100%"
                height="100%"
                effect="blur"
                style={{borderRadius:"16px"}}
                loading='eager'
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ marginBottom: '4rem' }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', backgroundColor: 'inherit', borderRadius: '20px' }}>
              <LazyLoadImage
                src={goals}
                alt="Goals"
                width="100%"
                height="100%"
                effect="blur"
                style={{borderRadius:"16px",objectFit:"cover"}}
                loading='eager'
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                Our Mission
              </Typography>
              <Typography variant="body1">
                At Worksphere, our mission is to empower businesses to achieve more by fostering seamless collaboration.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ height: '300px', backgroundColor: 'inherit', borderRadius: '8px', marginTop: '2rem',display:"flex",justifyContent:"center" }}>
          <LazyLoadImage
            src={missionImage}
            alt="Mission"
            width="900px"
            height="300px"
            effect="blur"
            style={{borderRadius:"16px"}}
            loading='lazy'
          />
        </Box>
      </Container>
      <Footer/>
    </Box>
  );
};

export default About;
