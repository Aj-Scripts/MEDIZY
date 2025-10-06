import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import heroImage from "../assets/hero.jpeg";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    { icon: <ScheduleIcon sx={{ fontSize: 40 }} />, title: 'Quick Booking', description: 'Book appointments instantly with real-time availability checks and immediate confirmations.', color: '#2196f3' },
    { icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />, title: 'Quality Healthcare', description: 'Access top-rated doctors and specialists with verified credentials and extensive experience.', color: '#4caf50' },
    { icon: <MedicationIcon sx={{ fontSize: 40 }} />, title: 'Digital Prescriptions', description: 'Receive and manage digital prescriptions securely, with easy access to your medical history.', color: '#ff9800' },
    { icon: <VerifiedUserIcon sx={{ fontSize: 40 }} />, title: 'Secure Platform', description: 'Your health data is protected with enterprise-grade security and HIPAA-compliant systems.', color: '#f44336' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        color: 'white',
        minHeight: { xs: 'auto', md: '75vh' },
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
          zIndex: 1,
        },
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <Container maxWidth="lg" sx={{ py: { xs: 10, md: 15 }, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  Your Health Journey Starts Here
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '800px' }}>
                  Experience healthcare simplified. Book appointments with top doctors, manage your medical records, and access care from anywhere.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Button variant="contained" size="large" onClick={() => navigate('/signup')} sx={{ bgcolor: 'white', color: 'primary.dark', px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'grey.100', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>
                    Get Started Now
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => navigate('/doctors')} endIcon={<ArrowForwardIcon />} sx={{ borderColor: 'white', borderWidth: 2, color: 'white', px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>
                    Find Doctors
                  </Button>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: { xs: 3, md: 6 }, mt: 6, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  {[
                    { number: '1000+', label: 'Verified Doctors' },
                    { number: '50k+', label: 'Happy Patients' },
                    { number: '4.8', label: 'User Rating' },
                  ].map((stat, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>{stat.number}</Typography>
                      <Typography variant="body2" sx={{ color: 'grey.200', fontWeight: 500 }}>{stat.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box component="img" src={heroImage} alt="Healthcare Professional" sx={{ width: '100%', maxWidth: 500, height: 'auto', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.2))', transform: 'scale(1.1)', borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 800, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Why Choose Medizy?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontWeight: 'normal' }}>
              Experience healthcare like never before with our innovative platform
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ maxWidth: { xs: '100%', md: '90%', lg: '1200px' }, mx: 'auto', justifyContent: 'center', px: { xs: 2, md: 4 } }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
                <Paper elevation={4} sx={{ p: 4, height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '280px', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', '& .feature-icon': { transform: 'scale(1.1) rotate(5deg)', color: feature.color } } }}>
                  <Box className="feature-icon" sx={{ mb: 3, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, bgcolor: alpha(feature.color, 0.1), color: alpha(feature.color, 0.8), transition: 'all 0.3s ease' }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: feature.color, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{feature.title}</Typography>
                  <Typography variant="body1" sx={{ color: alpha(theme.palette.text.primary, 0.7), lineHeight: 1.7, maxWidth: '90%', mx: 'auto' }}>{feature.description}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Get Started CTA */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' } }}>Ready to Get Started?</Typography>
            <Typography variant="h6" sx={{ mb: 4, maxWidth: 600, mx: 'auto', color: 'grey.200', fontWeight: 'normal' }}>
              Join thousands of satisfied patients. Book your first appointment today.
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/signup')} sx={{ px: 6, py: 2, bgcolor: 'white', color: 'primary.dark', fontSize: '1.2rem', fontWeight: 600, textTransform: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'grey.100', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>
              Create Free Account
            </Button>
          </Box>
        </Container>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </Box>

      <Footer />
    </Box>
  );
};

export default LandingPage;