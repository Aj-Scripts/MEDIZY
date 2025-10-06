import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Paper,
  Chip,
  TableRow,
  Button,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336'];

const DoctorDashboard = () => {
  const { user, api } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [scheduleDialog, setScheduleDialog] = useState({ open: false, schedule: {} });

  const fetchData = async () => {
    try {
      const [aptRes, patRes, doctorsRes] = await Promise.all([
        api.get(`/appointments/doctor/${user._id}`),
        api.get('/patients'),
        api.get('/doctors')
      ]);
      setAppointments(aptRes.data);
      setPatients(patRes.data);
      setDoctors(doctorsRes.data);
      
      try {
        const notesRes = await api.get('/notifications');
        setNotifications(notesRes.data);
      } catch (nerr) { 
        console.error('Failed to fetch notifications', nerr); 
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [api, user]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  const getPatientName = (patientOrId) => {
    if (!patientOrId) return 'Unknown';
    if (typeof patientOrId === 'object') {
      if (patientOrId.patient && (patientOrId.patient.name || patientOrId.patient.user?.name)) {
        return patientOrId.patient.name || patientOrId.patient.user?.name || 'Unknown';
      }
      const id = patientOrId.patientId || (patientOrId.patient && patientOrId.patient._id);
      if (id) {
        const patient = patients.find(p => p._id === id);
        return patient ? patient.name : 'Unknown';
      }
      return 'Unknown';
    }
    const patient = patients.find(p => p._id === patientOrId);
    return patient ? patient.name : 'Unknown';
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, {
        status: 'confirmed'
      });
      setAppointments(
        appointments.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: 'confirmed' } 
            : apt
        )
      );
      alert('Appointment confirmed successfully!');
    } catch (err) {
      console.error('Failed to confirm', err);
      alert(err.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.patch(`/appointments/${appointmentId}`, {
          status: 'cancelled'
        });
        setAppointments(
          appointments.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, status: 'cancelled' } 
              : apt
          )
        );
        alert('Appointment cancelled successfully');
      } catch (err) {
        console.error('Failed to cancel', err);
        alert(err.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, {
        status: 'completed'
      });
      setAppointments(
        appointments.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: 'completed' } 
            : apt
        )
      );
      alert('Appointment marked as completed!');
    } catch (err) {
      console.error('Failed to complete', err);
      alert(err.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const totalEarnings = appointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);
  const todaysAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().slice(0, 10);
    return apt.date === today;
  });

  const appointmentsPerStatus = useMemo(() => [
    { status: 'completed', value: appointments.filter(a => a.status === 'completed').length },
    { status: 'confirmed', value: appointments.filter(a => a.status === 'confirmed').length },
    { status: 'pending', value: appointments.filter(a => a.status === 'pending').length },
    { status: 'cancelled', value: appointments.filter(a => a.status === 'cancelled').length },
  ], [appointments]);

  const earningsOverTime = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      const month = new Date(a.date).toLocaleString('default', { month: 'short' });
      map[month] = (map[month] || 0) + (a.amount || 0);
    });
    return Object.keys(map).map(month => ({ month, earnings: map[month] }));
  }, [appointments]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Doctor Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your healthcare system efficiently
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              bgcolor: '#e3f2fd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 2, 
                  bgcolor: '#1976d2', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <LocalHospitalIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Doctors
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {doctors.length}
                  </Typography>
                  <Chip label="+12%" size="small" sx={{ bgcolor: '#4caf50', color: 'white', fontSize: '0.7rem' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              bgcolor: '#fff3e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 2, 
                  bgcolor: '#ff9800', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <CalendarTodayIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Appointments
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {appointments.length}
                  </Typography>
                  <Chip label="+8%" size="small" sx={{ bgcolor: '#4caf50', color: 'white', fontSize: '0.7rem' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              bgcolor: '#e8f5e9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 2, 
                  bgcolor: '#4caf50', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <PeopleIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Patients
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {patients.length}
                  </Typography>
                  <Chip label="+15%" size="small" sx={{ bgcolor: '#4caf50', color: 'white', fontSize: '0.7rem' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              bgcolor: '#e8f5e9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 2, 
                  bgcolor: '#4caf50', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <AttachMoneyIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Revenue
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ₹{totalEarnings}
                  </Typography>
                  <Chip label="+23%" size="small" sx={{ bgcolor: '#4caf50', color: 'white', fontSize: '0.7rem' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
              icon={<AccessTimeIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
              label="Latest Insights" 
            />
            <Tab 
              icon={<TrendingUpIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
              label="Analytics" 
            />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Appointments Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor and manage all appointments
                </Typography>
              </Box>
              <MuiTooltip title="Refresh">
                <IconButton 
                  sx={{ bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  onClick={fetchData}
                >
                  <RefreshIcon />
                </IconButton>
              </MuiTooltip>
            </Box>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mb: 4 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>PATIENT</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>DOCTOR</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>DATE & TIME</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>TOKEN</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>AMOUNT</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                          <CalendarTodayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            No appointments found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((a) => (
                        <TableRow key={a._id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: '#1976d2' }}>
                                {getPatientName(a).charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {getPatientName(a)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">Dr. {user?.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(a.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {a.time}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={a.tokenNumber || 'N/A'} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#e3f2fd', 
                                color: '#1976d2',
                                fontWeight: 600
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={a.status}
                              color={getStatusColor(a.status)}
                              size="small"
                              sx={{ fontWeight: 500, textTransform: 'capitalize', minWidth: 90 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              ₹{a.amount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {a.status === 'pending' && (
                                <>
                                  <MuiTooltip title="Confirm">
                                    <IconButton 
                                      size="small" 
                                      sx={{ color: '#4caf50' }}
                                      onClick={() => handleConfirmAppointment(a._id)}
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </MuiTooltip>
                                  <MuiTooltip title="Cancel">
                                    <IconButton 
                                      size="small" 
                                      sx={{ color: '#f44336' }}
                                      onClick={() => handleCancelAppointment(a._id)}
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </MuiTooltip>
                                </>
                              )}
                              {a.status === 'confirmed' && (
                                <MuiTooltip title="Mark as Completed">
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#1976d2' }}
                                    onClick={() => handleCompleteAppointment(a._id)}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </MuiTooltip>
                              )}
                              {(a.status === 'completed' || a.status === 'cancelled') && (
                                <Typography variant="caption" color="text.secondary">
                                  No actions
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Reschedule Requests */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Reschedule Requests
              </Typography>
              <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>APPOINTMENT</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>REQUESTED BY</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>NEW DATE</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>NEW TIME</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments
                        .flatMap((a) => (a.rescheduleRequests || []).map((r) => ({ appt: a, req: r })))
                        .filter((x) => x.req.status === 'pending')
                        .length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No pending reschedule requests
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        appointments
                          .flatMap((a) => (a.rescheduleRequests || []).map((r) => ({ appt: a, req: r })))
                          .filter((x) => x.req.status === 'pending')
                          .map(({ appt, req }) => (
                            <TableRow key={req._id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                              <TableCell>
                                <Typography variant="body2">{getPatientName(appt)} → Dr. {user?.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={req.requestedBy || 'Patient'} 
                                  size="small"
                                  sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(req.date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{req.time}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={async () => {
                                      try {
                                        const res = await api.post(
                                          `/appointments/${appt._id}/reschedule/${req._id}/accept`
                                        );
                                        setAppointments(
                                          appointments.map((a) => (a._id === res.data._id ? res.data : a))
                                        );
                                        alert('Reschedule accepted');
                                      } catch (err) {
                                        console.error('Accept failed', err);
                                        alert(err.response?.data?.message || 'Failed to accept');
                                      }
                                    }}
                                    sx={{
                                      bgcolor: '#4caf50',
                                      textTransform: 'none',
                                      '&:hover': { bgcolor: '#45a049' }
                                    }}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Decline
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>

            {/* Weekly Schedule Management */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Weekly Schedule
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set your recurring weekly availability
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<CalendarTodayIcon />}
                  onClick={() => {
                    const doctorProfile = doctors.find(d => d.user?._id === user._id);
                    const currentSchedule = doctorProfile?.schedule || {};
                    setScheduleDialog({ 
                      open: true, 
                      schedule: currentSchedule 
                    });
                  }}
                  sx={{
                    bgcolor: '#1976d2',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                >
                  Edit Schedule
                </Button>
              </Box>

              <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>DAY</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>TIME SLOTS</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const doctorProfile = doctors.find(d => d.user?._id === user._id);
                        const daySlots = doctorProfile?.schedule?.[day] || [];
                        
                        return (
                          <TableRow key={day} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {day}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {daySlots.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {daySlots.map((slot, index) => (
                                    <Chip 
                                      key={index}
                                      label={slot} 
                                      size="small"
                                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600 }}
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Not available
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={daySlots.length > 0 ? 'Available' : 'Unavailable'}
                                size="small"
                                color={daySlots.length > 0 ? 'success' : 'default'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Today's Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {todaysAppointments.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, bgcolor: 'white' }}>
                    <CalendarTodayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No Appointments Today
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enjoy your free time or check upcoming appointments
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                todaysAppointments.map((a) => (
                  <Grid item xs={12} md={6} key={a._id}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: '#1976d2', mr: 2 }}>
                            {getPatientName(a).charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {getPatientName(a)}
                            </Typography>
                            <Chip
                              label={a.status}
                              color={getStatusColor(a.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize', mt: 0.5 }}
                            />
                          </Box>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Time
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {a.time}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Payment
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              ₹{a.amount}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: 'none', borderColor: '#1976d2', color: '#1976d2' }}
                          >
                            Details
                          </Button>
                          {a.status === 'pending' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleConfirmAppointment(a._id)}
                              sx={{ 
                                textTransform: 'none',
                                bgcolor: '#4caf50',
                                '&:hover': { bgcolor: '#45a049' }
                              }}
                            >
                              Confirm
                            </Button>
                          )}
                          {a.status === 'confirmed' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleCompleteAppointment(a._id)}
                              sx={{ 
                                textTransform: 'none',
                                bgcolor: '#1976d2',
                                '&:hover': { bgcolor: '#1565c0' }
                              }}
                            >
                              Complete
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>

            {/* Notifications */}
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                  <Chip
                    label={`${notifications.filter((n) => !n.read).length} unread`}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Button
                  variant="text"
                  sx={{ textTransform: 'none', color: '#1976d2' }}
                >
                  Mark all as read
                </Button>
              </Box>

              {notifications.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No New Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You're all caught up!
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  {notifications.map((n) => (
                    <Box
                      key={n._id}
                      sx={{
                        p: 2,
                        bgcolor: n.read ? 'transparent' : alpha('#1976d2', 0.04),
                        borderBottom: 1,
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 0 },
                        '&:hover': { bgcolor: '#fafafa' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: n.read ? 'grey.300' : '#1976d2' }}>
                            <NotificationsIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {n.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {n.body}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        {!n.read && (
                          <Button
                            size="small"
                            sx={{ textTransform: 'none', color: '#1976d2' }}
                            onClick={async () => {
                              try {
                                await api.post(`/notifications/${n._id}/read`);
                                setNotifications(
                                  notifications.map((x) =>
                                    x._id === n._id ? { ...x, read: true } : x
                                  )
                                );
                              } catch (err) {
                                console.error('Mark read failed', err);
                              }
                            }}
                          >
                            Mark as read
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 600 }}>
              Performance Analytics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Appointment Status Distribution
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ height: 300, mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentsPerStatus}
                          dataKey="value"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {appointmentsPerStatus.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value, name) => [
                            value,
                            name.charAt(0).toUpperCase() + name.slice(1),
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {appointmentsPerStatus.map((status, index) => (
                      <Box key={status.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {status.status} ({status.value})
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Earnings Over Time
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly revenue analysis
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ height: 300, mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={earningsOverTime}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                        <RechartsTooltip
                          formatter={(value) => [`₹${value}`, 'Earnings']}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="earnings" fill="#1976d2" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Earnings
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ₹{totalEarnings}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg. per Appointment
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ₹{appointments.length ? Math.round(totalEarnings / appointments.length) : 0}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      {
                        label: 'Appointment Success Rate',
                        value: `${Math.round(
                          (appointmentsPerStatus.find((s) => s.status === 'completed')?.value /
                            appointments.length) *
                            100 || 0
                        )}%`,
                        color: '#4caf50',
                        bgcolor: '#e8f5e9'
                      },
                      {
                        label: 'Average Daily Appointments',
                        value: Math.round(
                          appointments.length /
                            Math.max(
                              1,
                              Math.ceil(
                                (new Date() -
                                  new Date(
                                    Math.min(
                                      ...appointments.map((a) =>
                                        new Date(a.date).getTime()
                                      )
                                    )
                                  )) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                        ),
                        color: '#1976d2',
                        bgcolor: '#e3f2fd'
                      },
                      {
                        label: 'Cancellation Rate',
                        value: `${Math.round(
                          (appointmentsPerStatus.find((s) => s.status === 'cancelled')?.value /
                            appointments.length) *
                            100 || 0
                        )}%`,
                        color: '#f44336',
                        bgcolor: '#ffebee'
                      },
                    ].map((metric, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <Card sx={{ 
                          textAlign: 'center', 
                          p: 3,
                          bgcolor: metric.bgcolor,
                          boxShadow: 'none'
                        }}>
                          <Typography variant="h3" sx={{ color: metric.color, fontWeight: 'bold', mb: 1 }}>
                            {metric.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {metric.label}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      {/* Schedule Edit Dialog */}
      <Dialog 
        open={scheduleDialog.open} 
        onClose={() => setScheduleDialog({ open: false, schedule: {} })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Weekly Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <Box key={day} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {day}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const newSlot = prompt('Enter time range (e.g., 09:00-12:00)');
                      if (newSlot && /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(newSlot)) {
                        setScheduleDialog(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            [day]: [...(prev.schedule[day] || []), newSlot]
                          }
                        }));
                      } else if (newSlot) {
                        alert('Invalid format. Use HH:MM-HH:MM (e.g., 09:00-12:00)');
                      }
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Add Slot
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(scheduleDialog.schedule[day] || []).map((slot, index) => (
                    <Chip
                      key={index}
                      label={slot}
                      onDelete={() => {
                        setScheduleDialog(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            [day]: prev.schedule[day].filter((_, i) => i !== index)
                          }
                        }));
                      }}
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  ))}
                  {(scheduleDialog.schedule[day] || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No slots added for this day
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog({ open: false, schedule: {} })}>
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              try {
                const doctorProfile = doctors.find(d => d.user?._id === user._id);
                if (!doctorProfile) {
                  alert('Doctor profile not found');
                  return;
                }
                
                await api.put(`/doctors/${doctorProfile._id}/schedule`, {
                  schedule: scheduleDialog.schedule
                });
                
                const doctorsRes = await api.get('/doctors');
                setDoctors(doctorsRes.data);
                
                setScheduleDialog({ open: false, schedule: {} });
                alert('Schedule updated successfully!');
              } catch (err) {
                console.error('Failed to update schedule', err);
                alert(err.response?.data?.message || 'Failed to update schedule');
              }
            }}
            variant="contained"
          >
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default DoctorDashboard;