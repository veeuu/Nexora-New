const express = require('express');
const router = express.Router();
const BuyingGroup = require('../models/BuyingGroup');
const { generateOrgChartHTML } = require('../org_chart');
const { cacheResponse } = require('../middleware/redisCache');
const { 
  uploadOrgChartToS3
} = require('../config/s3');

const MONGO_MAX_TIME_MS = Number(process.env.MONGO_MAX_TIME_MS || 1000);

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
router.get('/', cacheResponse(300), async (req, res) => {
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
    })
      .sort({ companyName: 1 })
      .maxTimeMS(MONGO_MAX_TIME_MS)
      .lean();

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
router.get('/companies', cacheResponse(300), async (req, res) => {
  try {
    const companies = await BuyingGroup.find({}, { companyName: 1, _id: 0 })
      .sort({ companyName: 1 })
      .maxTimeMS(MONGO_MAX_TIME_MS)
      .lean();

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
router.get('/categories', cacheResponse(300), async (req, res) => {
  try {
    const result = await BuyingGroup.aggregate([
      { $unwind: '$employees' },
      { $match: { 'employees.category': { $exists: true, $ne: null, $ne: '' } } },
      { $project: { categories: { $split: ['$employees.category', ','] } } },
      { $unwind: '$categories' },
      { $project: { category: { $trim: { input: '$categories' } } } },
      { $match: { category: { $ne: '' } } },
      { $group: { _id: null, categories: { $addToSet: '$category' } } },
      { $project: { _id: 0, categories: 1 } }
    ]).option({ maxTimeMS: MONGO_MAX_TIME_MS });

    const categories = (result[0]?.categories || []).sort();

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
router.get('/person-details', cacheResponse(120), async (req, res) => {
  try {
    // Get all buying groups with nested employees structure using .lean()
    const buyingGroups = await BuyingGroup.find({}, {
      companyName: 1,
      employees: 1,
      companyDescription: 1,
      employeeSize: 1,
      employeeCount: 1,
      country: 1,
      location: 1,
      revenue: 1,
      industry: 1,
      companyPhone: 1,
      domain: 1,
      website: 1,
      linkedinProfile: 1
    })
      .maxTimeMS(MONGO_MAX_TIME_MS)
      .lean();

    const companiesMap = {};
    
    buyingGroups.forEach(bg => {
      const companyName = bg.companyName;
      
      if (bg.employees && Array.isArray(bg.employees)) {
        companiesMap[companyName] = bg.employees.map(emp => {
          const designation = emp.designation || emp.role || '-';
          return {
            id: emp.uniqueId || '',
            name: emp.name || '-',
            designation: designation,
            fullRole: emp.fullRole || designation,
            email: emp.email || '-',
            phone: emp.phone || '-',
            mobileDID: emp.mobileDID || '-',
            linkedin: emp.linkedin || '',
            reportsTo: emp.reportsTo || '-',
            category: emp.category || '-',
            hierarchy: emp.hierarchy || 'OTHER',
            // Company-level fields (check both old and new field names)
            companyDescription: bg.companyDescription || '-',
            employeeSize: bg.employeeSize || bg.employeeCount || '-',
            country: bg.country || bg.location || '-',
            revenue: bg.revenue || '-',
            industry: bg.industry || '-',
            companyPhone: bg.companyPhone || bg.companyPhonethis || '-',
            domain: bg.domain || bg.website || '-',
            linkedinProfile: bg.linkedinProfile || '-'
          };
        });
      }
    });

    res.json(companiesMap);
  } catch (error) {
    console.error('[BuyingGroup] Error fetching person details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch person details',
      details: error.message
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
    }).maxTimeMS(MONGO_MAX_TIME_MS);

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
    })
      .maxTimeMS(MONGO_MAX_TIME_MS)
      .lean();

    if (!buyingGroup) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    // Convert employees to format expected by generateOrgChartHTML
    const employeeData = buyingGroup.employees.map(emp => {
      // Ensure hierarchy has a valid value
      let hierarchyValue = emp.hierarchy || 'OTHER';
      if (!hierarchyValue || hierarchyValue.trim() === '') {
        hierarchyValue = 'OTHER';
      }
      
      return {
        'Unique ID': emp.uniqueId || '',
        'Company Name': buyingGroup.companyName,
        'Name': emp.name,
        'Role': emp.designation || emp.role || 'N/A',
        'Reports To': emp.reportsTo || '',
        'hierarchy': hierarchyValue.toLowerCase().replace(/_/g, ' '),
        'Category': emp.category || '',
        'Linkedin': emp.linkedin || '',
        'email': emp.email || '',
        'Location': buyingGroup.location || ''
      };
    });

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
    } catch (s3Error) {
      // S3 error - continue without logging
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
    }).maxTimeMS(MONGO_MAX_TIME_MS);

    if (!buyingGroup) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    // Convert employees to format expected by generateOrgChartHTML
    const employeeData = buyingGroup.employees.map(emp => {
      // Ensure hierarchy has a valid value
      let hierarchyValue = emp.hierarchy || 'OTHER';
      if (!hierarchyValue || hierarchyValue.trim() === '') {
        hierarchyValue = 'OTHER';
      }
      
      return {
        'Unique ID': emp.uniqueId,
        'Company Name': buyingGroup.companyName,
        'Name': emp.name,
        'Role': emp.designation || emp.role || 'N/A',
        'Reports To': emp.reportsTo || '',
        'hierarchy': hierarchyValue.toLowerCase().replace(/_/g, ' '),
        'Category': emp.category || '',
        'Linkedin': emp.linkedin || '',
        'email': emp.email || '',
        'Location': buyingGroup.location || ''
      };
    });

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
        // S3 deletion would go here if the function was available
      } catch (s3Error) {
        // Handle error silently
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
