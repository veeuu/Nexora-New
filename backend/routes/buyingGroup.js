const express = require('express');
const router = express.Router();
const BuyingGroup = require('../models/BuyingGroup');
const { generateOrgChartHTML } = require('../org_chart');
const { 
  uploadOrgChartToS3, 
  getSignedOrgChartUrl, 
  getOrgChartFromS3,
  orgChartExistsInS3 
} = require('../config/s3');

// Helper function to sanitize filename
function sanitizeFilename(name) {
  name = String(name);
  name = name.replace(/[^\w\s-]/g, '').trim();
  name = name.replace(/[-\s]+/g, '_');
  return name || 'untitled_chart';
}

// ============================================
// GET /api/buying-groups - Get all companies
// ============================================
router.get('/', async (req, res) => {
  try {
    const buyingGroups = await BuyingGroup.find({}, {
      companyName: 1,
      website: 1,
      linkedinProfile: 1,
      location: 1,
      industry: 1,
      employeeCount: 1,
      revenue: 1,
      companyDescription: 1,
      employeeSize: 1,
      country: 1,
      companyPhone: 1,
      domain: 1,
      'orgChart.s3Url': 1,
      'orgChart.generatedAt': 1
    }).sort({ companyName: 1 });

    res.json({
      success: true,
      count: buyingGroups.length,
      data: buyingGroups
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch buying groups' 
    });
  }
});

// ============================================
// GET /api/buying-groups/companies - Get company names only from CSV
// ============================================
router.get('/companies', async (req, res) => {
  try {
    
    const fs = require('fs');
    const csv = require('csv-parser');
    const path = require('path');

    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const csvData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const companies = [...new Set(csvData.map(row => row['Company Name']).filter(Boolean))].sort();

    res.json({
      success: true,
      companies
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch companies' 
    });
  }
});

// ============================================
// GET /api/buying-groups/categories - Get all unique categories from CSV
// ============================================
router.get('/categories', async (req, res) => {
  try {
    
    const fs = require('fs');
    const csv = require('csv-parser');
    const path = require('path');

    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const csvData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const categoriesSet = new Set();
    csvData.forEach(row => {
      if (row.Category) {
        row.Category.split(',').forEach(cat => {
          categoriesSet.add(cat.trim());
        });
      }
    });

    const categories = Array.from(categoriesSet).sort();

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

// ============================================
// GET /api/buying-groups/person-details - Get all employee details from CSV
// ============================================
router.get('/person-details', async (req, res) => {
  try {
    
    const fs = require('fs');
    const csv = require('csv-parser');
    const path = require('path');

    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const csvData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // Group by company and extract company info from first row
    const companiesMap = {};
    
    csvData.forEach(row => {
      const companyName = row['Company Name'];
      if (!companyName) return;

      if (!companiesMap[companyName]) {
        companiesMap[companyName] = [];
      }

      companiesMap[companyName].push({
        id: row['Unique ID'] || '',
        name: row.Name || 'N/A',
        designation: row.Role || 'N/A',
        email: row.email || 'N/A',
        phone: row.phone || row.Phone || 'N/A',
        mobileDID: row['Mobile DID'] || 'N/A',
        linkedin: row.Linkedin || '',
        reportsTo: row['Reports To'] || 'N/A',
        category: row.Category || 'N/A',
        hierarchy: row.hierarchy || 'OTHER',
        // Company-level fields
        companyDescription: row['Company Description'] || 'N/A',
        employeeSize: row['Employee Size'] || 'N/A',
        country: row.Country || 'N/A',
        revenue: row.Revenue || 'N/A',
        industry: row.Industry || 'N/A',
        companyPhone: row['Company Phone'] || 'N/A',
        domain: row.Domain || 'N/A'
      });
    });

    res.json(companiesMap);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch person details' 
    });
  }
});

// ============================================
// GET /api/buying-groups/:companyName - Get specific company details
// ============================================
router.get('/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    
    const buyingGroup = await BuyingGroup.findOne({ 
      companyName: decodedCompanyName 
    });

    if (!buyingGroup) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    res.json({
      success: true,
      data: buyingGroup
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch company details' 
    });
  }
});

// ============================================
// GET /api/buying-groups/:companyName/org-chart - Get org chart HTML
// ============================================
router.get('/:companyName/org-chart', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    
    const fs = require('fs');
    const csv = require('csv-parser');
    const path = require('path');

    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const csvData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // Filter data for this company
    const companyData = csvData.filter(row => row['Company Name'] === decodedCompanyName);

    if (companyData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    // Generate org chart from CSV data
    const location = companyData[0]?.Location ? String(companyData[0].Location).trim() : '';
    
    const htmlContent = generateOrgChartHTML(
      companyData, 
      decodedCompanyName, 
      location
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch org chart' 
    });
  }
});

// ============================================
// POST /api/buying-groups/:companyName/regenerate-chart - Regenerate org chart
// ============================================
router.post('/:companyName/regenerate-chart', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    
    const buyingGroup = await BuyingGroup.findOne({ 
      companyName: decodedCompanyName 
    });

    if (!buyingGroup) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    // Convert employees to format expected by generateOrgChartHTML
    const employeeData = buyingGroup.employees.map(emp => ({
      'Unique ID': emp.uniqueId,
      'Company Name': buyingGroup.companyName,
      'Name': emp.name,
      'Role': emp.role,
      'Reports To': emp.reportsTo || '',
      'hierarchy': emp.hierarchy,
      'Category': emp.category || '',
      'Linkedin': emp.linkedin || '',
      'email': emp.email || '',
      'Location': buyingGroup.location || ''
    }));

    const htmlContent = generateOrgChartHTML(
      employeeData, 
      buyingGroup.companyName, 
      buyingGroup.location
    );

    // Upload to S3
    const fileName = buyingGroup.location 
      ? `${sanitizeFilename(buyingGroup.companyName)}_${sanitizeFilename(buyingGroup.location)}.html`
      : `${sanitizeFilename(buyingGroup.companyName)}.html`;

    const s3Result = await uploadOrgChartToS3(fileName, htmlContent);

    // Update MongoDB with S3 info
    buyingGroup.orgChart = {
      s3Key: s3Result.s3Key,
      s3Url: s3Result.s3Url,
      generatedAt: new Date(),
      fileSize: s3Result.fileSize
    };
    await buyingGroup.save();

    console.log(`[ORG-CHART] ✓ Regenerated and uploaded to S3`);

    res.json({
      success: true,
      message: 'Org chart regenerated successfully',
      s3Url: s3Result.s3Url
    });
  } catch (error) {
    console.error('[ORG-CHART] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to regenerate org chart' 
    });
  }
});

// ============================================
// POST /api/buying-groups - Create new buying group
// ============================================
router.post('/', async (req, res) => {
  try {
    console.log('[BUYING-GROUPS] Creating new buying group...');
    
    const buyingGroup = new BuyingGroup(req.body);
    await buyingGroup.save();

    console.log(`[BUYING-GROUPS] ✓ Created: ${buyingGroup.companyName}`);
    
    res.status(201).json({
      success: true,
      message: 'Buying group created successfully',
      data: buyingGroup
    });
  } catch (error) {
    console.error('[BUYING-GROUPS] Error:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Company already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create buying group' 
    });
  }
});

// ============================================
// PUT /api/buying-groups/:companyName - Update buying group
// ============================================
router.put('/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    
    console.log(`[BUYING-GROUPS] Updating: ${decodedCompanyName}`);
    
    const buyingGroup = await BuyingGroup.findOneAndUpdate(
      { companyName: decodedCompanyName },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!buyingGroup) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    console.log(`[BUYING-GROUPS] ✓ Updated: ${decodedCompanyName}`);
    
    res.json({
      success: true,
      message: 'Buying group updated successfully',
      data: buyingGroup
    });
  } catch (error) {
    console.error('[BUYING-GROUPS] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update buying group' 
    });
  }
});

// ============================================
// DELETE /api/buying-groups/:companyName - Delete buying group
// ============================================
router.delete('/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    
    console.log(`[BUYING-GROUPS] Deleting: ${decodedCompanyName}`);
    
    const buyingGroup = await BuyingGroup.findOneAndDelete({ 
      companyName: decodedCompanyName 
    });

    if (!buyingGroup) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    // Delete from S3 if exists
    if (buyingGroup.orgChart && buyingGroup.orgChart.s3Key) {
      try {
        await deleteOrgChartFromS3(buyingGroup.orgChart.s3Key);
      } catch (s3Error) {
        console.error('[BUYING-GROUPS] S3 deletion failed:', s3Error.message);
      }
    }

    console.log(`[BUYING-GROUPS] ✓ Deleted: ${decodedCompanyName}`);
    
    res.json({
      success: true,
      message: 'Buying group deleted successfully'
    });
  } catch (error) {
    console.error('[BUYING-GROUPS] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete buying group' 
    });
  }
});

module.exports = router;
