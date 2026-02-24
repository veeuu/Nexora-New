const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora';

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const dataCollection = db.collection('data');

    console.log('\n📊 Creating indexes on "data" collection...\n');

    // Index for Company Name (used in filters)
    console.log('Creating index on "Company Name"...');
    await dataCollection.createIndex({ 'Company Name': 1 });
    console.log('✓ Index created: Company Name');

    // Index for Technographics array fields
    console.log('Creating index on "Technographics.Category"...');
    await dataCollection.createIndex({ 'Technographics.Category': 1 });
    console.log('✓ Index created: Technographics.Category');

    console.log('Creating index on "Technographics.Keyword"...');
    await dataCollection.createIndex({ 'Technographics.Keyword': 1 });
    console.log('✓ Index created: Technographics.Keyword');

    console.log('Creating index on "Technographics.Latest Date"...');
    await dataCollection.createIndex({ 'Technographics.Latest Date': 1 });
    console.log('✓ Index created: Technographics.Latest Date');

    // Index for NTP array fields
    console.log('Creating index on "NTP.Category"...');
    await dataCollection.createIndex({ 'NTP.Category': 1 });
    console.log('✓ Index created: NTP.Category');

    console.log('Creating index on "NTP.Technology"...');
    await dataCollection.createIndex({ 'NTP.Technology': 1 });
    console.log('✓ Index created: NTP.Technology');

    console.log('Creating index on "NTP.Purchase Prediction"...');
    await dataCollection.createIndex({ 'NTP.Purchase Prediction': 1 });
    console.log('✓ Index created: NTP.Purchase Prediction');

    // Index for Firmographics fields (used in filters and projections)
    console.log('Creating index on "Firmographics.Location.Country"...');
    await dataCollection.createIndex({ 'Firmographics.Location.Country': 1 });
    console.log('✓ Index created: Firmographics.Location.Country');

    console.log('Creating index on "Firmographics.About.Industry"...');
    await dataCollection.createIndex({ 'Firmographics.About.Industry': 1 });
    console.log('✓ Index created: Firmographics.About.Industry');

    console.log('Creating index on "Firmographics.About.Domain"...');
    await dataCollection.createIndex({ 'Firmographics.About.Domain': 1 });
    console.log('✓ Index created: Firmographics.About.Domain');

    // Compound indexes for common query patterns
    console.log('Creating compound index on Company Name + Technographics.Category...');
    await dataCollection.createIndex({ 
      'Company Name': 1, 
      'Technographics.Category': 1 
    });
    console.log('✓ Compound index created: Company Name + Technographics.Category');

    console.log('Creating compound index on Company Name + NTP.Category...');
    await dataCollection.createIndex({ 
      'Company Name': 1, 
      'NTP.Category': 1 
    });
    console.log('✓ Compound index created: Company Name + NTP.Category');

    console.log('\n✅ All indexes created successfully!');
    console.log('\n📋 Listing all indexes on "data" collection:');
    
    const indexes = await dataCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} ${index.name ? `(${index.name})` : ''}`);
    });

    console.log('\n🎉 Index creation complete! You can now restart your backend server.');
    console.log('Expected query performance: 2-10 seconds (down from 160+ seconds)');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error creating indexes:', err.message);
    console.error(err);
    process.exit(1);
  }
}

createIndexes();
