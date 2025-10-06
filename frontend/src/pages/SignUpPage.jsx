import { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Link, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import dayjs from 'dayjs';
import axios from 'axios';
import { useEffect } from 'react';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name:'', email:'', password:'', address:'', gender:'', birthday:null, phone:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState({ id:'', svg:'' });
  const [captchaText, setCaptchaText] = useState('');

  useEffect(()=>{ fetchCaptcha(); }, []);
  const fetchCaptcha = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_BASE || 'http://localhost:5000') + '/api/captcha');
      setCaptcha(res.data);
    } catch (err) { console.error('Failed to fetch captcha', err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDateChange = (date) => setFormData({ ...formData, birthday: date });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
  const payload = { ...formData };
      if (payload.birthday) payload.birthday = payload.birthday.toISOString(); // format date for backend
      payload.role = 'patient'; // default role

  // attach captcha
  payload.captchaId = captcha.id;
  payload.captchaText = captchaText;

  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const res = await axios.post(`${base}/api/auth/register`, payload);
      const user = res.data.user;
      const token = res.data.token;

      localStorage.setItem('medizy_token', token);
      navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', bgcolor:'background.default', py:4, backgroundImage:'linear-gradient(135deg, rgba(25,118,210,0.1), rgba(76,175,80,0.1))' }}>
      <Container maxWidth="md">
        <Paper elevation={8} sx={{ p:4, borderRadius:4 }}>
          <Box sx={{ textAlign:'center', mb:4 }}>
            <LocalHospitalIcon sx={{ fontSize:48, color:'primary.main', mb:2 }} />
            <Typography variant="h4" sx={{ mb:1, fontWeight:'bold' }}>Join Medizy</Typography>
            <Typography variant="body1" color="text.secondary">Create your account to get started</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb:3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display:'flex', flexDirection:'column', gap:3 }}>
            <Box sx={{ display:'flex', gap:2, flexDirection:{ xs:'column', sm:'row' } }}>
              <TextField name="name" label="Full Name" variant="outlined" fullWidth required value={formData.name} onChange={handleChange} />
              <TextField name="email" type="email" label="Email" variant="outlined" fullWidth required value={formData.email} onChange={handleChange} />
            </Box>

            <Box sx={{ display:'flex', gap:2, flexDirection:{ xs:'column', sm:'row' } }}>
              <TextField name="password" type="password" label="Password" variant="outlined" fullWidth required value={formData.password} onChange={handleChange} />
              <TextField name="phone" label="Phone Number" variant="outlined" fullWidth required value={formData.phone} onChange={handleChange} />
            </Box>

            <TextField name="address" label="Address" variant="outlined" fullWidth multiline rows={2} required value={formData.address} onChange={handleChange} />

            <Box sx={{ display:'flex', gap:2, flexDirection:{ xs:'column', sm:'row' } }}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} label="Gender" onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <DatePicker label="Date of Birth" value={formData.birthday} onChange={handleDateChange} maxDate={dayjs().subtract(1,'year')} sx={{ width:'100%' }} />
            </Box>

            <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
              <Box dangerouslySetInnerHTML={{ __html: captcha.svg }} />
              <TextField label="Enter Captcha" value={captchaText} onChange={(e)=>setCaptchaText(e.target.value)} />
              <Button onClick={fetchCaptcha}>Refresh</Button>
            </Box>

            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py:1.5 }}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Box>

          <Box sx={{ mt:3, textAlign:'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component="button" variant="body2" onClick={() => navigate('/login')} sx={{ textDecoration:'none' }}>Sign in here</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUpPage;
