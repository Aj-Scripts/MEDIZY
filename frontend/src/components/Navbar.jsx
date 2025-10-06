import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();           // clear auth
    navigate('/login'); // redirect to login page
  };

  const getNavItems = () => {
    if (user?.role === 'patient') {
      return [
        { label: 'Home', path: '/patient-dashboard' },
        { label: 'Doctors', path: '/doctors' },
        { label: 'Profile', path: '/profile' }
      ];
    } else if (user?.role === 'doctor') {
      return [
        { label: 'Dashboard', path: '/doctor-dashboard' },
        { label: 'Profile', path: '/profile' }
      ];
    } else if (user?.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin-dashboard' }
      ];
    } else {
      return [
        { label: 'Home', path: '/' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact Us', path: '/contact' }
      ];
    }
  };

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 2, md: 8 } }}>
        <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate('/')}>
          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Medizy</Typography>
        </Box>

        {/* Desktop Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {getNavItems().map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderRadius: 1,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* User Section */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Typography variant="body2">Welcome, {user.name}</Typography>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button color="inherit" onClick={() => navigate('/signup')}>Sign Up</Button>
            </>
          )}
        </Box>

        {/* Mobile Menu */}
        <IconButton edge="end" color="inherit" sx={{ display: { xs: 'flex', md: 'none' } }} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {getNavItems().map((item) => (
            <MenuItem key={item.path} onClick={() => { navigate(item.path); setAnchorEl(null); }}>
              {item.label}
            </MenuItem>
          ))}
          {user ? (
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          ) : (
            <>
              <MenuItem onClick={() => { navigate('/login'); setAnchorEl(null); }}>Login</MenuItem>
              <MenuItem onClick={() => { navigate('/signup'); setAnchorEl(null); }}>Sign Up</MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
