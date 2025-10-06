// src/data/mockData.js
import API from '../utils/api';

// =====================
// API helper functions
// =====================

// Fetch all doctors
export async function getDoctors() {
  try {
    const res = await API.get('/doctors');
    return res.data;
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return [];
  }
}

// Fetch current user's appointments
export async function getAppointments() {
  try {
    const res = await API.get('/appointments/me');
    return res.data;
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return [];
  }
}

// Create a new appointment
export async function createAppointment({ doctorId, doctorUserId, date, time, reason }) {
  try {
    // backend expects the doctor's User _id (appointment.doctor -> User)
    const payload = { doctorId: doctorUserId || doctorId, date, time, reason };
    const res = await API.post('/appointments', payload);
    return res.data;
  } catch (err) {
    console.error('Error creating appointment:', err);
    return null;
  }
}

// Login user
export async function login({ email, password }) {
  try {
    const res = await API.post('/auth/login', { email, password });
    if (res.data) localStorage.setItem('medizy_user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    console.error('Login failed:', err);
    return null;
  }
}

// Register user
export async function register({ name, email, password, role = 'patient' }) {
  try {
    const res = await API.post('/auth/register', { name, email, password, role });
    if (res.data) localStorage.setItem('medizy_user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    console.error('Register failed:', err);
    return null;
  }
}

// =====================
// Placeholder arrays
// =====================
// These prevent breaking existing frontend imports
export const doctors = [];
export const appointments = [];
export const patients = [];
export const specialties = [];

// =====================
// Default export (optional)
// =====================
export default {
  getDoctors,
  getAppointments,
  createAppointment,
  login,
  register,
  doctors,
  appointments,
  patients,
  specialties,
};
