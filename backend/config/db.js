const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Socket timeout
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 30000
    });
    console.log('✓ MongoDB Connected successfully');
    console.log(`✓ Database: ${mongoose.connection.name}`);
    console.log(`✓ Host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('✗ MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
