const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const BuyingGroup = require('./models/BuyingGroup');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora';

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const dataCollection = db.collection('data');
    const renewalCollection = db.collection('renewal_intel');
    const intentCollection = db.collection('intent_data');
    const dataDictionaryCollection = db.collection('tech_data_dictionary');
    const ntpFlatCollection = db.collection('ntp_flat');
    const technographicsFlatCollection = db.collection('technographics_flat');

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

    console.log('Creating index on "NTP.Purchase Probability (%)"...');
    await dataCollection.createIndex({ 'NTP.Purchase Probability (%)': 1 });
    console.log('✓ Index created: NTP.Purchase Probability (%)');

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

    console.log('\nCreating indexes on "renewal_intel" collection...\n');
    await renewalCollection.createIndex({ 'Company Name': 1 });
    await renewalCollection.createIndex({ Category: 1 });
    await renewalCollection.createIndex({ Keyword: 1 });
    await renewalCollection.createIndex({ 'Renewal Date': 1 });
    console.log('✓ Indexes created: renewal_intel');

    console.log('\nCreating indexes on "intent_data" collection...\n');
    await intentCollection.createIndex({ 'Company Name': 1 });
    await intentCollection.createIndex({ 'Intent Status': 1 });
    console.log('✓ Indexes created: intent_data');

    console.log('\nCreating indexes on "tech_data_dictionary" collection...\n');
    await dataDictionaryCollection.createIndex({ 'Data Attribute': 1 });
    console.log('✓ Indexes created: tech_data_dictionary');

    console.log('\nEnsuring indexes on "buyinggroups" collection...\n');
    await BuyingGroup.collection.createIndex({ companyName: 1 }, { unique: true });
    await BuyingGroup.collection.createIndex({ 'employees.category': 1 });
    await BuyingGroup.collection.createIndex({ 'employees.hierarchy': 1 });
    await BuyingGroup.collection.createIndex({ location: 1 });
    console.log('✓ Indexes created: buyinggroups');

    console.log('\nCreating indexes on "ntp_flat" collection...\n');
    await ntpFlatCollection.createIndex({ companyName: 1 });
    await ntpFlatCollection.createIndex({ category: 1 });
    await ntpFlatCollection.createIndex({ technology: 1 });
    await ntpFlatCollection.createIndex({ purchasePrediction: 1 });
    await ntpFlatCollection.createIndex({ latestDetectedDate: 1 });
    console.log('✓ Indexes created: ntp_flat');

    console.log('\nCreating indexes on "technographics_flat" collection...\n');
    await technographicsFlatCollection.createIndex({ companyName: 1 });
    await technographicsFlatCollection.createIndex({ category: 1 });
    await technographicsFlatCollection.createIndex({ technology: 1 });
    await technographicsFlatCollection.createIndex({ region: 1 });
    await technographicsFlatCollection.createIndex({ industry: 1 });
    // Compound indexes for common filter combinations
    await technographicsFlatCollection.createIndex({ category: 1, technology: 1, region: 1 });
    await technographicsFlatCollection.createIndex({ category: 1, industry: 1, region: 1 });
    await technographicsFlatCollection.createIndex({ technology: 1, region: 1, industry: 1 });
    await technographicsFlatCollection.createIndex({ employeeSize: 1, category: 1 });
    console.log('✓ Indexes created: technographics_flat');

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
