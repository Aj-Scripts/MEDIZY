import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Alert,
  Paper,
  LinearProgress,
  Divider
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

const PatientDashboard = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [userAppointments, setUserAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rescheduleDialog, setRescheduleDialog] = useState({ open:false, id:null, date:'', time:'' });
  const [rescheduleOptions, setRescheduleOptions] = useState({ dates: [], times: [] });

  // Appointment card styles
  const appointmentCardStyles = {
    root: {
      mb: 2,
      borderRadius: 2,
      transition: 'all 0.3s ease',
      bgcolor: 'white',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    },
    confirmed: {
      borderLeft: '4px solid #4caf50'
    },
    pending: {
      borderLeft: '4px solid #ff9800'
    },
    cancelled: {
      borderLeft: '4px solid #f44336'
    },
    completed: {
      borderLeft: '4px solid #1976d2'
    }
  };

  const healthTips = [
    "Stay hydrated — drink at least 8 glasses of water daily.",
    "Get 30 minutes of exercise at least 5 days a week.",
    "Sleep 7–8 hours to keep your immune system strong.",
    "Eat more fruits and vegetables for a balanced diet.",
    "Schedule regular health check-ups to stay proactive."
  ];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch appointments
        const appointmentsRes = await api.get(`/appointments?patientId=${user._id}`);
        console.log('Appointments fetched:', appointmentsRes.data);
        setUserAppointments(appointmentsRes.data);

        // Find upcoming confirmed appointment
        const confirmed = appointmentsRes.data
          .filter((apt) => apt.status === 'confirmed')
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setUpcomingAppointment(confirmed[0] || null);

        // Fetch all doctors for reference
        const doctorsRes = await api.get('/doctors');
        console.log('Doctors fetched:', doctorsRes.data);
        setDoctors(doctorsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        console.error('Error details:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Health tip rotation
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [user, api]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const getDoctorName = (appointment) => {
    // Case 1: doctor field is populated with full object
    if (appointment.doctor && typeof appointment.doctor === 'object' && appointment.doctor.name) {
      return appointment.doctor.name;
    }
    
    // Case 2: doctor field is populated with user sub-object
    if (appointment.doctor && typeof appointment.doctor === 'object' && appointment.doctor.user?.name) {
      return appointment.doctor.user.name;
    }
    
    // Case 3: doctor field is just an ID (string)
    if (appointment.doctor && typeof appointment.doctor === 'string') {
      const doctor = doctors.find(d => d._id === appointment.doctor);
      return doctor?.user?.name || 'Unknown Doctor';
    }
    
    // Case 4: Check _id inside doctor object
    if (appointment.doctor?._id) {
      const doctor = doctors.find(d => d._id === appointment.doctor._id);
      return doctor?.user?.name || 'Unknown Doctor';
    }
    
    return 'Unknown Doctor';
  };

  const getDoctorImage = (appointment) => {
    // Case 1: doctor field is populated with user sub-object
    if (appointment.doctor?.user?.image) {
      return appointment.doctor.user.image;
    }
    
    // Case 2: doctor field is just an ID
    if (appointment.doctor && typeof appointment.doctor === 'string') {
      const doctor = doctors.find(d => d._id === appointment.doctor);
      return doctor?.user?.image || '/default-doctor.png';
    }
    
    // Case 3: Check _id inside doctor object
    if (appointment.doctor?._id) {
      const doctor = doctors.find(d => d._id === appointment.doctor._id);
      return doctor?.user?.image || '/default-doctor.png';
    }
    
    return '/default-doctor.png';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await api.patch(`/appointments/${appointmentId}`, { status: 'cancelled' });
      setUserAppointments(prev => prev.map(a => 
        a._id === appointmentId ? { ...a, status: 'cancelled' } : a
      ));
      alert('Appointment cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getAvailableTimesForDoctor = (doctorId) => {
    // FIXED: Check multiple ID formats to find the correct doctor
    const docProfile = doctors.find(d => 
      String(d._id) === String(doctorId) || 
      String(d.user?._id) === String(doctorId) ||
      String(d.user) === String(doctorId)
    );
    
    console.log('Looking for doctor with ID:', doctorId);
    console.log('Found doctor profile:', docProfile);
    console.log('Available doctors:', doctors.map(d => ({ id: d._id, userId: d.user?._id || d.user })));
    
    const timeSlots = {};
    
    if (docProfile?.availableSlots && docProfile.availableSlots.length) {
      console.log('Processing available slots:', docProfile.availableSlots);
      docProfile.availableSlots.forEach(slot => {
        try {
          if (!slot.date) {
            console.warn('Slot missing date:', slot);
            return;
          }
          // Try to parse the date safely
          const parsedDate = new Date(slot.date);
          if (isNaN(parsedDate.getTime())) {
            console.warn('Invalid date format:', slot.date);
            return;
          }
          const slotDate = parsedDate.toISOString().slice(0,10);
          if (!timeSlots[slotDate]) {
            timeSlots[slotDate] = [];
          }
          timeSlots[slotDate].push({
            from: slot.from,
            to: slot.to
          });
        } catch (err) {
          console.error('Error processing slot:', slot, err);
        }
      });
      console.log('Processed time slots:', timeSlots);
    } else {
      console.warn('No available slots found for doctor:', doctorId);
      console.warn('Doctor profile availableSlots:', docProfile?.availableSlots);
    }
    
    return timeSlots;
  };

  const handleReschedule = (appointmentId) => {
    // prepare available slots for this appointment's doctor
    const apt = userAppointments.find(a => a._id === appointmentId);
    
    // FIXED: Get the correct doctor ID
    let doctorId = apt?.doctor?._id || apt?.doctor;
    
    // If doctor is an object with user, try to get the Doctor model ID
    if (typeof apt?.doctor === 'object' && apt.doctor.user) {
      // Find the doctor profile by user ID
      const docProfile = doctors.find(d => 
        String(d.user?._id) === String(apt.doctor.user._id || apt.doctor.user) ||
        String(d._id) === String(apt.doctor._id)
      );
      if (docProfile) {
        doctorId = docProfile._id;
      }
    }
    
    console.log('Rescheduling appointment:', apt);
    console.log('Using doctor ID:', doctorId);
    
    const timeSlots = getAvailableTimesForDoctor(doctorId);
    const dates = Object.keys(timeSlots);
    const timesByDate = {};

    // Generate available time slots for each date
    dates.forEach(date => {
      const slots = timeSlots[date];
      const times = [];
      slots.forEach(slot => {
        const toMinutes = (t) => { const [hh,mm] = String(t).split(':'); return Number(hh)*60 + Number(mm); };
        const fromMin = toMinutes(slot.from);
        const toMin = toMinutes(slot.to);
        
        for (let m = fromMin; m <= toMin; m += 30) {
          const hh = String(Math.floor(m/60)).padStart(2,'0');
          const mm = String(m%60).padStart(2,'0');
          times.push(`${hh}:${mm}`);
        }
      });
      timesByDate[date] = Array.from(new Set(times));
    });

    setRescheduleOptions({ dates, times: [] , timesByDate });
    setRescheduleDialog({ open:true, id: appointmentId, date: dates[0] || '', time: '' });
  };

  const renderAvailableSlots = (doctorId) => {
    const timeSlots = getAvailableTimesForDoctor(doctorId);
    
    if (Object.keys(timeSlots).length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No available slots. Please contact the doctor to add availability.
        </Typography>
      );
    }
    
    return (
      <Box sx={{ mt: 1 }}>
        {Object.entries(timeSlots).map(([date, slots]) => (
          <Box key={date} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            {slots.map((slot, index) => (
              <Chip
                key={`${date}-${index}`}
                label={`${slot.from} - ${slot.to}`}
                size="small"
                sx={{ m: 0.5 }}
                variant="outlined"
              />
            ))}
          </Box>
        ))}
      </Box>
    );
  };

  const submitReschedule = async () => {
    try {
      const { id, date, time } = rescheduleDialog;
      if (!date) return alert('Please select a date');
      // submit a reschedule request to be accepted by admin/doctor
      const res = await api.post(`/appointments/${id}/reschedule`, { date, time });
      setUserAppointments(prev => prev.map(a => a._id === id ? res.data : a));
      setRescheduleDialog({ open:false, id:null, date:'', time:'' });
      alert('Reschedule request submitted. Doctor or admin will accept it.');
    } catch (err) {
      console.error('Reschedule failed', err);
      alert(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  const handleViewDetails = (appointmentId) => {
    alert('View details feature coming soon!');
  };

  // Analytics
  const totalSpent = useMemo(() => 
    userAppointments.reduce((sum, a) => sum + (a.amount || 0), 0), 
    [userAppointments]
  );

  const appointmentsByStatus = useMemo(() => ({
    completed: userAppointments.filter(a => a.status === 'completed').length,
    confirmed: userAppointments.filter(a => a.status === 'confirmed').length,
    pending: userAppointments.filter(a => a.status === 'pending').length,
    cancelled: userAppointments.filter(a => a.status === 'cancelled').length,
  }), [userAppointments]);

  const appointmentsByDoctor = useMemo(() => {
    const map = {};
    userAppointments.forEach(a => {
      const docName = getDoctorName(a);
      map[docName] = (map[docName] || 0) + 1;
    });
    return Object.entries(map).map(([doctor, count]) => ({ doctor, count }));
  }, [userAppointments, doctors]);

  const monthlyPayments = useMemo(() => {
    const map = {};
    userAppointments.forEach(a => {
      const month = new Date(a.date).toLocaleString('default', { month: 'short' });
      map[month] = (map[month] || 0) + (a.amount || 0);
    });
    return Object.keys(map).map(month => ({ month, amount: map[month] }));
  }, [userAppointments]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6">Loading...</Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Patient Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your appointments and health records
          </Typography>
        </Box>

        {/* Notification Bars */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          {upcomingAppointment && (
            <Alert
              icon={<NotificationsActiveIcon fontSize="inherit" />}
              severity="info"
              sx={{ 
                bgcolor: '#e3f2fd',
                borderLeft: '4px solid #1976d2',
                '& .MuiAlert-icon': { color: '#1976d2' }
              }}
            >
              Reminder: Appointment with <strong>{getDoctorName(upcomingAppointment)}</strong> on <strong>{upcomingAppointment.date}</strong> at <strong>{upcomingAppointment.time}</strong>.
            </Alert>
          )}
          <Alert 
            severity="success" 
            sx={{ 
              bgcolor: '#f1f8e9',
              borderLeft: '4px solid #4caf50',
              '& .MuiAlert-icon': { color: '#4caf50' }
            }}
          >
            Health Tip: {healthTips[tipIndex]}
          </Alert>
        </Stack>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              bgcolor: 'white',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                minHeight: 60
              },
              '& .Mui-selected': {
                color: '#1976d2 !important'
              },
              '& .MuiTabs-indicator': {
                height: 3,
                bgcolor: '#1976d2'
              }
            }}
          >
            <Tab 
              icon={<CalendarTodayIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
              label="Appointments" 
            />
            <Tab 
              icon={<AttachMoneyIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
              label="Analytics & Insights" 
            />
          </Tabs>
        </Paper>

        {/* Appointments Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {userAppointments.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No appointments found
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/doctors')}
                    sx={{
                      bgcolor: '#1976d2',
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      '&:hover': { bgcolor: '#1565c0' }
                    }}
                  >
                    Book Appointment
                  </Button>
                </Card>
              </Grid>
            ) : (
              userAppointments.map((appointment) => {
                // FIXED: Get the correct doctor ID for rendering slots
                let appointmentDoctorId = appointment.doctor?._id || appointment.doctor;
                if (typeof appointment.doctor === 'object' && appointment.doctor.user) {
                  const docProfile = doctors.find(d => 
                    String(d.user?._id) === String(appointment.doctor.user._id || appointment.doctor.user) ||
                    String(d._id) === String(appointment.doctor._id)
                  );
                  if (docProfile) {
                    appointmentDoctorId = docProfile._id;
                  }
                }
                
                return (
                  <Grid item xs={12} md={6} key={appointment._id}>
                    <Card 
                      sx={{
                        ...appointmentCardStyles.root,
                        ...(appointment.status === 'confirmed' && appointmentCardStyles.confirmed),
                        ...(appointment.status === 'pending' && appointmentCardStyles.pending),
                        ...(appointment.status === 'cancelled' && appointmentCardStyles.cancelled),
                        ...(appointment.status === 'completed' && appointmentCardStyles.completed),
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar 
                            src={getDoctorImage(appointment)} 
                            sx={{ width: 56, height: 56, mr: 2 }} 
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {getDoctorName(appointment)}
                            </Typography>
                            <Chip 
                              label={appointment.status} 
                              size="small"
                              color={getStatusColor(appointment.status)}
                              sx={{ 
                                textTransform: 'capitalize',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }} 
                            />
                          </Box>
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Date
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Time
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {appointment.time || 'Not specified'}
                            </Typography>
                          </Grid>
                          {appointment.tokenNumber && (
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Token #
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {appointment.tokenNumber}
                              </Typography>
                            </Grid>
                          )}
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Payment
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              ₹{appointment.amount || 0} ({appointment.paymentMode || 'Cash'})
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            Available Time Slots:
                          </Typography>
                          {renderAvailableSlots(appointmentDoctorId)}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {appointment.status === 'pending' && (
                            <>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancel(appointment._id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined"
                                startIcon={<EventIcon />}
                                onClick={() => handleReschedule(appointment._id)}
                                sx={{ textTransform: 'none', borderColor: '#1976d2', color: '#1976d2' }}
                              >
                                Reschedule
                              </Button>
                            </>
                          )}
                          <Button 
                            size="small" 
                            variant="contained"
                            startIcon={<InfoIcon />}
                            onClick={() => handleViewDetails(appointment._id)}
                            sx={{ 
                              textTransform: 'none',
                              bgcolor: '#1976d2',
                              '&:hover': { bgcolor: '#1565c0' }
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}

        {/* Analytics & Insights Tab */}
        {tabValue === 1 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2, 
                    bgcolor: '#e8f5e9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <AttachMoneyIcon sx={{ fontSize: 32, color: '#4caf50' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>₹{totalSpent}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2, 
                    bgcolor: '#fff3e0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <CalendarTodayIcon sx={{ fontSize: 32, color: '#ff9800' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {userAppointments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2, 
                    bgcolor: '#e3f2fd', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <PeopleIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {appointmentsByStatus.confirmed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Confirmed</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2, 
                    bgcolor: '#fff3e0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <AccessTimeIcon sx={{ fontSize: 32, color: '#ff9800' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {appointmentsByStatus.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </Card>
              </Grid>
            </Grid>

            {appointmentsByDoctor.length > 0 && (
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Appointments by Doctor</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={appointmentsByDoctor}>
                    <XAxis dataKey="doctor" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            )}

            {monthlyPayments.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Monthly Spending</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyPayments}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            )}
          </Box>
        )}
      </Container>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onClose={() => setRescheduleDialog({ open:false, id:null, date:'', time:'' })}>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          {rescheduleOptions.dates && rescheduleOptions.dates.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Date"
                value={rescheduleDialog.date}
                onChange={(e) => {
                  const date = e.target.value;
                  setRescheduleDialog(d => ({ ...d, date, time: '' }));
                  setRescheduleOptions(prev => ({ ...prev, times: prev.timesByDate?.[date] || [] }));
                }}
                SelectProps={{ native: false }}
              >
                {rescheduleOptions.dates.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Time"
                value={rescheduleDialog.time}
                onChange={(e) => setRescheduleDialog(d => ({ ...d, time: e.target.value }))}
              >
                {(rescheduleOptions.times || []).map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={rescheduleDialog.date}
                onChange={(e) => setRescheduleDialog(d => ({ ...d, date: e.target.value }))}
              />
              <TextField
                label="Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={rescheduleDialog.time}
                onChange={(e) => setRescheduleDialog(d => ({ ...d, time: e.target.value }))}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialog({ open:false, id:null, date:'', time:'' })}>Cancel</Button>
          <Button onClick={submitReschedule} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default PatientDashboard;