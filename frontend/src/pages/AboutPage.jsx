import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import PersonalVideoIcon from '@mui/icons-material/PersonalVideo';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const AboutPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            About Medizy
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            We're on a mission to make healthcare accessible, convenient, and
            personalized for everyone. Our platform connects patients with
            qualified doctors, streamlining the appointment booking process and
            enhancing the overall healthcare experience.
          </Typography>
        </Box>

        {/* Mission & Vision */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {[ 
            {
              icon: <FavoriteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
              title: 'Our Mission',
              description: `To revolutionize healthcare accessibility by providing a seamless digital platform 
                            that connects patients with healthcare providers. We strive to eliminate barriers 
                            to quality medical care through technology, making it easier for people to manage 
                            their health and well-being.`,
            },
            {
              icon: <TrendingUpIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />,
              title: 'Our Vision',
              description: `To become the leading healthcare platform that empowers individuals to take control 
                            of their health journey. We envision a future where quality healthcare is accessible 
                            to all, supported by innovative technology and compassionate care.`,
            }
          ].map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 4
              }}>
                {section.icon}
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {section.title}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {section.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Why Choose Us */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            Why Choose Medizy?
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {[
            {
              icon: <AccessTimeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
              title: 'Efficiency',
              description: `Streamlined booking process with real-time availability, instant confirmations, 
                            and automated reminders. Save time with our efficient appointment management system.`,
            },
            {
              icon: <PersonalVideoIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />,
              title: 'Convenience',
              description: `Book appointments anytime, anywhere with our user-friendly platform. 
                            Access your health records, manage appointments, and communicate with doctors easily.`,
            },
            {
              icon: <GroupsIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />,
              title: 'Personalization',
              description: `Tailored healthcare experience based on your needs, preferences, and medical history. 
                            Get personalized doctor recommendations and customized care plans.`,
            }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 4
                }}
              >
                {item.icon}
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {item.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Statistics Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            Trusted by No one
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              { number: '0', label: 'Qualified Doctors' },
              { number: '-10', label: 'Happy Patients' },
              { number: '0', label: 'Appointments Booked' },
              { number: '0', label: 'Medical Specialties' },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.number}
                </Typography>
                <Typography variant="h6">{stat.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default AboutPage;
