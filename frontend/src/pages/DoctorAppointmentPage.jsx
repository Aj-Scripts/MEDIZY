import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, CardMedia, Button,
  FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, Alert, Chip,
  Snackbar
} from '@mui/material';
import DoctorRating from '../components/DoctorRating';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../contexts/AuthContext';
import { formatSchedule, getDaySchedule } from '../utils/scheduleFormatter';
import { getImageUrl } from '../utils/imageUrl';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import dayjs from 'dayjs';

const DoctorAppointmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleRatingSubmit = async (rating, review) => {
    try {
      console.log('Submitting rating:', { doctorId: id, rating, review });
      
      const res = await api.post('/ratings', {
        doctorId: doctor.id,
        rating: Number(rating),
        review: review || ''
      });
      
      console.log('Rating response:', res.data);
      
      setDoctor(prev => ({
        ...prev,
        rating: res.data.doctorRating,
        ratingCount: res.data.ratingCount
      }));

      setSnack({ 
        open: true, 
        message: 'Rating submitted successfully', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setSnack({ 
        open: true, 
        message: err.response?.data?.message || 'Failed to submit rating', 
        severity: 'error' 
      });
      throw err;
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/doctors/${id}`);
        const doc = res.data;
        
        setDoctor({
          id: doc._id,
          _id: doc._id,
          userId: doc.user?._id,
          name: doc.user?.name || 'Unknown',
          specialty: doc.user?.specialization || 'General',
          experience: doc.experienceYears || 0,
          fees: doc.fees || 0,
          rating: doc.rating || 5,
          ratingCount: doc.ratingCount || 0,
          image: doc.user?.image || '/default-doctor.png',
          description: doc.qualifications || '',
          schedule: doc.schedule || {},
          formattedSchedule: formatSchedule(doc.schedule || {}),
        });

        const allDoctorsRes = await api.get('/doctors');
        const related = allDoctorsRes.data
          .filter(d => d._id !== doc._id && d.user?.specialization === doc.user?.specialization)
          .slice(0, 2);
        
        setRelatedDoctors(related.map(d => ({
          id: d._id,
          userId: d.user?._id,
          name: d.user?.name || 'Unknown',
          specialty: d.user?.specialization || 'General',
          experience: d.experienceYears || 0,
          fees: d.fees || 0,
          rating: d.rating || 5,
          image: d.user?.image || '/default-doctor.png',
        })));
      } catch (err) {
        console.error('Failed to fetch doctor:', err);
        alert('Failed to fetch doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, api]);

  const handleBookAppointment = async () => {
    if (!user) {
      alert('Please login to book an appointment');
      navigate('/login');
      return;
    }
    if (!selectedDate || !selectedTime || !paymentMode) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await api.post('/appointments', {
        doctorId: doctor.userId || doctor.id,
        date: selectedDate.format('YYYY-MM-DD'),
        time: selectedTime,
        paymentMode,
        amount: doctor.fees,
      });
      alert('Appointment booked successfully!');
      navigate('/patient-dashboard');
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography>Loading...</Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
          <Alert severity="error">Doctor not found</Alert>
          <Button variant="contained" onClick={() => navigate('/doctors')} sx={{ mt: 2 }}>
            Back to Doctors
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Grid container spacing={4}>
          {/* Doctor Info */}
          <Grid item xs={12} md={6}>
            <Card elevation={4}>
              <CardMedia component="img" height="350" image={getImageUrl(doctor.image)} alt={doctor.name} />
              <CardContent>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>{doctor.name}</Typography>
                <Chip label={doctor.specialty} color="primary" sx={{ mb: 2, py: 2 }} />
                {/* Rating component */}
                <Box sx={{ mb: 2 }}>
                  <DoctorRating
                    doctorId={doctor._id}
                    currentRating={doctor.rating}
                    ratingCount={doctor.ratingCount || 0}
                    onRatingSubmit={handleRatingSubmit}
                    disabled={!user || user.role !== 'patient'}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body1" color="text.secondary">{doctor.experience} years experience</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="body1" color="text.secondary">
                    Available: {Object.entries(doctor.schedule)
                      .filter(([day, slots]) => slots.length > 0)
                      .map(([day, slots]) => (
                        `${day.slice(0,3)}: ${slots.map(slot => {
                          const [start, end] = slot.split('-');
                          const startTime = new Date(`2000-01-01T${start}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          });
                          const endTime = new Date(`2000-01-01T${end}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          });
                          return `${startTime}-${endTime}`;
                        }).join(', ')}`)
                      ).join(' | ')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3 }}>{doctor.description}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AttachMoneyIcon color="primary" />
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>₹{doctor.fees}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Form */}
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Book Appointment</Typography>
              {!user && <Alert severity="warning" sx={{ mb: 3 }}>Please login to book an appointment</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  minDate={dayjs()}
                  disabled={!user}
                />
                <FormControl fullWidth disabled={!user || !selectedDate}>
                  <InputLabel>Select Time</InputLabel>
                  <Select 
                    value={selectedTime} 
                    label="Select Time" 
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    {selectedDate && doctor.schedule[selectedDate.format('dddd')]?.sort().map((slot) => {
                      const [start, end] = slot.split('-');
                      const startTime = new Date(`2000-01-01T${start}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      });
                      const endTime = new Date(`2000-01-01T${end}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      });
                      return (
                        <MenuItem key={slot} value={slot}>
                          {startTime} - {endTime}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {selectedDate && (!doctor.schedule[selectedDate.format('dddd')] || doctor.schedule[selectedDate.format('dddd')].length === 0) && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      No time slots available for {selectedDate.format('dddd')}
                    </Typography>
                  )}
                </FormControl>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Payment Mode</Typography>
                  <RadioGroup value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <FormControlLabel value="cash" control={<Radio />} label="Cash Payment" disabled={!user} />
                    <FormControlLabel value="stripe" control={<Radio />} label="Credit/Debit Card (Stripe)" disabled={!user} />
                    <FormControlLabel value="razorpay" control={<Radio />} label="Online Payment (Razorpay)" disabled={!user} />
                  </RadioGroup>
                </Box>

                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth 
                  onClick={handleBookAppointment} 
                  disabled={!user || !selectedDate || !selectedTime || !paymentMode}
                >
                  Book Appointment - ₹{doctor.fees}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Related Doctors */}
        {relatedDoctors.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Related Doctors - {doctor.specialty}
            </Typography>
            <Grid container spacing={3}>
              {relatedDoctors.map((rd) => (
                <Grid item xs={12} md={6} key={rd.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { transform: 'translateY(-2px)' }, 
                      transition: 'transform 0.2s' 
                    }} 
                    onClick={() => navigate(`/doctor/${rd.id}`)}
                  >
                    <Box sx={{ display: 'flex' }}>
                      <CardMedia 
                        component="img" 
                        sx={{ width: 120 }} 
                        image={getImageUrl(rd.image)} 
                        alt={rd.name}
                      />
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {rd.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <StarIcon sx={{ color: 'orange', fontSize: 16 }} />
                          <Typography variant="body2">
                            {rd.rating} • {rd.experience} yrs
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          ₹{rd.fees}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
      <Footer />

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
        message={snack.message}
      />
    </Box>
  );
};

export default DoctorAppointmentPage;