require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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
app.use('/api', apiRouter);

// Listen on all network interfaces (0.0.0.0) to allow access from other devices on the local network.
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  
  // Initialize default org chart on server startup
  if (apiRouter.initializeDefaultOrgChart) {
    await apiRouter.initializeDefaultOrgChart();
  }
});