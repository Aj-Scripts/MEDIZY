import {
  Container,
  Typography,
  Box,
  Card,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkIcon from "@mui/icons-material/Work";

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        {/* Wrap everything in a "big box" for consistent layout */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ mb: 3, fontWeight: "bold" }}
            >
              Contact Us
            </Typography>
            <Typography variant="h6" color="text.secondary">
              We'd love to hear from you. Get in touch with us for any questions or support.
            </Typography>
          </Box>

          {/* Top Section: Contact Info + Form */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 4,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Left: Info Cards */}
            <Box
              sx={{
                flex: 1,
                minWidth: 340,
                maxWidth: "600px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Location */}
              <Card sx={{ p: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationOnIcon sx={{ fontSize: 30, color: "primary.main", mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Our Location
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  123 Medical Center Drive
                  <br />
                  Healthcare City, HC 12345
                  <br />
                  United States
                </Typography>
              </Card>

              {/* Phone */}
              <Card sx={{ p: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PhoneIcon sx={{ fontSize: 30, color: "primary.main", mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Phone Numbers
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  General: +1 (555) 123-4567
                  <br />
                  Emergency: +1 (555) 911-0000
                  <br />
                  Support: +1 (555) 456-7890
                </Typography>
              </Card>

              {/* Email */}
              <Card sx={{ p: 5}}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmailIcon sx={{ fontSize: 30, color: "primary.main", mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Email Addresses
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  General: info@medizy.com
                  <br />
                  Support: support@medizy.com
                  <br />
                  Careers: careers@medizy.com
                </Typography>
              </Card>
            </Box>

            {/* Right: Contact Form */}
            <Box sx={{ flex: 1, minWidth: 340, maxWidth: "600px"  }}>
              <Card
                sx={{
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
                >
                  Send us a Message
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      variant="outlined"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      variant="outlined"
                      required
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    required
                  />

                  <TextField fullWidth label="Phone Number" variant="outlined" />
                  <TextField fullWidth label="Subject" variant="outlined" required />
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    variant="outlined"
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    Send Message
                  </Button>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Bottom Section: Office Hours & Careers */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              mt: 6,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Office Hours */}
            <Box sx={{ flex: 1, minWidth: 340, maxWidth: "600px", display: "flex" }}>
              <Card
                sx={{
                  p: 4,
                  flex: 1,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <AccessTimeIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                    Office Hours
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Monday - Friday: 8:00 AM - 8:00 PM
                    <br />
                    Saturday: 9:00 AM - 5:00 PM
                    <br />
                    Sunday: 10:00 AM - 4:00 PM
                    <br />
                    <strong>24/7 Emergency Support Available</strong>
                  </Typography>
                </Box>
              </Card>
            </Box>

            {/* Career Opportunities */}
            <Box sx={{ flex: 1, minWidth: 340, maxWidth: "600px", display: "flex" }}>
              <Card
                sx={{
                  p: 4,
                  flex: 1,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <WorkIcon sx={{ fontSize: 60, color: "secondary.main", mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                    Career Opportunities
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Join our team of healthcare professionals and technology experts.
                    We're always looking for talented individuals who share our passion
                    for improving healthcare.
                  </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Button variant="outlined" size="large">
                    View Open Positions
                  </Button>
                </Box>
              </Card>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default ContactPage;
