const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, 
      socketTimeoutMS: 45000, 
      maxPoolSize: 10, 
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 30000
    });
    console.log('✓ MongoDB Connected successfully');
    console.log(`✓ Database: ${mongoose.connection.name}`);
    console.log(`✓ Host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('✗ MongoDB Connection Error:', err.message);
    
    process.exit(1);
  }
};

module.exports = connectDB;
