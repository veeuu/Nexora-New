require('dotenv').config();
const mongoose = require('mongoose');

async function testDataCollection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    
    // List all collections
    console.log('\n📋 Listing all collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check if 'data' collection exists
    const dataCollectionExists = collections.some(col => col.name === 'data');
    console.log(`\n✓ 'data' collection exists: ${dataCollectionExists}`);

    if (dataCollectionExists) {
      const dataCollection = db.collection('data');
      
      // Count documents
      const count = await dataCollection.countDocuments();
      console.log(`✓ Total documents in 'data' collection: ${count}`);

      // Get one sample document
      const sample = await dataCollection.findOne();
      if (sample) {
        console.log('\n📄 Sample document structure:');
        console.log('  - Company Name:', sample['Company Name']);
        console.log('  - Has Technographics:', Array.isArray(sample.Technographics) ? `Yes (${sample.Technographics.length} items)` : 'No');
        console.log('  - Has NTP:', Array.isArray(sample.NTP) ? `Yes (${sample.NTP.length} items)` : 'No');
        console.log('  - Has Firmographics:', sample.Firmographics ? 'Yes' : 'No');
        
        if (sample.Technographics && sample.Technographics.length > 0) {
          console.log('\n  Sample Technographics item:');
          console.log('    ', JSON.stringify(sample.Technographics[0], null, 2));
        }
        
        if (sample.NTP && sample.NTP.length > 0) {
          console.log('\n  Sample NTP item:');
          console.log('    ', JSON.stringify(sample.NTP[0], null, 2));
        }
      } else {
        console.log('⚠️  No documents found in data collection');
      }
    } else {
      console.log('❌ data collection does not exist!');
      console.log('\nAvailable collections:', collections.map(c => c.name).join(', '));
    }

    await mongoose.connection.close();
    console.log('\n✓ Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

testDataCollection();
