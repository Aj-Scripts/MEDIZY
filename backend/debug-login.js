const axios = require('axios');
(async ()=>{
  try{
    console.log('Attempt admin login...');
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'admin@medizy.com', password: 'admin123' }, { headers: { 'x-skip-captcha': 'true' } });
    console.log('Login success:', res.data);
  } catch (err) {
    console.error('ERROR stack:', err.stack);
    console.error('ERROR message:', err.message);
    if (err.response) {
      console.error('ERR status', err.response.status);
      console.error('ERR data', err.response.data);
    }
  }
})();
