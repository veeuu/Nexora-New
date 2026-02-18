require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

<<<<<<< HEAD
=======
connectDB();

>>>>>>> 07faee509ca89d23abcb9b7db2f92e977716e19f
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
app.use('/api', apiRouter);
app.use('/api/auth', authRouter);

<<<<<<< HEAD
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
=======
app.listen(PORT, '0.0.0.0', () => {

});
>>>>>>> 07faee509ca89d23abcb9b7db2f92e977716e19f
