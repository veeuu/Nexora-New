require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const productCatalogueData = require('./config/productCatalogueData');
const productCatalogue2026Data = require('./config/productCatalogue2026Data');

const seedProductCatalogue = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    
    // Seed 2025 data
    const collection2025 = db.collection('product_catalogue');
    await collection2025.deleteMany({});
    const result2025 = await collection2025.insertMany(productCatalogueData);
    console.log(`Successfully inserted ${result2025.insertedCount} product catalogue records for 2025`);
    
    // Seed 2026 data
    const collection2026 = db.collection('product_catalogue_2026');
    await collection2026.deleteMany({});
    const result2026 = await collection2026.insertMany(productCatalogue2026Data);
    console.log(`Successfully inserted ${result2026.insertedCount} product catalogue records for 2026`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding product catalogue:', err.message);
    process.exit(1);
  }
};

seedProductCatalogue();
