const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Company = require('./models/Company');

async function createIndexes() {
  try {

    await mongoose.connect(process.env.MONGODB_URI);

await Company.collection.createIndex({ 'Company Name': 1 });

await Company.collection.createIndex({ 'Technographics': 1 });

await Company.collection.createIndex({ 'Firmographics.About.Industry': 1 });

await Company.collection.createIndex({ 'Firmographics.Location.Country': 1 });

process.exit(0);
  } catch (err) {

    process.exit(1);
  }
}

createIndexes();
