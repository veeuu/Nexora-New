require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Init Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To accept JSON data in the body

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Define Routes
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
app.use('/api', apiRouter);
app.use('/api/auth', authRouter);

// Listen on all network interfaces (0.0.0.0) to allow access from other devices on the local network.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Backend server listening on http://0.0.0.0:${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  // Org charts are now generated on-demand when companies are selected
});