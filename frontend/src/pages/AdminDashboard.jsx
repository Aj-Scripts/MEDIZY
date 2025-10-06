import { useState, useEffect, useMemo } from 'react';
import {
  Container, Typography, Box, Grid, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Tabs, Tab, MenuItem, Select, 
  InputLabel, FormControl, Avatar, IconButton, Divider, Badge, LinearProgress,
  CardContent, alpha, styled, Fade, Grow, useTheme, Skeleton
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, Legend, Bar, CartesianGrid, Area, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
}));

const MetricCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, ${alpha(color || theme.palette.primary.main, 0.05)} 100%)`,
  borderRadius: 16,
  border: '1px solid',
  borderColor: alpha(color || theme.palette.primary.main, 0.2),
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(color || theme.palette.primary.main, 0.15)}`,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  '& .MuiTable-root': {
    '& .MuiTableHead-root': {
      '& .MuiTableCell-head': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        fontWeight: 600,
        color: theme.palette.text.primary,
        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
        },
        '& .MuiTableCell-root': {
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
        },
      },
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 120,
  fontWeight: 500,
  marginRight: theme.spacing(3),
  fontSize: '0.95rem',
  '&.Mui-selected': {
    fontWeight: 600,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  padding: '6px 16px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const AdminDashboard = () => {
  const { api } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const [tabValue, setTabValue] = useState(0);

  // Data
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);

  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Add/Edit doctor
  const [newDoctor, setNewDoctor] = useState({ qualifications:'', experienceYears:'', fees:'', specialization: '' });
  const [newUserImageFile, setNewUserImageFile] = useState(null);
  const [newUserImagePreview, setNewUserImagePreview] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Create new user
  const [newUser, setNewUser] = useState({ name:'', email:'', password:'' });
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docRes, aptRes, patRes, usersRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/appointments'),
          api.get('/patients'),
          api.get('/users')
        ]);
        setDoctors(docRes.data);
        setAppointments(aptRes.data);
        setPatients(patRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  // Tabs
  const handleTabChange = (e, newValue) => setTabValue(newValue);

  // Doctor CRUD
  const handleAddDoctor = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please provide name, email and password for the new doctor user');
      return;
    }
    if (!newDoctor.qualifications || !newDoctor.experienceYears || !newDoctor.fees) {
      alert('Please fill all doctor details!');
      return;
    }

    try {
      const userRes = await api.post('/auth/register', { name: newUser.name, email: newUser.email, password: newUser.password, role: 'doctor' }, { headers: { 'x-skip-captcha': 'true' } });
      const userId = userRes.data.user?._id || userRes.data._id || userRes.data.userId;

      const updatePayload = {};
      if (newDoctor.specialization) updatePayload.specialization = newDoctor.specialization;
      if (newUserImageFile) {
        const form = new FormData();
        form.append('file', newUserImageFile);
        try {
          const uploadRes = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (uploadRes.data?.url) updatePayload.image = uploadRes.data.url;
        } catch (upErr) { console.error('Upload failed', upErr); }
      }
      if (Object.keys(updatePayload).length > 0) {
        try { await api.put(`/users/${userId}`, updatePayload); } catch(e){console.error('Failed updating user',e)}
      }

      const res = await api.post('/doctors', {
        userId: userId,
        qualifications: newDoctor.qualifications,
        experienceYears: Number(newDoctor.experienceYears),
        fees: Number(newDoctor.fees)
      });
      setDoctors([...doctors, res.data]);
      const usersRes = await api.get('/users'); setUsers(usersRes.data);
      setOpenDialog(false);
      setNewDoctor({ qualifications:'', experienceYears:'', fees:'', specialization: '' });
      setNewUser({ name:'', email:'', password:'' });
      setNewUserImageFile(null); setNewUserImagePreview('');
      alert('Doctor user created and profile added successfully!');
    } catch (err) {
      console.error('Error creating doctor:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create doctor');
    }
  };

  const handleCreateUserAndDoctor = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill all user details!');
      return;
    }
    
    if (!newDoctor.qualifications || !newDoctor.experienceYears || !newDoctor.fees) {
      alert('Please fill all doctor details!');
      return;
    }

    try {
      console.log('Creating user with:', { ...newUser, role: 'doctor' });
      
      const userRes = await api.post('/auth/register', { 
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: 'doctor' 
      }, { headers: { 'x-skip-captcha': 'true' } });
      
      console.log('User created:', userRes.data);
      
      const userId = userRes.data.user?._id || userRes.data._id || userRes.data.userId;
      
      if (!userId) {
        throw new Error('User ID not found in response');
      }
      
      console.log('Creating doctor profile for user:', userId);
      
      const docRes = await api.post('/doctors', {
        userId: userId,
        qualifications: newDoctor.qualifications,
        experienceYears: Number(newDoctor.experienceYears),
        fees: Number(newDoctor.fees)
      });
      
      console.log('Doctor created:', docRes.data);
      
      setDoctors([...doctors, docRes.data]);
      
      const usersRes = await api.get('/users');
      setUsers(usersRes.data);
      
      setCreateUserDialog(false);
      setOpenDialog(false);
      setNewUser({ name:'', email:'', password:'' });
      setNewDoctor({ qualifications:'', experienceYears:'', fees:'' });
      setSelectedUserId('');
      alert('Doctor user created and profile added successfully!');
    } catch (err) {
      console.error('Error creating doctor:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || err.message || 'Failed to create doctor');
    }
  };

  const handleEditDoctorClick = (doctor) => { 
    setEditingDoctor({
      ...doctor,
      qualifications: doctor.qualifications || '',
      experienceYears: doctor.experienceYears || 0,
      fees: doctor.fees || 0
    });
    setEditDialogOpen(true); 
  };

  const handleSaveEditDoctor = async () => {
    try {
      const userId = editingDoctor.user?._id || editingDoctor.user;
      const userPayload = {
        name: editingDoctor.user?.name || editingDoctor.userName || undefined,
        email: editingDoctor.user?.email || editingDoctor.userEmail || undefined,
        specialization: editingDoctor.specialization || undefined
      };
      if (editingDoctor.newImageFile) {
        const form = new FormData(); form.append('file', editingDoctor.newImageFile);
        try {
          const uploadRes = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (uploadRes.data?.url) userPayload.image = uploadRes.data.url;
        } catch (upErr) { console.error('Upload failed', upErr); }
      }
      try { if (userId) await api.put(`/users/${userId}`, userPayload); } catch(e){ console.error('Failed updating user', e); }

      const docPayload = {
        qualifications: editingDoctor.qualifications,
        experienceYears: Number(editingDoctor.experienceYears),
        fees: Number(editingDoctor.fees)
      };
      if (editingDoctor.rating !== undefined) docPayload.rating = Number(editingDoctor.rating);

      const res = await api.put(`/doctors/${editingDoctor._id}`, docPayload);
      setDoctors(doctors.map(d => d._id === editingDoctor._id ? res.data : d));
      setEditDialogOpen(false);
      setEditingDoctor(null);
      alert('Doctor updated successfully!');
    } catch (err) { 
      console.error(err);
      alert('Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await api.delete(`/doctors/${id}`);
      setDoctors(doctors.filter(d => d._id !== id));
      setAppointments(appointments.filter(a => a.doctorId !== id));
      alert('Doctor deleted successfully!');
    } catch (err) { 
      console.error(err);
      alert('Failed to delete doctor');
    }
  };

  // Appointment CRUD
  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      const res = await api.put(`/appointments/${id}`, { status });
      setAppointments(appointments.map(a => a._id === id ? res.data : a));
    } catch (err) { console.error(err); }
  };

  // Patient CRUD
  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      await api.delete(`/patients/${id}`);
      setPatients(patients.filter(p => p._id !== id));
      setAppointments(appointments.filter(a => a.patientId !== id));
    } catch (err) { console.error(err); }
  };

  // Helpers
  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };
  
  const getDoctorName = (doctorOrId) => {
    if (!doctorOrId) return 'Unknown';
    if (typeof doctorOrId === 'object') {
      const doc = doctorOrId.doctor || doctorOrId.doctorId || doctorOrId.doctor?._id;
      if (doctorOrId.doctor && (doctorOrId.doctor.name || doctorOrId.doctor.user?.name)) {
        return doctorOrId.doctor.name || doctorOrId.doctor.user?.name || 'Unknown';
      }
      if (typeof doc === 'string') return doctors.find(d => d._id === doc)?.user?.name || 'Unknown';
      return 'Unknown';
    }
    return doctors.find(d => d._id === doctorOrId)?.user?.name || 'Unknown';
  };

  const getPatientName = (patientOrId) => {
    if (!patientOrId) return 'Unknown';
    if (typeof patientOrId === 'object') {
      if (patientOrId.patient && (patientOrId.patient.name || patientOrId.patient.user?.name)) {
        return patientOrId.patient.name || patientOrId.patient.user?.name || 'Unknown';
      }
      const id = patientOrId.patientId || (patientOrId.patient && patientOrId.patient._id);
      if (id) return patients.find(p => p._id === id)?.name || 'Unknown';
      return 'Unknown';
    }
    return patients.find(p => p._id === patientOrId)?.name || 'Unknown';
  };

  // Analytics
  const appointmentsPerDoctor = useMemo(() => doctors.map(doc => ({
    name: doc.user?.name,
    appointments: appointments.filter(a => a.doctorId === doc._id).length
  })), [doctors, appointments]);

  const appointmentStatusDistribution = useMemo(() => [
    { status:'Completed', value: appointments.filter(a=>a.status==='completed').length },
    { status:'Confirmed', value: appointments.filter(a=>a.status==='confirmed').length },
    { status:'Pending', value: appointments.filter(a=>a.status==='pending').length },
    { status:'Cancelled', value: appointments.filter(a=>a.status==='cancelled').length },
  ], [appointments]);

  const patientsGrowth = useMemo(() => {
    const growth = {};
    patients.forEach(p => {
      const month = new Date(p.registeredAt || Date.now()).toLocaleString('default', { month:'short' });
      growth[month] = (growth[month] || 0) + 1;
    });
    return Object.keys(growth).map(month => ({ month, count: growth[month] }));
  }, [patients]);

  const totalRevenue = useMemo(() => appointments.reduce((sum,a)=>sum+(a.amount||0),0), [appointments]);
  const revenuePerDoctor = useMemo(() => doctors.map(doc=>({
    name: doc.user?.name,
    revenue: appointments.filter(a=>a.doctorId===doc._id && a.status==='completed').reduce((sum,a)=>sum+(a.amount||0),0)
  })), [doctors, appointments]);

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          <Typography variant="body2" color="primary">
            {payload[0].name}: {payload[0].value}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ minHeight:'100vh', display:'flex', flexDirection:'column', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py:4, flexGrow:1 }}>
        {/* Header */}
        <Box sx={{ mb:5 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your healthcare system efficiently
          </Typography>
        </Box>

        {/* Overview Cards */}
        <Grow in timeout={600}>
          <Grid container spacing={3} sx={{ mb:5 }}>
            {[
              { 
                icon: <LocalHospitalIcon sx={{ fontSize: 32 }}/>, 
                count: doctors.length, 
                label: 'Total Doctors',
                color: theme.palette.primary.main,
                trend: '+12%'
              },
              { 
                icon: <CalendarTodayIcon sx={{ fontSize: 32 }}/>, 
                count: appointments.length, 
                label: 'Total Appointments',
                color: theme.palette.warning.main,
                trend: '+8%'
              },
              { 
                icon: <PeopleIcon sx={{ fontSize: 32 }}/>, 
                count: patients.length, 
                label: 'Total Patients',
                color: theme.palette.success.main,
                trend: '+15%'
              },
              { 
                icon: <AttachMoneyIcon sx={{ fontSize: 32 }}/>, 
                count: totalRevenue, 
                label: 'Total Revenue',
                color: theme.palette.secondary.main,
                isCurrency: true,
                trend: '+23%'
              }
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} lg={3} key={idx}>
                <Fade in timeout={300 * (idx + 1)}>
                  <MetricCard color={item.color}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: alpha(item.color, 0.1),
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.icon}
                        </Box>
                        <Chip 
                          label={item.trend} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {loading ? <Skeleton width="60%" /> : (item.isCurrency ? `$${item.count.toLocaleString()}` : item.count.toLocaleString())}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {item.label}
                      </Typography>
                    </CardContent>
                  </MetricCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Grow>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{ 
                '& .MuiTabs-indicator': { 
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                } 
              }}
            >
              <StyledTab label="Doctor Management" icon={<LocalHospitalIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
              <StyledTab label="Appointments" icon={<CalendarTodayIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
              <StyledTab label="Patients" icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
              <StyledTab label="Analytics" icon={<AssessmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
            </Tabs>
          </Box>
        </Paper>

        {/* Doctor Management Tab */}
        {tabValue === 0 && (
          <Fade in timeout={300}>
            <Box>
              <StyledCard sx={{ mb: 4 }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Doctor Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage doctor profiles and credentials
                    </Typography>
                  </Box>
                  <ActionButton 
                    variant="contained" 
                    startIcon={<PersonAddIcon />} 
                    onClick={() => setOpenDialog(true)}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}
                  >
                    Add New Doctor
                  </ActionButton>
                </Box>
                <Divider />
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell>Experience</TableCell>
                        <TableCell>Consultation Fee</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doctors.map(doc => (
                        <TableRow key={doc._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                src={getImageUrl(doc.user?.image)}
                                sx={{ 
                                  width: 44, 
                                  height: 44,
                                  border: '2px solid',
                                  borderColor: 'primary.light'
                                }}
                              >
                                {doc.user?.name?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {doc.user?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {doc.user?.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={doc.user?.specialization || 'General'} 
                              size="small" 
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                fontWeight: 500
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" fontWeight={500}>
                                {doc.experienceYears} years
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight={600} color="primary">
                              ${doc.fees}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <StarIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
                              <Typography variant="body2" fontWeight={500}>
                                {doc.rating || '5.0'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditDoctorClick(doc)}
                              sx={{ color: 'primary.main', mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteDoctor(doc._id)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </StyledCard>
            </Box>
          </Fade>
        )}

        {/* Appointments Tab */}
        {tabValue === 1 && (
          <Fade in timeout={300}>
            <Box>
              <StyledCard sx={{ mb: 4 }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Appointments Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Monitor and manage all appointments
                  </Typography>
                </Box>
                <Divider />
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Token</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.map(appt => (
                        <TableRow key={appt._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {getPatientName(appt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {getDoctorName(appt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {appt.date}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {appt.time}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              badgeContent={appt.tokenNumber || '—'} 
                              color="primary"
                              sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem', fontWeight: 600 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={appt.status} 
                              color={getStatusColor(appt.status)} 
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="primary">
                              ${appt.amount}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton 
                                size="small"
                                sx={{ color: 'success.main' }}
                                onClick={() => handleUpdateAppointmentStatus(appt._id, 'completed')}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small"
                                sx={{ color: 'error.main' }}
                                onClick={() => handleUpdateAppointmentStatus(appt._id, 'cancelled')}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </StyledCard>

              {/* Reschedule Requests */}
              {appointments.some(a => (a.rescheduleRequests || []).some(r => r.status === 'pending')) && (
                <StyledCard>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Reschedule Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Pending reschedule requests from patients and doctors
                    </Typography>
                  </Box>
                  <Divider />
                  <StyledTableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Appointment</TableCell>
                          <TableCell>Requested By</TableCell>
                          <TableCell>New Date</TableCell>
                          <TableCell>New Time</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.flatMap(a => (a.rescheduleRequests || []).map(r => ({ appt: a, req: r })))
                          .filter(x => x.req.status === 'pending')
                          .map(({ appt, req }) => (
                            <TableRow key={req._id} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {getPatientName(appt)} → {getDoctorName(appt)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={req.requestedBy} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{req.date}</TableCell>
                              <TableCell>{req.time}</TableCell>
                              <TableCell align="center">
                                <ActionButton 
                                  size="small" 
                                  variant="contained"
                                  color="success"
                                  onClick={async () => {
                                    try {
                                      const res = await api.post(`/appointments/${appt._id}/reschedule/${req._id}/accept`);
                                      setAppointments(appointments.map(a => a._id === res.data._id ? res.data : a));
                                      alert('Reschedule accepted');
                                    } catch (err) { 
                                      console.error(err); 
                                      alert('Failed to accept'); 
                                    }
                                  }}
                                >
                                  Accept
                                </ActionButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </StyledCard>
              )}
            </Box>
          </Fade>
        )}

        {/* Patients Tab */}
        {tabValue === 2 && (
          <Fade in timeout={300}>
            <Box>
              <StyledCard>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Patients Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Complete list of registered patients
                  </Typography>
                </Box>
                <Divider />
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient Information</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Total Appointments</TableCell>
                        <TableCell>Last Visit</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {patients.map(p => (
                        <TableRow key={p._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.light' }}>
                                {p.name?.[0]}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {p.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{p.email}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {p.phone}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              badgeContent={appointments.filter(a => a.patientId === p._id).length} 
                              color="primary"
                              showZero
                            >
                              <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {appointments
                                .filter(a => a.patientId === p._id)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || 'Never'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small"
                              sx={{ color: 'error.main' }}
                              onClick={() => handleDeletePatient(p._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </StyledCard>
            </Box>
          </Fade>
        )}

        {/* Analytics Tab */}
        {tabValue === 3 && (
          <Fade in timeout={300}>
            <Box>
              <Grid container spacing={4}>
                {/* Appointments per Doctor */}
                <Grid item xs={12} lg={6}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Appointments per Doctor
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={appointmentsPerDoctor}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke={theme.palette.text.secondary}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="appointments" 
                            fill={theme.palette.primary.main}
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>

                {/* Status Distribution */}
                <Grid item xs={12} lg={6}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Appointment Status Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie 
                            data={appointmentStatusDistribution} 
                            dataKey="value" 
                            nameKey="status" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100}
                            label={(entry) => `${entry.status}: ${entry.value}`}
                          >
                            {appointmentStatusDistribution.map((entry, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>

                {/* Patient Growth */}
                <Grid item xs={12}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Patient Registration Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={patientsGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis 
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke={theme.palette.text.secondary}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke={theme.palette.success.main}
                            fill={alpha(theme.palette.success.main, 0.2)}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>

                {/* Revenue per Doctor */}
                <Grid item xs={12}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Revenue Analytics
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenuePerDoctor}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke={theme.palette.text.secondary}
                          />
                          <Tooltip 
                            formatter={(value) => `${value}`}
                            content={<CustomTooltip />}
                          />
                          <Bar 
                            dataKey="revenue" 
                            fill={theme.palette.secondary.main}
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

      </Container>
      <Footer />

      {/* Add Doctor Dialog - Enhanced */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={600}>Add New Doctor</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new doctor profile with credentials
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              User Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Full Name" 
                fullWidth 
                value={newUser.name} 
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                variant="outlined"
              />
              <TextField 
                label="Email Address" 
                type="email" 
                fullWidth 
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                variant="outlined"
              />
              <TextField 
                label="Password" 
                type="password" 
                fullWidth 
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                helperText="Minimum 6 characters"
                variant="outlined"
              />
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Professional Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Qualifications" 
                fullWidth 
                value={newDoctor.qualifications} 
                onChange={(e) => setNewDoctor({...newDoctor, qualifications: e.target.value})}
                placeholder="e.g., MBBS, MD"
                variant="outlined"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  label="Experience (years)" 
                  type="number" 
                  fullWidth 
                  value={newDoctor.experienceYears} 
                  onChange={(e) => setNewDoctor({...newDoctor, experienceYears: e.target.value})}
                  inputProps={{ min: 0 }}
                  variant="outlined"
                />
                <TextField 
                  label="Consultation Fee ($)" 
                  type="number" 
                  fullWidth 
                  value={newDoctor.fees} 
                  onChange={(e) => setNewDoctor({...newDoctor, fees: e.target.value})}
                  inputProps={{ min: 0 }}
                  variant="outlined"
                />
              </Box>
              <TextField
                label="Specialization"
                fullWidth
                value={newDoctor.specialization || ''}
                onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                placeholder="e.g., Cardiology"
                variant="outlined"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Profile Image (Optional)
            </Typography>
            <Box sx={{ 
              p: 2, 
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => { 
                  const f = e.target.files[0] || null; 
                  setNewUserImageFile(f); 
                  if (f) setNewUserImagePreview(URL.createObjectURL(f)); 
                }}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span">
                  Choose Image
                </Button>
              </label>
              {newUserImagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Avatar 
                    src={newUserImagePreview} 
                    sx={{ width: 80, height: 80, mx: 'auto' }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <ActionButton onClick={handleAddDoctor} variant="contained">
            Add Doctor
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Edit Doctor Dialog - Enhanced */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={600}>Edit Doctor Profile</Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          {editingDoctor && (
            <>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  User Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    label="Full Name" 
                    fullWidth 
                    value={editingDoctor.user?.name || editingDoctor.userName || ''} 
                    onChange={(e) => setEditingDoctor({...editingDoctor, user: {...editingDoctor.user, name: e.target.value }, userName: e.target.value})}
                    variant="outlined"
                  />
                  <TextField 
                    label="Email Address" 
                    type="email"
                    fullWidth 
                    value={editingDoctor.user?.email || editingDoctor.userEmail || ''} 
                    onChange={(e) => setEditingDoctor({...editingDoctor, user: {...editingDoctor.user, email: e.target.value }, userEmail: e.target.value})}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Professional Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    label="Rating" 
                    type="number"
                    fullWidth 
                    value={editingDoctor.rating || 5} 
                    onChange={(e) => setEditingDoctor({...editingDoctor, rating: e.target.value})}
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                    variant="outlined"
                  />
                  <TextField 
                    label="Qualifications" 
                    fullWidth 
                    value={editingDoctor.qualifications} 
                    onChange={(e) => setEditingDoctor({...editingDoctor, qualifications: e.target.value})}
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField 
                      label="Experience (years)" 
                      type="number" 
                      fullWidth 
                      value={editingDoctor.experienceYears} 
                      onChange={(e) => setEditingDoctor({...editingDoctor, experienceYears: e.target.value})}
                      inputProps={{ min: 0 }}
                      variant="outlined"
                    />
                    <TextField 
                      label="Consultation Fee ($)" 
                      type="number" 
                      fullWidth 
                      value={editingDoctor.fees} 
                      onChange={(e) => setEditingDoctor({...editingDoctor, fees: e.target.value})}
                      inputProps={{ min: 0 }}
                      variant="outlined"
                    />
                  </Box>
                  <TextField
                    label="Specialization"
                    fullWidth
                    value={editingDoctor.specialization || editingDoctor.user?.specialization || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})}
                    placeholder="e.g., Cardiology"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Profile Image
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={editingDoctor.newImageFile ? URL.createObjectURL(editingDoctor.newImageFile) : getImageUrl(editingDoctor.user?.image)}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Box>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const f = e.target.files[0] || null;
                        setEditingDoctor({...editingDoctor, newImageFile: f});
                      }}
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload">
                      <Button variant="outlined" component="span" size="small">
                        Change Image
                      </Button>
                    </label>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <ActionButton variant="contained" onClick={handleSaveEditDoctor}>
            Save Changes
          </ActionButton>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminDashboard;