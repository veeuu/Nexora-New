const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora';

async function buildNtpFlat(db) {
  const dataCollection = db.collection('data');

  console.log('Building ntp_flat...');
  await dataCollection.aggregate([
    { $unwind: '$NTP' },
    {
      $project: {
        _id: 0,
        companyName: '$Company Name',
        domain: '$Firmographics.About.Domain',
        linkedinUrl: {
          $ifNull: [
            '$Firmographics.About.linkedinUrl',
            { $ifNull: ['$Firmographics.About.LinkedIn URL', ''] }
          ]
        },
        category: '$NTP.Category',
        technology: '$NTP.Technology',
        purchaseProbability: '$NTP.Purchase Probability (%)',
        purchasePrediction: '$NTP.Purchase Prediction',
        ntpAnalysis: '$NTP.NTP Analysis',
        latestDetectedDate: { $ifNull: ['$NTP.Latest Date', 'N/A'] },
        previousDetectedDate: { $ifNull: ['$NTP.Previous Date', 'N/A'] }
      }
    },
    {
      $addFields: {
        _id: {
          $concat: [
            { $ifNull: ['$companyName', ''] }, '|',
            { $ifNull: ['$technology', ''] }, '|',
            { $ifNull: ['$category', ''] }, '|',
            { $ifNull: ['$purchasePrediction', ''] }, '|',
            { $ifNull: ['$latestDetectedDate', ''] }
          ]
        }
      }
    },
    {
      $merge: {
        into: 'ntp_flat',
        whenMatched: 'replace',
        whenNotMatched: 'insert'
      }
    }
  ], { allowDiskUse: true }).toArray();
  console.log('ntp_flat built');
}

async function buildTechnographicsFlat(db) {
  const dataCollection = db.collection('data');

  console.log('Building technographics_flat...');
  await dataCollection.aggregate([
    { $unwind: '$Technographics' },
    {
      $project: {
        _id: 0,
        companyName: '$Company Name',
        region: { $ifNull: ['$Firmographics.Location.Country', 'N/A'] },
        industry: { $ifNull: ['$Firmographics.About.Industry', 'N/A'] },
        employeeSize: {
          $ifNull: [
            '$Firmographics.About.Full Time employees',
            { $ifNull: ['$Firmographics.About.Employees', 'N/A'] }
          ]
        },
        revenue: { $ifNull: ['$Financial_Data.Finance.Total Revenue', 'N/A'] },
        category: '$Technographics.Category',
        technology: '$Technographics.Keyword',
        domain: { $ifNull: ['$Firmographics.About.Domain', 'N/A'] },
        linkedinUrl: {
          $ifNull: [
            '$Firmographics.About.linkedinUrl',
            { $ifNull: ['$Firmographics.About.LinkedIn URL', ''] }
          ]
        },
        previousDetectedDate: { $ifNull: ['$Technographics.Previous Date', 'N/A'] },
        latestDetectedDate: { $ifNull: ['$Technographics.Latest Date', 'N/A'] },
        renewalDate: { $ifNull: ['$Technographics.Renewal Date', 'N/A'] }
      }
    },
    {
      $addFields: {
        _id: {
          $concat: [
            { $ifNull: ['$companyName', ''] }, '|',
            { $ifNull: ['$technology', ''] }, '|',
            { $ifNull: ['$category', ''] }, '|',
            { $ifNull: ['$latestDetectedDate', ''] }
          ]
        }
      }
    },
    {
      $merge: {
        into: 'technographics_flat',
        whenMatched: 'replace',
        whenNotMatched: 'insert'
      }
    }
  ], { allowDiskUse: true }).toArray();
  console.log('technographics_flat built');
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    await buildNtpFlat(db);
    await buildTechnographicsFlat(db);

    console.log('Flat collections updated.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to build flat collections:', err.message);
    process.exit(1);
  }
}

run();
