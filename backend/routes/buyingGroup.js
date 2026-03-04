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
// GET /api/buying-groups/companies - Get company names only from MongoDB
// ============================================
router.get('/companies', async (req, res) => {
  try {
    const companies = await BuyingGroup.find({}, { companyName: 1 })
      .sort({ companyName: 1 });

    const companyNames = companies.map(bg => bg.companyName);

    res.json({
      success: true,
      companies: companyNames
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch companies' 
    });
  }
});

// ============================================
// GET /api/buying-groups/categories - Get all unique categories from MongoDB
// ============================================
router.get('/categories', async (req, res) => {
  try {
    const buyingGroups = await BuyingGroup.find({}, { employees: 1 });

    const categoriesSet = new Set();
    
    buyingGroups.forEach(bg => {
      if (bg.employees && Array.isArray(bg.employees)) {
        bg.employees.forEach(emp => {
          if (emp.category) {
            emp.category.split(',').forEach(cat => {
              categoriesSet.add(cat.trim());
            });
          }
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
// GET /api/buying-groups/person-details - Get all employee details from MongoDB
// ============================================
router.get('/person-details', async (req, res) => {
  try {
    const buyingGroups = await BuyingGroup.find({}, { 
      companyName: 1, 
      employees: 1,
      employeeSize: 1,
      country: 1,
      revenue: 1,
      industry: 1,
      companyPhone: 1,
      domain: 1,
      companyDescription: 1
    });

    const companiesMap = {};
    
    buyingGroups.forEach(bg => {
      if (bg.employees && Array.isArray(bg.employees)) {
        companiesMap[bg.companyName] = bg.employees.map(emp => ({
          id: emp.uniqueId || '',
          name: emp.name || 'N/A',
          designation: emp.role || 'N/A',
          email: emp.email || 'N/A',
          phone: emp.phone || 'N/A',
          mobileDID: emp.mobileDID || 'N/A',
          linkedin: emp.linkedin || '',
          reportsTo: emp.reportsTo || 'N/A',
          category: emp.category || 'N/A',
          hierarchy: emp.hierarchy || 'OTHER',
          // Company-level fields
          companyDescription: bg.companyDescription || 'N/A',
          employeeSize: bg.employeeSize || 'N/A',
          country: bg.country || 'N/A',
          revenue: bg.revenue || 'N/A',
          industry: bg.industry || 'N/A',
          companyPhone: bg.companyPhone || 'N/A',
          domain: bg.domain || 'N/A'
        }));
      }
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
// GET /api/buying-groups/:companyName/org-chart - Get org chart HTML from MongoDB
// ============================================
router.get('/:companyName/org-chart', async (req, res) => {
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
      'Unique ID': emp.uniqueId || '',
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
      buyingGroup.location || ''
    );

    // Upload to S3
    try {
      const fileName = buyingGroup.location 
        ? `${sanitizeFilename(buyingGroup.companyName)}_${sanitizeFilename(buyingGroup.location)}.html`
        : `${sanitizeFilename(buyingGroup.companyName)}.html`;

      const s3Result = await uploadOrgChartToS3(fileName, htmlContent);
      
      // Log successful upload
      console.log(`Org chart uploaded to S3: ${s3Result.s3Url}`);
    } catch (s3Error) {
      // Log S3 error but don't fail the request - still serve the HTML
      console.error(`Failed to upload org chart to S3: ${s3Error.message}`);
    }

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

    res.json({
      success: true,
      message: 'Org chart regenerated successfully',
      s3Url: s3Result.s3Url
    });
  } catch (error) {
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
    const buyingGroup = new BuyingGroup(req.body);
    await buyingGroup.save();
    
    res.status(201).json({
      success: true,
      message: 'Buying group created successfully',
      data: buyingGroup
    });
  } catch (error) {
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

    res.json({
      success: true,
      message: 'Buying group updated successfully',
      data: buyingGroup
    });
  } catch (error) {
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
      }
    }

    res.json({
      success: true,
      message: 'Buying group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete buying group' 
    });
  }
});

module.exports = router;
