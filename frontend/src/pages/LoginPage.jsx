import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, TextField, Button, Typography, Box, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState({ id: '', svg: '' });
  const [captchaText, setCaptchaText] = useState('');

  const fetchCaptcha = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_BASE || 'http://localhost:5000') + '/api/captcha');
      if (res.data && res.data.id && res.data.svg) {
        setCaptcha(res.data);
      } else {
        console.error('Invalid captcha response:', res.data);
      }
    } catch (err) {
      console.error('Failed to fetch captcha:', err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password, captchaId: captcha.id, captchaText });

      // Redirect based on role
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'doctor') navigate('/doctor-dashboard');
      else navigate('/patient-dashboard');
    } catch (err) {
      console.error(err);
      alert('Login failed: ' + (err.response?.data?.message || err.message));
      // refresh captcha on failure
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 8, mb: 8 }}>
        <Card sx={{ width: '100%', p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" textAlign="center" sx={{ mb: 4 }}>
              Login
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:2 }}>
                <Box dangerouslySetInnerHTML={{ __html: captcha.svg }} />
                <TextField label="Enter Captcha" value={captchaText} onChange={(e)=>setCaptchaText(e.target.value)} />
                <Button onClick={fetchCaptcha}>Refresh</Button>
              </Box>
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </Box>
  );
};

export default LoginPage;
