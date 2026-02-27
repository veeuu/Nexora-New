require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const BuyingGroup = require('./models/BuyingGroup');

const CSV_PATH = path.join(__dirname, 'Nexora Buying groups 13_02_2026.csv');

async function migrateBuyingGroups() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    console.log('📄 Reading CSV file...');
    
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`CSV file not found: ${CSV_PATH}`);
    }

    const csvData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`✓ Read ${csvData.length} rows from CSV\n`);

    // Group employees by company
    const companiesMap = {};
    
    csvData.forEach(row => {
      const companyName = row['Company Name'];
      if (!companyName) return;

      if (!companiesMap[companyName]) {
        companiesMap[companyName] = {
          companyName,
          location: row.Location || '',
          employees: []
        };
      }

      companiesMap[companyName].employees.push({
        uniqueId: row['Unique ID'] || '',
        name: row.Name || 'Unknown',
        role: row.Role || 'N/A',
        email: row.email || '',
        phone: row.phone || row.Phone || '',
        linkedin: row.Linkedin || '',
        reportsTo: row['Reports To'] || '',
        hierarchy: row.hierarchy || 'OTHER',
        category: row.Category || '',
        profileImage: row['Profile Image'] || row['LinkedIn Profile Image'] || ''
      });
    });

    console.log(`📊 Found ${Object.keys(companiesMap).length} unique companies\n`);

    // Clear existing data
    console.log('🗑️  Clearing existing buying groups...');
    await BuyingGroup.deleteMany({});
    console.log('✓ Cleared existing data\n');

    // Insert buying groups
    console.log('💾 Inserting buying groups into MongoDB...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const [companyName, companyData] of Object.entries(companiesMap)) {
      try {
        const buyingGroup = new BuyingGroup({
          companyName: companyData.companyName,
          location: companyData.location,
          employees: companyData.employees,
          // These fields can be populated later via API or manual update
          website: '',
          linkedinProfile: '',
          industry: '',
          employeeCount: companyData.employees.length.toString(),
          revenue: ''
        });

        await buyingGroup.save();
        successCount++;
        console.log(`  ✓ ${companyName} (${companyData.employees.length} employees)`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ ${companyName}: ${error.message}`);
      }
    }

    console.log(`\n✅ Migration Complete!`);
    console.log(`   Success: ${successCount} companies`);
    console.log(`   Errors: ${errorCount} companies`);
    console.log(`   Total Employees: ${csvData.length}`);

    // Show sample data
    console.log('\n📋 Sample Company:');
    const sampleCompany = await BuyingGroup.findOne().limit(1);
    if (sampleCompany) {
      console.log(`   Company: ${sampleCompany.companyName}`);
      console.log(`   Location: ${sampleCompany.location}`);
      console.log(`   Employees: ${sampleCompany.employees.length}`);
      console.log(`   Categories: ${sampleCompany.categories.join(', ')}`);
    }

    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateBuyingGroups();
