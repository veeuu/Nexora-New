const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Company = require('./models/Company');

async function createIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');

    console.log('Creating indexes...');
    
    // Create indexes for faster queries
    await Company.collection.createIndex({ 'Company Name': 1 });
    console.log('✓ Index on Company Name');
    
    await Company.collection.createIndex({ 'Technographics': 1 });
    console.log('✓ Index on Technographics');
    
    await Company.collection.createIndex({ 'Firmographics.About.Industry': 1 });
    console.log('✓ Index on Industry');
    
    await Company.collection.createIndex({ 'Firmographics.Location.Country': 1 });
    console.log('✓ Index on Country');

    console.log('\n✓ All indexes created successfully!');
    console.log('Database queries should now be faster.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating indexes:', err);
    process.exit(1);
  }
}

createIndexes();
