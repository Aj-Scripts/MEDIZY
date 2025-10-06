const axios = require('axios');

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

(async () => {
  try {
    console.log('Starting smoke tests...');

    // Login admin
  const adminLogin = await api.post('/auth/login', { email: 'admin@medizy.com', password: 'admin123' }, { headers: { 'x-skip-captcha': 'true' } });
    const adminToken = adminLogin.data.token;
    console.log('Admin logged in');

    // Login patient
  const patientLogin = await api.post('/auth/login', { email: 'patient@medizy.com', password: 'patient123' }, { headers: { 'x-skip-captcha': 'true' } });
    const patientToken = patientLogin.data.token;
    console.log('Patient logged in');

    // Get doctors
    const doctorsRes = await api.get('/doctors');
    const doctor = doctorsRes.data[0];
    console.log('Found doctor:', doctor.user.name);

    // Patient books an appointment for tomorrow
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    const dateStr = tom.toISOString().split('T')[0];
    const bookRes = await api.post('/appointments', { doctorId: doctor.user._id || doctor.user, date: dateStr, time: '10:30', amount: 100 }, { headers: { Authorization: `Bearer ${patientToken}` } });
    console.log('Appointment booked, tokenNumber:', bookRes.data.tokenNumber);

    const apptId = bookRes.data._id;

    // Patient requests reschedule
    const resReq = await api.post(`/appointments/${apptId}/reschedule`, { date: dateStr, time: '11:00' }, { headers: { Authorization: `Bearer ${patientToken}` } });
    console.log('Reschedule request created, requests count:', (resReq.data.rescheduleRequests || []).length);

    const reqId = resReq.data.rescheduleRequests[0]._id;

    // Admin accepts reschedule
    const accept = await api.post(`/appointments/${apptId}/reschedule/${reqId}/accept`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('Reschedule accepted, new time:', accept.data.time);

    console.log('Smoke tests passed');
  } catch (err) {
    console.error('Smoke test failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
})();
