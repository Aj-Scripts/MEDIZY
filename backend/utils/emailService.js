const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Medizy Healthcare'
      },
      subject,
      text,
      html
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
};

const sendAppointmentConfirmation = async ({ 
  patientEmail, 
  patientName, 
  doctorName, 
  doctorEmail,
  date, 
  time, 
  tokenNumber,
  fees,
  appointmentId 
}) => {
  // Format date and time for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [startTime] = time.split('-');
  const formattedTime = new Date(`2000-01-01T${startTime}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  // Patient email
  const patientHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #667eea; }
        .token { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: #f0f4ff; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Confirmed! ✓</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your appointment has been successfully booked. Please find the details below:</p>
          
          <div class="token">
            Token Number: ${tokenNumber}
          </div>

          <div class="detail-box">
            <div class="detail-row">
              <span class="detail-label">Doctor:</span>
              <span>Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Consultation Fee:</span>
              <span>₹${fees}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Appointment ID:</span>
              <span>${appointmentId}</span>
            </div>
          </div>

          <h3>Important Instructions:</h3>
          <ul>
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring any relevant medical records or test results</li>
            <li>Your token number is <strong>${tokenNumber}</strong></li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient-dashboard" class="button">
              View Appointment
            </a>
          </div>

          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Thank you for choosing Medizy Healthcare!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Medizy Healthcare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const patientText = `
    Appointment Confirmed!
    
    Dear ${patientName},
    
    Your appointment has been successfully booked.
    
    Token Number: ${tokenNumber}
    Doctor: Dr. ${doctorName}
    Date: ${formattedDate}
    Time: ${formattedTime}
    Consultation Fee: ₹${fees}
    Appointment ID: ${appointmentId}
    
    Please arrive 10 minutes before your scheduled time and bring any relevant medical records.
    
    Thank you for choosing Medizy Healthcare!
  `;

  // Doctor email
  const doctorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #667eea; }
        .token { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: #f0f4ff; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Appointment Booking</h1>
        </div>
        <div class="content">
          <p>Dear Dr. <strong>${doctorName}</strong>,</p>
          <p>A new appointment has been booked with you:</p>
          
          <div class="token">
            Token Number: ${tokenNumber}
          </div>

          <div class="detail-box">
            <div class="detail-row">
              <span class="detail-label">Patient:</span>
              <span>${patientName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Consultation Fee:</span>
              <span>₹${fees}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Appointment ID:</span>
              <span>${appointmentId}</span>
            </div>
          </div>

          <p>Please review the appointment details in your dashboard.</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Medizy Healthcare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const doctorText = `
    New Appointment Booking
    
    Dear Dr. ${doctorName},
    
    A new appointment has been booked with you.
    
    Token Number: ${tokenNumber}
    Patient: ${patientName}
    Date: ${formattedDate}
    Time: ${formattedTime}
    Consultation Fee: ₹${fees}
    Appointment ID: ${appointmentId}
    
    Please review the appointment details in your dashboard.
  `;

  // Send emails to both patient and doctor
  const results = await Promise.allSettled([
    sendEmail({
      to: patientEmail,
      subject: `Appointment Confirmed - Token #${tokenNumber}`,
      html: patientHtml,
      text: patientText
    }),
    sendEmail({
      to: doctorEmail,
      subject: `New Appointment - ${patientName}`,
      html: doctorHtml,
      text: doctorText
    })
  ]);

  return {
    patientEmail: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: results[0].reason },
    doctorEmail: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: results[1].reason }
  };
};

const sendRescheduleNotification = async ({ 
  patientEmail, 
  patientName, 
  doctorName,
  oldDate,
  oldTime,
  newDate, 
  newTime, 
  status // 'requested', 'accepted', 'rejected'
}) => {
  const formattedOldDate = new Date(oldDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedNewDate = new Date(newDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let subject, message;
  if (status === 'requested') {
    subject = 'Reschedule Request Submitted';
    message = `Your request to reschedule your appointment from ${formattedOldDate} to ${formattedNewDate} has been submitted and is pending approval.`;
  } else if (status === 'accepted') {
    subject = 'Appointment Rescheduled';
    message = `Your appointment has been successfully rescheduled to ${formattedNewDate} at ${newTime}.`;
  } else {
    subject = 'Reschedule Request Declined';
    message = `Your request to reschedule to ${formattedNewDate} could not be accommodated. Your original appointment on ${formattedOldDate} remains active.`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>${subject}</h2>
        <p>Dear ${patientName},</p>
        <p>${message}</p>
        <p>Doctor: Dr. ${doctorName}</p>
        <p>Thank you for using Medizy Healthcare!</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: patientEmail,
    subject,
    html,
    text: message
  });
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendRescheduleNotification
};