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
    tls: { rejectUnauthorized: false }
  });
};

// ─── OTP Email ────────────────────────────────────────────────────────────────
const sendOTPEmail = async (email, otp, fullName) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'demo@example.com') {
    console.log(`\n=== DEMO MODE - OTP | To: ${email} | OTP: ${otp} ===\n`);
    return { success: true, demo: true };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Nexora" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email – Nexora',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:40px 16px;">
        <div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e3e7f0;">
          <div style="height:5px;background:linear-gradient(90deg,#1b2a6b,#4a6cf7);"></div>
          <div style="padding:40px 44px 36px;">
            <div style="font-size:18px;font-weight:600;color:#1b2a6b;margin-bottom:28px;">Nexora</div>
            <h1 style="font-size:22px;font-weight:600;color:#1a1d2e;margin-bottom:10px;">Hi ${fullName}, verify your email</h1>
            <p style="font-size:14px;color:#5a5f7a;line-height:1.65;margin-bottom:24px;">
              Use the OTP below to verify your Nexora account. It expires in <strong style="color:#1b2a6b;">10 minutes</strong>.
            </p>
            <div style="background:#eef1fc;border-left:3px solid #4a6cf7;border-radius:4px 8px 8px 4px;padding:14px 18px;margin-bottom:28px;text-align:center;">
              <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1b2a6b;">${otp}</span>
            </div>
            <div style="height:1px;background:#edf0f7;margin-bottom:22px;"></div>
            <div style="font-size:13.5px;color:#7a7f99;line-height:1.7;">
              If you didn't request this, you can safely ignore this email.
              <span style="display:block;margin-top:10px;font-weight:500;color:#1b2a6b;font-size:13px;">— The Nexora Team</span>
            </div>
          </div>
          <div style="background:#f8f9fd;border-top:1px solid #edf0f7;padding:16px 44px;font-size:11px;color:#b0b4c8;text-align:center;">
            © 2026 Nexora · Powered by ProPlus Data
          </div>
        </div>
      </div>
    `
  });
  return { success: true, demo: false };
};

// ─── Trial Confirmation Email (sent to user) ──────────────────────────────────
const sendTrialConfirmationEmail = async (email, fullName) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'demo@example.com') {
    console.log(`\n=== DEMO MODE - Trial Confirmation | To: ${email} | Name: ${fullName} ===\n`);
    return { success: true, demo: true };
  }

  const transporter = createTransporter();
  const firstName = fullName ? fullName.split(' ')[0] : 'there';

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Nexora" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Nexora – Trial Request Received',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f4f6fb; font-family: 'Inter', sans-serif; padding: 40px 16px; color: #1a1d2e; }
    .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #e3e7f0; }
    .top-bar { height: 5px; background: linear-gradient(90deg, #1b2a6b, #4a6cf7); }
    .body { padding: 40px 44px 36px; }
    .logo { font-size: 18px; font-weight: 600; color: #1b2a6b; letter-spacing: 0.3px; margin-bottom: 28px; }
    h1 { font-size: 22px; font-weight: 600; color: #1a1d2e; margin-bottom: 10px; }
    .sub { font-size: 14px; color: #5a5f7a; line-height: 1.65; margin-bottom: 24px; }
    .sub strong { color: #1b2a6b; font-weight: 500; }
    .notice { background: #eef1fc; border-left: 3px solid #4a6cf7; border-radius: 4px 8px 8px 4px; padding: 14px 18px; font-size: 13.5px; color: #2e4bbf; line-height: 1.6; margin-bottom: 28px; }
    .divider { height: 1px; background: #edf0f7; margin-bottom: 22px; }
    .sign { font-size: 13.5px; color: #7a7f99; line-height: 1.7; }
    .sign span { display: block; margin-top: 10px; font-weight: 500; color: #1b2a6b; font-size: 13px; }
    .footer { background: #f8f9fd; border-top: 1px solid #edf0f7; padding: 16px 44px; font-size: 11px; color: #b0b4c8; line-height: 1.6; text-align: center; }
    .footer a { color: #a0a4bb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-bar"></div>
    <div class="body">
      <div class="logo">Nexora</div>
      <h1>Hi ${firstName}, you're all set! </h1>
      <p class="sub">
        Your <strong>Nexora Free Trial</strong> request has been received.
        We'll review it and get back to you shortly.
      </p>
      <div class="notice">
        ⏱ Expect a response within <strong>4–5 working days</strong> with your access details.
      </div>
      <div class="divider"></div>
      <div class="sign">
        Questions? Reach us at <a href="mailto:nexora@proplusdata.co" style="color:#4a6cf7;">nexora@proplusdata.co</a>
        <span>— The ProPlus Data Team</span>
      </div>
    </div>
    <div class="footer">
      This is an automated email. Please do not reply directly.<br/>
      © 2026 Nexora · Powered by ProPlus Data &nbsp;·&nbsp;
      <a href="#">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
  });
  return { success: true, demo: false };
};

// ─── Admin Notification Email (sent to swapnil@proplusdata.co) ────────────────
const sendAdminNotificationEmail = async ({ name, email, phone, jobTitle, source }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'demo@example.com') {
    console.log(`\n=== DEMO MODE - Admin Notification | Lead: ${name} | ${email} ===\n`);
    return { success: true, demo: true };
  }

  const transporter = createTransporter();
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Nexora" <${process.env.EMAIL_USER}>`,
    to: 'swapnil@proplusdata.co',
    subject: `🔔 New Free Trial Request – ${name || email}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:40px 16px;">
        <div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e3e7f0;">
          <div style="height:5px;background:linear-gradient(90deg,#1b2a6b,#4a6cf7);"></div>
          <div style="padding:32px 40px;">
            <div style="font-size:18px;font-weight:600;color:#1b2a6b;margin-bottom:20px;">Nexora · New Lead Alert</div>
            <h2 style="font-size:20px;color:#1a1d2e;margin-bottom:20px;">A new free trial request has been submitted</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #edf0f7;">
                <td style="padding:10px 0;color:#7a7f99;width:130px;">Full Name</td>
                <td style="padding:10px 0;color:#1a1d2e;font-weight:500;">${name || '—'}</td>
              </tr>
              <tr style="border-bottom:1px solid #edf0f7;">
                <td style="padding:10px 0;color:#7a7f99;">Email</td>
                <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#4a6cf7;">${email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #edf0f7;">
                <td style="padding:10px 0;color:#7a7f99;">Phone</td>
                <td style="padding:10px 0;color:#1a1d2e;">${phone || '—'}</td>
              </tr>
              <tr style="border-bottom:1px solid #edf0f7;">
                <td style="padding:10px 0;color:#7a7f99;">Job Title</td>
                <td style="padding:10px 0;color:#1a1d2e;">${jobTitle || '—'}</td>
              </tr>
              <tr style="border-bottom:1px solid #edf0f7;">
                <td style="padding:10px 0;color:#7a7f99;">Source</td>
                <td style="padding:10px 0;color:#1a1d2e;">${source || 'Landing Page'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#7a7f99;">Submitted At</td>
                <td style="padding:10px 0;color:#1a1d2e;">${submittedAt} IST</td>
              </tr>
            </table>
          </div>
          <div style="background:#f8f9fd;border-top:1px solid #edf0f7;padding:14px 40px;font-size:11px;color:#b0b4c8;text-align:center;">
            © 2026 Nexora · Powered by ProPlus Data
          </div>
        </div>
      </div>
    `
  });
  return { success: true, demo: false };
};

module.exports = { sendOTPEmail, sendTrialConfirmationEmail, sendAdminNotificationEmail };
