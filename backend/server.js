require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
const { connectPG } = require('./config/pgdb');
const requestLogger = require('./middleware/requestLogger');
const rateLimiter = require('./middleware/rateLimit');

const app = express();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(requestLogger());
app.use(cors());
app.use(express.json());
app.use(compression());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const buyingGroupRouter = require('./routes/buyingGroup');

app.use('/api', rateLimiter);
app.use('/api/auth', authRouter);        // auth routes FIRST - no token needed
app.use('/api/buying-groups', buyingGroupRouter);
app.use('/api', apiRouter);              // protected routes AFTER

// Google Sheets email submission proxy + trial confirmation email
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, name, source } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    // 1. Send to Google Sheet
    const SHEET_URL = process.env.GOOGLE_SHEET_URL || '';
    if (SHEET_URL) {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('name', name || '');
      params.append('phone', req.body.phone || '');
      params.append('jobTitle', req.body.jobTitle || '');
      params.append('source', source || 'Landing Page');
      params.append('timestamp', new Date().toISOString());
      try {
        await fetch(`${SHEET_URL}?${params.toString()}`, { method: 'GET', redirect: 'follow' });
      } catch (sheetErr) {
        console.warn('[subscribe] Sheet error:', sheetErr.message);
      }
    }

    // 2. Send trial confirmation email to user
    const { sendTrialConfirmationEmail, sendAdminNotificationEmail } = require('./config/email');
    try {
      await sendTrialConfirmationEmail(email, name || email);
      console.log(`[subscribe] Confirmation email sent to ${email}`);
    } catch (emailErr) {
      console.error('[subscribe] Email error:', emailErr.message);
    }

    // 3. Notify admin (swapnil@proplusdata.co)
    try {
      await sendAdminNotificationEmail({
        name,
        email,
        phone: req.body.phone || '',
        jobTitle: req.body.jobTitle || '',
        source
      });
      console.log(`[subscribe] Admin notified for ${email}`);
    } catch (adminErr) {
      console.error('[subscribe] Admin email error:', adminErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[subscribe]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const startServer = async () => {
  try {
    await connectDB();
    await connectPG();

    // Auto-migrate: add plan column if missing
    const PgUser = require('./models/PgUser');
    await PgUser.sync({ alter: true });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

