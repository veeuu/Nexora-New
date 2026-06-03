require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
const { connectPG } = require('./config/pgdb');
const requestLogger = require('./middleware/requestLogger');
const rateLimiter = require('./middleware/rateLimit');
const { analyticsMiddleware, getAnalyticsLog, getLogsByDate, getAvailableLogDates, logEntry } = require('./middleware/analytics');

const app = express();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(requestLogger());
app.use(analyticsMiddleware());
app.use(cors());
app.use(express.json());
app.use(compression());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/googlea2809bb769c4ca09.html', (req, res) => {
  res.sendFile(__dirname + '/googlea2809bb769c4ca09.html');
});

app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(__dirname + '/sitemap.xml');
});

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const buyingGroupRouter = require('./routes/buyingGroup');
const onDemandRouter = require('./routes/onDemand');

app.use('/api', rateLimiter);
app.use('/api/auth', authRouter);
app.use('/api/buying-groups', buyingGroupRouter);
app.use('/api/on-demand', onDemandRouter);

// ─── Admin analytics endpoint ─────────────────────────────────────────────────
// GET /api/admin/analytics?key=nexora-admin-2026
// Optional: &date=2026-04-13 &user=email &page=/api/technographics &ip=1.2.3.4 &limit=100
// GET /api/admin/analytics/dates?key=nexora-admin-2026  → list available log dates
app.get('/api/admin/analytics/dates', (req, res) => {
  if (req.query.key !== process.env.ADMIN_PROVISION_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json({ dates: getAvailableLogDates() });
});

app.get('/api/admin/analytics', (req, res) => {
  if (req.query.key !== process.env.ADMIN_PROVISION_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const limit = parseInt(req.query.limit) || 200;

  // If date param provided, read from file; otherwise use in-memory
  let logs = req.query.date
    ? getLogsByDate(req.query.date)
    : getAnalyticsLog();

  if (req.query.user) logs = logs.filter(l => l.user.includes(req.query.user));
  if (req.query.page) logs = logs.filter(l => l.page.includes(req.query.page));
  if (req.query.ip)   logs = logs.filter(l => l.ip === req.query.ip);

  const result = logs.slice(-limit).reverse();
  res.json({ total: logs.length, showing: result.length, date: req.query.date || 'today (memory)', logs: result });
});

// ─── Frontend page view tracking (public) ────────────────────────────────────
app.post('/api/track', (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    let user = 'anonymous';
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_change_in_production');
        user = decoded.email || 'anonymous';
      }
    } catch {}

    const ip = req.headers['x-real-ip'] ||
               req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.ip || 'unknown';

    logEntry({
      timestamp: new Date().toISOString(),
      ip,
      user,
      method: 'PAGE_VIEW',
      page: req.body?.page || 'unknown',
      ua: req.headers['user-agent'] || 'unknown'
    });
  } catch {}
  res.status(204).end();
});

// ─── Subscribe endpoint (public) ─────────────────────────────────────────────
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, name, source } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    // Block free/personal email domains
    const blockedDomains = ['gmail.com','yahoo.com','hotmail.com','outlook.com','live.com',
      'icloud.com','me.com','aol.com','protonmail.com','proton.me','yandex.com','mail.ru',
      'mailinator.com','guerrillamail.com','tempmail.com','yopmail.com','trashmail.com',
      'throwam.com','fakeinbox.com','discard.email','maildrop.cc','qq.com','163.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(domain)) {
      return res.status(400).json({ success: false, error: 'Please use a work or business email address' });
    }

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

    const { sendTrialConfirmationEmail, sendAdminNotificationEmail } = require('./config/email');
    try {
      await sendTrialConfirmationEmail(email, name || email);
      console.log(`[subscribe] Confirmation email sent to ${email}`);
    } catch (emailErr) {
      console.error('[subscribe] Email error:', emailErr.message);
    }

    try {
      await sendAdminNotificationEmail({
        name, email,
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

// ─── Protected API routes ─────────────────────────────────────────────────────
app.use('/api', apiRouter);

const startServer = async () => {
  try {
    await connectDB();
    await connectPG();

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
