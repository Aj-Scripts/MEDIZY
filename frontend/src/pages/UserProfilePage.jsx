import { useState,useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Snackbar, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../contexts/AuthContext';
import { appointments, doctors } from '../data/mockData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import dayjs from 'dayjs';

const UserProfilePage = () => {
  const { user, updateProfile, api } = useAuth();
  const [editing, setEditing] = useState(false);

  // Add effect to update form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
        birthday: user.birthday ? dayjs(user.birthday) : null,
        imageFile: null,
        previewUrl: user.image || ''
      });
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    birthday: user?.birthday ? dayjs(user.birthday) : null,
    imageFile: null,
    previewUrl: user?.image || ''
  });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const userAppointments = appointments.filter(apt => apt.patientId === user?.id);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, birthday: date });
  };

  const handleSave = () => {
    (async () => {
      try {
        setLoading(true);
        // If user picked a new image file, upload it first
        let imageUrl = user?.image;
        if (formData.imageFile) {
          const fd = new FormData();
          fd.append('file', formData.imageFile);
          const uploadRes = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          imageUrl = uploadRes.data.url || uploadRes.data.filename || imageUrl;
        }

        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || '',
          gender: formData.gender || '',
          address: formData.address?.trim() || '',
          birthday: formData.birthday ? formData.birthday.toISOString() : null,
          image: imageUrl
        };

        console.log('Saving profile with payload:', payload); // Debug log

        const res = await api.put(`/users/${user._id}`, payload);
        const savedUser = res.data;

        console.log('Received saved user:', savedUser); // Debug log

        // Ensure we preserve all fields and handle the birthday correctly
        const updatedUser = {
          ...savedUser,
          birthday: savedUser.birthday ? dayjs(savedUser.birthday) : null,
          phone: savedUser.phone || '',
          gender: savedUser.gender || '',
          address: savedUser.address || ''
        };

        // Update both auth context and form data
        updateProfile(updatedUser);
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          gender: updatedUser.gender || '',
          address: updatedUser.address || '',
          birthday: updatedUser.birthday,
          imageFile: null,
          previewUrl: updatedUser.image || ''
        });

        setEditing(false);
        setSnack({ open: true, message: 'Profile updated successfully', severity: 'success' });
      } catch (err) {
        console.error('Failed to save profile', err);
        setSnack({ open: true, message: 'Failed to save profile', severity: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(fd => ({ ...fd, imageFile: file, previewUrl: url }));
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          My Profile
        </Typography>

        {/* Profile Section */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Avatar */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={formData.previewUrl || user?.image}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {user?.name}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                fullWidth
                component="label"
                disabled={!editing}
              >
                Change Photo
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>
            </Grid>

            {/* Personal Info */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Personal Information
                </Typography>
                <Box>
                  {editing ? (
                    <>
                      <Button variant="contained" color="primary" onClick={handleSave} disabled={loading} sx={{ mr: 2 }}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={() => { setEditing(false); setFormData({ ...formData, name: user?.name || '', email: user?.email || '', phone: user?.phone || '', gender: user?.gender || '', address: user?.address || '', birthday: user?.birthday ? dayjs(user.birthday) : null, imageFile: null, previewUrl: user?.image || '' }); }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="outlined" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editing}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      label="Gender"
                      onChange={handleChange}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.birthday}
                      onChange={handleDateChange}
                      disabled={!editing}
                      maxDate={dayjs().subtract(1, 'year')}
                      sx={{ width: '100%' }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>

        {/* Appointment History */}
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Appointment History
          </Typography>

          {userAppointments.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No appointments found
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {userAppointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {getDoctorName(appointment.doctorId)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Date: {appointment.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Time: {appointment.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Status: {appointment.status}
                      </Typography>
                      <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        ${appointment.amount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default UserProfilePage;
