import React, { useState } from 'react';
import { Box, Grid, Typography, TextField, Button, Paper } from '@mui/material';
import { FaPhoneSquareAlt } from 'react-icons/fa';
import { IoMail, IoLocation } from 'react-icons/io5';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';

// Marker icon for leaflet
const markerIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = { name: '', email: '' };

    // Validate Name - No numbers or special characters except spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = 'Name cannot contain numbers or special characters';
      isValid = false;
    }

    // Validate Email - Must be a valid Gmail address
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid Gmail address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    // Handle form submission logic here (e.g., API call)
    // console.log('Form submitted:', formData);

    // Reset form fields
    setFormData({ name: '', email: '', message: '' });
  };

  // OpenStreetMap center position (for example, Delhi, India)
  const mapCenter = { lat: 28.6139, lng: 77.2090 }; // Coordinates for Delhi, India

  return (
    <Box sx={{ padding: '2rem',marginTop:'3rem' }}>
      <Grid container spacing={4}>
        {/* Left Side: Company Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: '2rem' }}>
            <Typography variant="h4" sx={{ marginBottom: '1rem' }}>
              Contact Information
            </Typography>
            <Typography variant="h6">Phone</Typography>
            <Typography variant="body1" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
              <span><FaPhoneSquareAlt /></span> <span>+91 8510001805</span>
            </Typography>

            <Typography variant="h6" sx={{ marginTop: '1rem' }}>
              Email
            </Typography>
            <Typography variant="body1" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
                <a href="mailto:s.mehra.sh@gmail.com" style={{ textDecoration: 'none', color: 'inherit' }}>
                 <span><IoMail/></span>  <span> s.mehra.sh@gmail.com</span>
                </a>
            </Typography>

            <Typography variant="h6" sx={{ marginTop: '1rem' }}>
              Location
            </Typography>
            <Typography variant="body1" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
              <span><IoLocation /></span> <span>Delhi, India</span>
            </Typography>
          </Paper>
        </Grid>

        {/* Right Side: Contact Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: '2rem' }}>
            <Typography variant="h4" sx={{ marginBottom: '1rem' }}>
              Contact Us
            </Typography>

            <form onSubmit={handleSubmit}>
              {/* Your Name */}
              <TextField
                fullWidth
                label="Your Name"
                variant="outlined"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ marginBottom: '1rem' }}
                required
                error={!!errors.name}
                helperText={errors.name}
              />

              {/* Your Email */}
              <TextField
                fullWidth
                label="Your Email"
                variant="outlined"
                name="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ marginBottom: '1rem' }}
                required
                type="email"
                error={!!errors.email}
                helperText={errors.email}
              />

              {/* Message */}
              <TextField
                fullWidth
                label="Message"
                variant="outlined"
                name="message"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ marginBottom: '1rem' }}
                required
              />

              <Button variant="contained" color="primary" type="submit" fullWidth>
                Send Message
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* OpenStreetMap Section */}
      <Grid container spacing={4} sx={{ marginTop: '2rem' }}>
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ marginBottom: '1rem' }}>
            Our Location
          </Typography>
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapCenter} icon={markerIcon}>
              <Popup>
                <span>Our office is located here</span>
              </Popup>
            </Marker>
          </MapContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactSection;
