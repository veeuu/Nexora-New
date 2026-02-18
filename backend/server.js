require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start the server after DB connection is established
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Backend server listening on http://0.0.0.0:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log('✓ Server ready to accept requests');
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();