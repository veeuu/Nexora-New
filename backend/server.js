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
app.use('/api', apiRouter);
app.use('/api/auth', authRouter);
app.use('/api/buying-groups', buyingGroupRouter);

// Google Sheets email submission proxy
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    const SHEET_URL = process.env.GOOGLE_SHEET_URL || '';
    if (!SHEET_URL) {
      return res.status(500).json({ success: false, error: 'Sheet URL not configured' });
    }

    const params = new URLSearchParams();
    params.append('email', email);
    params.append('source', source || 'Landing Page');
    params.append('timestamp', new Date().toISOString());

    const response = await fetch(`${SHEET_URL}?${params.toString()}`, {
      method: 'GET',
      redirect: 'follow'
    });

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

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

