const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const Company = require('../models/Company');
const { generateOrgChartForCompany, getCompaniesFromCSV } = require('../org_chart');

router.use(cors());

let statsCache = null;
let statsCacheTime = 0;
const STATS_CACHE_DURATION = 5 * 60 * 1000;

const getCachedStats = () => {
  const now = Date.now();
  if (statsCache && (now - statsCacheTime) < STATS_CACHE_DURATION) {
    return statsCache;
  }
  return null;
};

const setCachedStats = (stats) => {
  statsCache = stats;
  statsCacheTime = Date.now();
};

function injectScrollableCSS(html) {
  const scrollableCSS = `.container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
  .chart-wrapper {
    flex: 1;
    overflow: auto;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10px;
  }
  #chart {
    transform-origin: top center;
    transition: transform 0.2s ease;
  }`;

const containerRegex = /\.container\s*\{[^}]*\}/;
  if (containerRegex.test(html)) {
    html = html.replace(containerRegex, '.container { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: auto; }');
  }

const chartWrapperRegex = /\.chart-wrapper\s*\{[^}]*\}/;
  if (chartWrapperRegex.test(html)) {
    html = html.replace(chartWrapperRegex, '.chart-wrapper { flex: 1; overflow: auto; background-color: white; display: flex; justify-content: center; align-items: flex-start; padding: 10px; }');
  } else {

    html = html.replace(/<\/style>/, `.chart-wrapper { flex: 1; overflow: auto; background-color: white; display: flex; justify-content: center; align-items: flex-start; padding: 10px; }</style>`);
  }

html = html.replace(/<\/style>/, `#chart { transform-origin: top center; transition: transform 0.2s ease; }</style>`);

const zoomScript = `<script>
    window.currentZoom = 100;
    window.optimalZoom = 100;

    window.addEventListener('load', function() {
      const chartElement = document.getElementById('chart');
      if (chartElement && chartElement.getBoundingClientRect) {
        const chartRect = chartElement.getBoundingClientRect();
        const containerWidth = window.innerWidth - 40;
        const containerHeight = 520;

        const widthZoom = (containerWidth / chartRect.width) * 100;
        const heightZoom = (containerHeight / chartRect.height) * 100;

        window.optimalZoom = Math.min(widthZoom, heightZoom, 100);
        window.optimalZoom = Math.max(window.optimalZoom, 30);
        window.optimalZoom = Math.round(window.optimalZoom / 10) * 10;

        // Disabled: Don't auto-scale on load - let parent component control zoom
        // chartElement.style.transform = 'scale(' + (window.optimalZoom / 100) + ')';
        // window.currentZoom = window.optimalZoom;

        // Disabled: Don't send optimal zoom to parent - respect user's default zoom setting
        // window.parent.postMessage({
        //   type: 'optimalZoomCalculated',
        //   zoomLevel: window.optimalZoom
        // }, '*');
      }
    });

    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'setZoom') {
        const zoomLevel = event.data.zoomLevel || window.optimalZoom;
        const chartElement = document.getElementById('chart');
        if (chartElement) {
          chartElement.style.transform = 'scale(' + (zoomLevel / 100) + ')';
          window.currentZoom = zoomLevel;
        }
      }
    });
  </script>`;

  html = html.replace(/<\/body>/, zoomScript + '</body>');
  return html;
}

// Helper to get data collection
const getDataCollection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB not connected');
  }
  if (!mongoose.connection.db) {
    throw new Error('MongoDB database not available');
  }
  return mongoose.connection.db.collection('data');
};

// Query-level caching for repeated requests (5-minute TTL)
const queryCache = new Map();
const QUERY_CACHE_DURATION = 5 * 60 * 1000;

function getCachedQuery(key) {
  const cached = queryCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < QUERY_CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedQuery(key, data) {
  queryCache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// NTP ROUTES - Query data collection directly
// ============================================

router.get('/ntp/metadata', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const cacheKey = 'ntp-metadata';
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection();

    const result = await dataCollection.aggregate([
      { $unwind: '$NTP' },
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$NTP.Category' },
          technologies: { $addToSet: '$NTP.Technology' },
          predictions: { $addToSet: '$NTP.Purchase Prediction' },
          companies: { $addToSet: '$Company Name' },
          totalRecords: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          categories: { $sortArray: { input: '$categories', sortBy: 1 } },
          technologies: { $sortArray: { input: '$technologies', sortBy: 1 } },
          predictions: { $sortArray: { input: '$predictions', sortBy: 1 } },
          companies: { $sortArray: { input: '$companies', sortBy: 1 } },
          totalRecords: 1
        }
      }
    ], { allowDiskUse: true }).toArray();

    const metadata = result[0] || {
      categories: [],
      technologies: [],
      predictions: [],
      companies: [],
      totalRecords: 0
    };

    setCachedQuery(cacheKey, metadata);
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

router.get('/ntp', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;

    const cacheKey = `ntp-page-${page}-${limit}`;
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection();

    const results = await dataCollection.aggregate([
      { $unwind: '$NTP' },
      { $skip: skip },
      { $limit: limit },
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
      }
    ], { allowDiskUse: true }).toArray();

    const totalCount = await dataCollection.aggregate([
      { $unwind: '$NTP' },
      { $count: 'total' }
    ], { allowDiskUse: true }).toArray();

    const total = totalCount[0]?.total || 0;

    const response = {
      data: results,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

router.get('/ntp/all', async (req, res) => {
  try {
    const startTime = Date.now();

    const filters = {
      companyName: req.query.companyName ? (Array.isArray(req.query.companyName) ? req.query.companyName : [req.query.companyName]) : [],
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      technology: req.query.technology ? (Array.isArray(req.query.technology) ? req.query.technology : [req.query.technology]) : [],
      prediction: req.query.prediction ? (Array.isArray(req.query.prediction) ? req.query.prediction : [req.query.prediction]) : []
    };

    const cacheKey = `ntp-all-${JSON.stringify(filters)}`;
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection();

    const matchStage = {};
    if (filters.companyName.length > 0) matchStage['Company Name'] = { $in: filters.companyName };

    const pipeline = [
      { $unwind: '$NTP' }
    ];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    if (filters.category.length > 0) {
      pipeline.push({ $match: { 'NTP.Category': { $in: filters.category } } });
    }
    if (filters.technology.length > 0) {
      pipeline.push({ $match: { 'NTP.Technology': { $in: filters.technology } } });
    }
    if (filters.prediction.length > 0) {
      pipeline.push({ $match: { 'NTP.Purchase Prediction': { $in: filters.prediction } } });
    }

    pipeline.push({
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
    });

    const results = await dataCollection.aggregate(pipeline, { allowDiskUse: true }).toArray();

    const response = {
      data: results,
      total: results.length
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

// ====================================================
// TECHNOGRAPHICS ROUTES - Query data collection directly
// ====================================================

router.get('/technographics/metadata', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const cacheKey = 'tech-metadata';
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection();

    const result = await dataCollection.aggregate([
      { $unwind: '$Technographics' },
      {
        $group: {
          _id: null,
          regions: { $addToSet: '$Firmographics.Location.Country' },
          industries: { $addToSet: '$Firmographics.About.Industry' },
          categories: { $addToSet: '$Technographics.Category' },
          employeeSizes: { $addToSet: '$Firmographics.About.Full Time employees' },
          revenues: { $addToSet: '$Financial_Data.Finance.Total Revenue' },
          totalRecords: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          regions: { $sortArray: { input: '$regions', sortBy: 1 } },
          industries: { $sortArray: { input: '$industries', sortBy: 1 } },
          categories: { $sortArray: { input: '$categories', sortBy: 1 } },
          employeeSizes: { $sortArray: { input: '$employeeSizes', sortBy: 1 } },
          revenues: { $sortArray: { input: '$revenues', sortBy: 1 } },
          totalRecords: 1
        }
      }
    ], { allowDiskUse: true }).toArray();

    const metadata = result[0] || {
      regions: [],
      industries: [],
      categories: [],
      employeeSizes: [],
      revenues: [],
      totalRecords: 0
    };

    setCachedQuery(cacheKey, metadata);
    res.json(metadata);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/technographics', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;

    const cacheKey = `tech-page-${page}-${limit}`;
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection();

    const results = await dataCollection.aggregate([
      { $unwind: '$Technographics' },
      { $skip: skip },
      { $limit: limit },
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
      }
    ], { allowDiskUse: true }).toArray();

    const totalCount = await dataCollection.aggregate([
      { $unwind: '$Technographics' },
      { $count: 'total' }
    ], { allowDiskUse: true }).toArray();

    const total = totalCount[0]?.total || 0;

    const response = {
      data: results,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

router.get('/technographics/all', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const filters = {
      companyName: req.query.companyName ? (Array.isArray(req.query.companyName) ? req.query.companyName : [req.query.companyName]) : [],
      region: req.query.region ? (Array.isArray(req.query.region) ? req.query.region : [req.query.region]) : [],
      technology: req.query.technology ? (Array.isArray(req.query.technology) ? req.query.technology : [req.query.technology]) : [],
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      industry: req.query.industry ? (Array.isArray(req.query.industry) ? req.query.industry : [req.query.industry]) : [],
      employeeSize: req.query.employeeSize ? (Array.isArray(req.query.employeeSize) ? req.query.employeeSize : [req.query.employeeSize]) : [],
      revenue: req.query.revenue ? (Array.isArray(req.query.revenue) ? req.query.revenue : [req.query.revenue]) : []
    };

    const cacheKey = `tech-all-${JSON.stringify(filters)}`;
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection();

    const matchStage = {};
    if (filters.companyName.length > 0) matchStage['Company Name'] = { $in: filters.companyName };

    const pipeline = [
      { $unwind: '$Technographics' }
    ];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    if (filters.region.length > 0) {
      pipeline.push({ $match: { 'Firmographics.Location.Country': { $in: filters.region } } });
    }
    if (filters.technology.length > 0) {
      pipeline.push({ $match: { 'Technographics.Keyword': { $in: filters.technology } } });
    }
    if (filters.category.length > 0) {
      pipeline.push({ $match: { 'Technographics.Category': { $in: filters.category } } });
    }
    if (filters.industry.length > 0) {
      pipeline.push({ $match: { 'Firmographics.About.Industry': { $in: filters.industry } } });
    }

    pipeline.push({
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
    });

    const results = await dataCollection.aggregate(pipeline, { allowDiskUse: true }).toArray();

    const response = {
      data: results,
      total: results.length
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

// Company details endpoint (still uses Company model for compatibility)
let companyDetailsCache = null;
let companyDetailsCacheTime = 0;
const COMPANY_DETAILS_CACHE_DURATION = 10 * 60 * 1000;

router.get('/company-details', async (req, res) => {
  try {
    const now = Date.now();

    if (companyDetailsCache && (now - companyDetailsCacheTime) < COMPANY_DETAILS_CACHE_DURATION) {
      return res.json(companyDetailsCache);
    }

    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, _id: 0 });

    const companyDetails = {};
    companies.forEach(company => {
      const about = (company.Firmographics || {}).About || {};
      companyDetails[company['Company Name']] = {
        domain: about.Domain || 'N/A',
        linkedinUrl: about.linkedinUrl || about['LinkedIn URL'] || about['Linkedin URL'] || about['linkedin url'] || ''
      };
    });

    companyDetailsCache = companyDetails;
    companyDetailsCacheTime = now;

    res.json(companyDetails);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ====================================================
// RENEWAL INTELLIGENCE ROUTES
// ====================================================
let renewalCache = null;
let renewalCacheTime = 0;
const RENEWAL_CACHE_DURATION = 10 * 60 * 1000;

let renewalMetadataCache = null;
let renewalMetadataCacheTime = 0;

router.get('/renewal-intelligence/metadata', async (req, res) => {
  try {
    const now = Date.now();

    if (renewalMetadataCache && (now - renewalMetadataCacheTime) < RENEWAL_CACHE_DURATION) {
      return res.json(renewalMetadataCache);
    }

    const renewalCollection = mongoose.connection.db.collection('renewal_intel');
    const renewalDocs = await renewalCollection.find({}).toArray();

    const metadata = {
      categories: new Set(),
      products: new Set(),
      quarters: new Set(),
      companies: new Set(),
      totalRecords: renewalDocs.length
    };

    renewalDocs.forEach(item => {
      if (item.Category) metadata.categories.add(item.Category);
      if (item.Keyword) metadata.products.add(item.Keyword);
      if (item['Renewal Date']) metadata.quarters.add(item['Renewal Date']);
      if (item['Company Name']) metadata.companies.add(item['Company Name']);
    });

    const result = {
      categories: Array.from(metadata.categories).sort(),
      products: Array.from(metadata.products).sort(),
      quarters: Array.from(metadata.quarters).sort(),
      companies: Array.from(metadata.companies).sort(),
      totalRecords: metadata.totalRecords
    };

    renewalMetadataCache = result;
    renewalMetadataCacheTime = now;

    res.json(result);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/renewal-intelligence', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const { companyName } = req.query;

if (page === 1 && !companyName && renewalCache && (Date.now() - renewalCacheTime) < RENEWAL_CACHE_DURATION) {
      return res.json(renewalCache);
    }

    const renewalCollection = mongoose.connection.db.collection('renewal_intel');
    const query = companyName ? { 'Company Name': companyName } : {};

    const renewalDocs = await renewalCollection.find(query).toArray();

    const renewalData = renewalDocs.map(item => ({
      companyName: item['Company Name'],
      category: item.Category || 'N/A',
      product: item.Keyword,
      renewalDate: item['Renewal Date'],
      qtr: item['Renewal Date']
    }));

const paginatedData = renewalData.slice(skip, skip + limit);

if (page === 1 && !companyName) {
      renewalCache = paginatedData;
      renewalCacheTime = Date.now();
    }

    res.json({
      data: paginatedData,
      total: renewalData.length,
      page,
      limit,
      pages: Math.ceil(renewalData.length / limit)
    });
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/buyergroups', async (req, res) => {
  try {

    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Buyers_Group: 1, Financial_Data: 1, _id: 0 });

    const buyerGroupData = companies.flatMap(company => {
      const about = company.Firmographics?.About || {};
      const location = company.Firmographics?.Location || {};

      return company.Buyers_Group?.map(item => ({
        id: company.Financial_Data?.Finance?.ID || 'N/A',
        uniqueId: `BG-${Math.floor(Math.random() * 100000)}`,
        companyName: company['Company Name'],
        domain: about.Domain || 'N/A',
        industry: about.Industry || 'N/A',
        country: location.Country || 'N/A',
        buyerGroupName: item.Name,
        relation: item.Relation,
        shares: item.Shares,
        description: item.Description,
        date: item.Date
      })) || [];
    });

    res.json(buyerGroupData);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

let intentCache = null;
let intentCacheTime = 0;
const INTENT_CACHE_DURATION = 10 * 60 * 1000;

router.get('/intent', async (req, res) => {
  try {
    const now = Date.now();

    if (intentCache && (now - intentCacheTime) < INTENT_CACHE_DURATION) {
      return res.json(intentCache);
    }

    const intentCollection = mongoose.connection.db.collection('intent_data');
    const intentDocs = await intentCollection.find({}).toArray();

    const intentData = intentDocs.map(item => ({
      companyName: item['Company Name'],
      intentStatus: item['Intent Status']
    }));

    intentCache = intentData;
    intentCacheTime = now;

    res.json(intentData);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

router.get('/product-catalogue', async (req, res) => {
  try {
    const { year } = req.query;
    const collectionName = year === '2026' ? 'product_catlog_2026' : 'product_catlog_2025';

    const productCatalogueCollection = mongoose.connection.db.collection(collectionName);
    const productDocs = await productCatalogueCollection.find({}).toArray();

    const productData = productDocs.map(item => ({
      prodName: item['Product Name'] || item.prodName || 'N/A',
      category: item.Category || item.category || 'N/A',
      subCategory: item['Sub Category'] || item.SubCategory || item.subCategory || 'N/A',
      description: item.Description || item.description || 'N/A'
    }));

    res.json(productData);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/data-dictionary', async (req, res) => {
  try {
    const dataDictionaryCollection = mongoose.connection.db.collection('tech_data_dictionary');
    const dataDictionary = await dataDictionaryCollection.find({}).toArray();

const sortedData = dataDictionary.sort((a, b) => {
      const attrA = a['Data Attribute'] || '';
      const attrB = b['Data Attribute'] || '';
      return attrA.localeCompare(attrB);
    });

    res.json(sortedData);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/org-chart/companies', async (req, res) => {
  try {
    const fs = require('fs');

let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    const companies = await getCompaniesFromCSV(csvPath);
    res.json({ companies });
  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

router.get('/org-chart/categories', async (req, res) => {
  try {
    const fs = require('fs');
    const csv = require('csv-parser');

let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

const data = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {

        const categories = [...new Set(data.map(row => row.Category).filter(Boolean))].sort();
        res.json({ categories });
      })
      .on('error', (error) => {

        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/org-chart/person-details', async (req, res) => {
  try {
    const fs = require('fs');
    const csv = require('csv-parser');

let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

const data = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {

        const companiesMap = {};

        data.forEach((row) => {
          const companyName = row['Company Name'] || 'Unknown';

          if (!companiesMap[companyName]) {
            companiesMap[companyName] = [];
          }

          companiesMap[companyName].push({
            id: row['Unique ID'] || '',
            name: row.Name || 'N/A',
            designation: row.Role || 'N/A',
            email: row.email || 'N/A',
            linkedin: row.Linkedin || '',
            reportsTo: row['Reports To'] || 'N/A',
            category: row.Category || 'N/A'
          });
        });

res.json(companiesMap);
      })
      .on('error', (error) => {

        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch person details' });
  }
});

router.get('/org-chart/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    const fs = require('fs');
    const csv = require('csv-parser');

let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    const outputFolder = path.join(__dirname, '../org_charts_output_js');

const data = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', async () => {
        const companyData = data.filter(row => row['Company Name'] === decodedCompanyName);
        const location = companyData[0]?.Location ? String(companyData[0].Location).trim() : '';

const sanitizeFilename = (name) => {
          name = String(name);
          name = name.replace(/[^\w\s-]/g, '').trim();
          name = name.replace(/[-\s]+/g, '_');
          return name || 'untitled_chart';
        };

        let safeFileName = sanitizeFilename(decodedCompanyName);
        if (location) {
          safeFileName = `${sanitizeFilename(decodedCompanyName)}_${sanitizeFilename(location)}`;
        }

        const htmlFileName = `${safeFileName}.html`;
        const htmlFilePath = path.join(outputFolder, htmlFileName);

if (fs.existsSync(htmlFilePath)) {
          let html = fs.readFileSync(htmlFilePath, 'utf-8');
          html = injectScrollableCSS(html);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(html);
        } else {

let html = await generateOrgChartForCompany(csvPath, decodedCompanyName);
          html = injectScrollableCSS(html);

fs.writeFileSync(htmlFilePath, html, 'utf-8');

res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(html);
        }
      })
      .on('error', (error) => {

        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (err) {

    res.status(500).json({ error: err.message || 'Failed to fetch org chart' });
  }
});

async function generateSelectedOrgCharts(selectedCompanies = []) {
  try {
    const fs = require('fs');
    const csv = require('csv-parser');

    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    const outputFolder = path.join(__dirname, '../org_charts_output_js');

    if (!selectedCompanies || selectedCompanies.length === 0) {
      return { success: false, message: 'No companies selected' };
    }

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    const existingFiles = fs.readdirSync(outputFolder).filter(f => f.endsWith('.html'));
    const existingCompanies = new Set(existingFiles.map(f => f.replace('.html', '')));

    const sanitizeFilename = (name) => {
      name = String(name);
      name = name.replace(/[^\w\s-]/g, '').trim();
      name = name.replace(/[-\s]+/g, '_');
      return name || 'untitled_chart';
    };

    let newChartsGenerated = 0;
    let chartsSkipped = 0;

    for (const company of selectedCompanies) {
      let safeFileName = sanitizeFilename(company);

      if (existingCompanies.has(safeFileName)) {
        chartsSkipped++;
        continue;
      }

      try {
        const html = await generateOrgChartForCompany(csvPath, company);
        const htmlFileName = `${safeFileName}.html`;
        const htmlFilePath = path.join(outputFolder, htmlFileName);

        fs.writeFileSync(htmlFilePath, html, 'utf-8');

        newChartsGenerated++;
      } catch (err) {
      }
    }

    return {
      success: true,
      newChartsGenerated,
      chartsSkipped,
      message: `${newChartsGenerated} new chart(s) generated, ${chartsSkipped} existing chart(s) skipped`
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

router.post('/org-chart/generate-selected', async (req, res) => {
  try {
    const { companies } = req.body;

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of company names' });
    }

    const result = await generateSelectedOrgCharts(companies);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {

    res.status(500).json({ error: 'Failed to generate org charts' });
  }
});



router.get('/keywords', async (req, res) => {
  try {
    const fs = require('fs');
    const csv = require('csv-parser');
    const csvPath = require('path').join(__dirname, '../Keywords(AutoRecovered).csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'Keywords CSV file not found', path: csvPath });
    }

    const keywordsData = [];
    let errorOccurred = false;

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        keywordsData.push(row);
      })
      .on('end', () => {
        if (!errorOccurred) {
          res.json({
            data: keywordsData,
            total: keywordsData.length
          });
        }
      })
      .on('error', (err) => {
        errorOccurred = true;
        res.status(500).json({ error: 'Failed to parse CSV file', details: err.message });
      });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch keywords data', details: err.message });
  }
});

router.get('/glossary', async (req, res) => {
  try {
    const fs = require('fs');
    const glossaryPath = require('path').join(__dirname, '../glossary.json');

    if (!fs.existsSync(glossaryPath)) {
      return res.status(404).json({ error: 'Glossary file not found', path: glossaryPath });
    }

    const glossaryData = JSON.parse(fs.readFileSync(glossaryPath, 'utf-8'));
    res.json(glossaryData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch glossary data', details: err.message });
  }
});

module.exports = router;
module.exports.generateSelectedOrgCharts = generateSelectedOrgCharts;