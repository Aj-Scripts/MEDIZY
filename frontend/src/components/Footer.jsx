import { Box, Grid, Typography, Link, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
        width: '100%',
      }}
    >
      <Box sx={{ px: { xs: 3, md: 8 } }}>
        <Grid container spacing={4}>
          {/* Left Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospitalIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Medizy</Typography>
            </Box>
            <Typography variant="body2">
              Your trusted healthcare partner, providing convenient and accessible 
              medical consultations with qualified doctors.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">Home</Link>
              <Link href="/about" color="inherit" underline="hover">About Us</Link>
              <Link href="/doctors" color="inherit" underline="hover">Find Doctors</Link>
              <Link href="/contact" color="inherit" underline="hover">Contact Us</Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">123 Medical Center, Healthcare City</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">+1 (555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">info@medizy.com</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2">
            © 2024 Medizy. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" color="inherit" underline="hover">Privacy Policy</Link>
            <Link href="#" color="inherit" underline="hover">Terms of Service</Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
