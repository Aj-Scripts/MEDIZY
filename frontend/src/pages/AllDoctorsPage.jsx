import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Skeleton,
  Rating,
  Paper,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAuth } from '../contexts/AuthContext';
import { formatSchedule } from '../utils/scheduleFormatter';
import { getImageUrl } from '../utils/imageUrl';

const AllDoctorsPage = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        const doctorsData = res.data.map(doc => ({
          id: doc._id,
          name: doc.user.name,
          specialty: doc.user.specialization || 'General',
          experience: doc.experienceYears || 0,
          fees: doc.fees || 0,
          rating: doc.rating || 5,
          image: doc.user.image || '/default-doctor.png',
          description: doc.qualifications || '',
          schedule: doc.schedule ? Object.fromEntries(Object.entries(doc.schedule).map(([day, slots]) => [
            day,
            Array.isArray(slots) ? slots : []
          ])) : {}
        }));

        setDoctors(doctorsData);

        const uniqueSpecialties = [...new Set(doctorsData.map(d => d.specialty))];
        setSpecialties(uniqueSpecialties);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };

    fetchDoctors();
  }, [api]);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === '' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}
        >
          Find Your Doctor
        </Typography>

        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 6,
            py: 4,
            px: 3,
            borderRadius: 2,
            background: 'linear-gradient(45deg, #E3F2FD 30%, #E1F5FE 90%)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 800,
              textAlign: 'center',
              color: 'primary.dark',
            }}
          >
            Find the Right Doctor for You
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              textAlign: 'center',
              color: 'text.secondary',
              fontWeight: 'normal',
            }}
          >
            Connect with top healthcare professionals in your area
          </Typography>

          {/* Search and Filter */}
          <Box
            component={Paper}
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by doctor name or specialty"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.light',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                      bgcolor: 'grey.50',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    displayEmpty
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                      bgcolor: 'grey.50',
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">All Specialties</MenuItem>
                    {specialties.map((specialty) => (
                      <MenuItem key={specialty} value={specialty}>
                        {specialty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Active Filters */}
        {(searchTerm || selectedSpecialty) && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip
                label={`Search: ${searchTerm}`}
                onDelete={() => setSearchTerm('')}
                color="primary"
                variant="outlined"
              />
            )}
            {selectedSpecialty && (
              <Chip
                label={`Specialty: ${selectedSpecialty}`}
                onDelete={() => setSelectedSpecialty('')}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Results Count */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
          </Typography>
          <Tooltip title="Sort by rating">
            <IconButton color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Doctors Grid */}
        <Grid container spacing={3}>
          {filteredDoctors.map((doctor) => (
            <Grid item xs={12} md={6} lg={4} key={doctor.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={getImageUrl(doctor.image)}
                    alt={doctor.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  {doctor.rating >= 4.5 && (
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Top Rated"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(25, 118, 210, 0.95)',
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Dr. {doctor.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating
                        value={doctor.rating}
                        readOnly
                        precision={0.5}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({doctor.rating})
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={doctor.specialty}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={`${doctor.experience}+ years exp.`}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {doctor.description.length > 120
                      ? `${doctor.description.substring(0, 120)}...`
                      : doctor.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                    >
                      <EventAvailableIcon fontSize="small" />
                      Available Times
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Object.entries(doctor.schedule)
                        .filter(([day, slots]) => slots.length > 0)
                        .slice(0, 3)
                        .map(([day, slots]) => (
                          <Chip
                            key={day}
                            label={`${day.slice(0, 3)}: ${slots.length} slots`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Consultation Fee
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        ₹{doctor.fees}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/doctor/${doctor.id}`)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      Book Appointment
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredDoctors.length === 0 && (
          <Paper
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 2,
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No doctors found matching your criteria
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search filters or browse all available doctors
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('');
              }}
            >
              Clear Filters
            </Button>
          </Paper>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default AllDoctorsPage;