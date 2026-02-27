require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectPG } = require('./config/pgdb');

connectDB();
connectPG();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const buyingGroupRouter = require('./routes/buyingGroup');

app.use('/api', apiRouter);
app.use('/api/auth', authRouter);
app.use('/api/buying-groups', buyingGroupRouter);

const startServer = async () => {
  try {
    
    await connectDB();

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

startServer();

app.listen(PORT, '0.0.0.0', () => {

});

