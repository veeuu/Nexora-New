const nodemailer = require('nodemailer');

const createTransporter = () => {

  const port = parseInt(process.env.EMAIL_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // allows self-signed certs on some hosts
    }
  });
};

const sendOTPEmail = async (email, otp, fullName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Nexora" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Nexora',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Nexora, ${fullName}!</h2>
          <p style="color: #666; font-size: 16px;">Thank you for creating an account with us.</p>
          <p style="color: #666; font-size: 16px;">Your One-Time Password (OTP) for email verification is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Powered by ProPlus Data</p>
        </div>
      `
    };

if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'demo@example.com') {
      console.log('\n=================================');
      console.log(' DEMO MODE - OTP Email');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Name: ${fullName}`);
      console.log(`OTP: ${otp}`);
      console.log('=================================\n');
return { success: true, demo: true };
    }

    await transporter.sendMail(mailOptions);
    return { success: true, demo: false };
  } catch (error) {

    throw error;
  }
};

module.exports = { sendOTPEmail };
