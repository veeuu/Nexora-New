const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { generateOrgChartHTML } = require('../org_chart');
const { cacheResponse } = require('../middleware/redisCache');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadOrgChartToS3, getSignedOrgChartUrl, orgChartExistsInS3 } = require('../config/s3');

const MONGO_MAX_TIME_MS = Number(process.env.MONGO_MAX_TIME_MS || 1000);

// Apply auth to all buying group routes
router.use(authMiddleware);

// Get correct collection based on user plan
const getBGCollection = (req) => {
  const plan = req.user?.plan || 'free_trial';
  const colName = plan === 'paid' ? 'buyinggroups' : 'buyinggroups_free';
  return mongoose.connection.db.collection(colName);
};

function sanitizeFilename(name) {
  name = String(name);
  name = name.replace(/[^\w\s-]/g, '').trim();
  name = name.replace(/[-\s]+/g, '_');
  return name || 'untitled';
}

// GET /api/buying-groups - Get all companies
router.get('/', cacheResponse(300), async (req, res) => {
  try {
    const col = getBGCollection(req);
    const buyingGroups = await col.find({}, {
      projection: {
        companyName: 1, website: 1, linkedinProfile: 1, location: 1,
        industry: 1, employeeCount: 1, revenue: 1, companyDescription: 1,
        employeeSize: 1, country: 1, companyPhone: 1, domain: 1,
        'orgChart.s3Url': 1, 'orgChart.generatedAt': 1
      }
    }).sort({ companyName: 1 }).maxTimeMS(MONGO_MAX_TIME_MS).toArray();

    res.json({ success: true, count: buyingGroups.length, data: buyingGroups });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch buying groups' });
  }
});

// GET /api/buying-groups/companies
router.get('/companies', cacheResponse(300), async (req, res) => {
  try {
    const col = getBGCollection(req);
    const companies = await col.find({}, { projection: { companyName: 1, _id: 0 } })
      .sort({ companyName: 1 }).maxTimeMS(MONGO_MAX_TIME_MS).toArray();
    res.json({ success: true, companies: companies.map(c => c.companyName) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
});

// GET /api/buying-groups/categories
router.get('/categories', cacheResponse(300), async (req, res) => {
  try {
    const col = getBGCollection(req);
    const result = await col.aggregate([
      { $unwind: '$employees' },
      { $match: { 'employees.category': { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$employees.category' } },
      { $sort: { _id: 1 } }
    ]).toArray();
    const categories = new Set();
    result.forEach(doc => {
      if (doc._id) doc._id.split(',').forEach(c => categories.add(c.trim()));
    });
    res.json({ success: true, categories: Array.from(categories).sort() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// GET /api/buying-groups/person-details
router.get('/person-details', cacheResponse(300), async (req, res) => {
  try {
    const col = getBGCollection(req);
    const buyingGroups = await col.find({}, {
      projection: {
        companyName: 1, employees: 1, _id: 0,
        revenue: 1, companyPhone: 1,
        employeeSize: 1, employeeCount: 1,
        country: 1, industry: 1, domain: 1,
        website: 1, linkedinProfile: 1, location: 1
      }
    }).maxTimeMS(MONGO_MAX_TIME_MS).toArray();

    const companiesMap = {};
    buyingGroups.forEach(bg => {
      const companyName = bg.companyName;
      if (!companiesMap[companyName]) companiesMap[companyName] = [];
      (bg.employees || []).forEach(emp => {
        companiesMap[companyName].push({
          id: emp.uniqueId || '',
          name: emp.name || 'N/A',
          designation: emp.role || emp.designation || 'N/A',
          fullRole: emp.fullRole || emp.role || emp.designation || 'N/A',
          email: emp.email || 'N/A',
          linkedin: emp.linkedin || '',
          mobileDID: emp.mobileDID || emp.mobile || emp.did || '',
          reportsTo: emp.reportsTo || 'N/A',
          category: emp.category || 'N/A',
          // Company-level fields on every person entry so frontend can access via [0]
          revenue: bg.revenue || '',
          companyPhone: bg.companyPhone || '',
          employeeSize: bg.employeeSize || bg.employeeCount || '',
          country: bg.country || bg.location || '',
          industry: bg.industry || '',
          domain: bg.domain || bg.website || '',
          linkedinProfile: bg.linkedinProfile || ''
        });
      });
    });
    res.json(companiesMap);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch person details' });
  }
});

// GET /api/buying-groups/:companyName/org-chart
router.get('/:companyName/org-chart', async (req, res) => {
  try {
    const decodedCompanyName = decodeURIComponent(req.params.companyName);
    const col = getBGCollection(req);
    const buyingGroup = await col.findOne({ companyName: decodedCompanyName });

    if (!buyingGroup) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // If already in S3, return a fresh signed URL (bucket is private)
    if (buyingGroup.orgChart?.s3Key) {
      try {
        const exists = await orgChartExistsInS3(buyingGroup.orgChart.s3Key);
        if (exists) {
          const signedUrl = await getSignedOrgChartUrl(buyingGroup.orgChart.s3Key);
          return res.json({ success: true, s3Url: signedUrl, fromCache: true });
        }
        // File no longer exists in S3 — clear the stale cache and regenerate
        await col.updateOne({ companyName: decodedCompanyName }, { $unset: { orgChart: '' } });
      } catch (_) {
        // fall through to regenerate
      }
    }

    const employeeData = (buyingGroup.employees || []).map(emp => {
      let hierarchyValue = emp.hierarchy || 'OTHER';
      if (!['DECISION MAKER', 'INFLUENCER', 'DIRECT REPORTEE', 'OTHER'].includes(hierarchyValue)) {
        hierarchyValue = 'OTHER';
      }
      return {
        'Unique ID': emp.uniqueId || '',
        'Company Name': buyingGroup.companyName,
        'hierarchy': hierarchyValue,
        'Name': emp.name,
        'Role': emp.designation || emp.role || 'N/A',
        'Reports To': emp.reportsTo || '',
        'Category': emp.category || '',
        'Linkedin': emp.linkedin || '',
        'email': emp.email || '',
        'Location': buyingGroup.location || ''
      };
    });

    const htmlContent = generateOrgChartHTML(employeeData, buyingGroup.companyName, buyingGroup.location || '');
    const fileName = buyingGroup.location
      ? `${sanitizeFilename(buyingGroup.companyName)}_${sanitizeFilename(buyingGroup.location)}.html`
      : `${sanitizeFilename(buyingGroup.companyName)}.html`;

    try {
      const s3Result = await uploadOrgChartToS3(fileName, htmlContent);
      await col.updateOne(
        { companyName: decodedCompanyName },
        { $set: { orgChart: { s3Key: s3Result.s3Key, s3Url: s3Result.s3Url, generatedAt: new Date(), fileSize: s3Result.fileSize } } }
      );
      const signedUrl = await getSignedOrgChartUrl(s3Result.s3Key);
      res.json({ success: true, s3Url: signedUrl, fromCache: false });
    } catch (s3Err) {
      res.json({ success: true, html: htmlContent, fromCache: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate org chart' });
  }
});

// GET /api/buying-groups/:companyName
router.get('/:companyName', async (req, res) => {
  try {
    const decodedCompanyName = decodeURIComponent(req.params.companyName);
    const col = getBGCollection(req);
    const buyingGroup = await col.findOne({ companyName: decodedCompanyName });

    if (!buyingGroup) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.json({ success: true, data: buyingGroup });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch buying group' });
  }
});

// POST /api/buying-groups
router.post('/', async (req, res) => {
  try {
    const col = getBGCollection(req);
    await col.insertOne(req.body);
    res.status(201).json({ success: true, message: 'Buying group created successfully', data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create buying group' });
  }
});

// PUT /api/buying-groups/:companyName
router.put('/:companyName', async (req, res) => {
  try {
    const decodedCompanyName = decodeURIComponent(req.params.companyName);
    const col = getBGCollection(req);
    const result = await col.findOneAndUpdate(
      { companyName: decodedCompanyName },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ success: false, error: 'Company not found' });
    res.json({ success: true, message: 'Buying group updated successfully', data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update buying group' });
  }
});

// DELETE /api/buying-groups/:companyName
router.delete('/:companyName', async (req, res) => {
  try {
    const decodedCompanyName = decodeURIComponent(req.params.companyName);
    const col = getBGCollection(req);
    const result = await col.findOneAndDelete({ companyName: decodedCompanyName });
    if (!result) return res.status(404).json({ success: false, error: 'Company not found' });
    res.json({ success: true, message: 'Buying group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete buying group' });
  }
});

module.exports = router;
