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

chartElement.style.transform = 'scale(' + (window.optimalZoom / 100) + ')';
        window.currentZoom = window.optimalZoom;

window.parent.postMessage({
          type: 'optimalZoomCalculated',
          zoomLevel: window.optimalZoom
        }, '*');
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

let ntpCache = null;
let ntpCacheTime = 0;
let ntpCacheBuilding = false;
const NTP_CACHE_DURATION = 10 * 60 * 1000;

const buildNtpCache = async () => {
  if (ntpCacheBuilding) return;

  try {
    ntpCacheBuilding = true;
    const startTime = Date.now();

    const fetchStart = Date.now();

    const companies = await Company.find({})
      .lean()
      .hint({ '_id': 1 });

    const fetchTime = Date.now() - fetchStart;

    const processStart = Date.now();
    let ntpData = [];

    companies.forEach(company => {
      const about = (company.Firmographics || {}).About || {};

      (company.NTP || []).forEach(ntpItem => {
        ntpData.push({
          companyName: company['Company Name'],
          domain: about.Domain || 'N/A',
          linkedinUrl: about.linkedinUrl || about['LinkedIn URL'] || about['Linkedin URL'] || about['linkedin url'] || '',
          category: ntpItem.Category,
          technology: ntpItem.Technology,
          purchaseProbability: ntpItem['Purchase Probability (%)'],
          purchasePrediction: ntpItem['Purchase Prediction'],
          ntpAnalysis: ntpItem['NTP Analysis'],
          latestDetectedDate: ntpItem['Latest Date'] || 'N/A',
          previousDetectedDate: ntpItem['Previous Date'] || 'N/A'
        });
      });
    });

    const processTime = Date.now() - processStart;

    ntpCache = ntpData;
    ntpCacheTime = Date.now();
    const totalTime = Date.now() - startTime;
  } catch (err) {
    console.error('[NTP-CACHE] Error building NTP cache:', err.message);
  } finally {
    ntpCacheBuilding = false;
  }
};

setTimeout(() => {
  if (mongoose.connection.readyState === 1) {
    console.log('[NTP-CACHE] MongoDB ready, starting cache build');
    buildNtpCache();
  } else {
    console.log('[NTP-CACHE] Waiting for MongoDB connection...');
    mongoose.connection.once('open', () => {
      console.log('[NTP-CACHE] MongoDB connected, starting cache build');
      buildNtpCache();
    });
  }
}, 3000); 

setInterval(() => {
  if (Date.now() - ntpCacheTime > NTP_CACHE_DURATION) {
    buildNtpCache();
  }
}, 5 * 60 * 1000); 

let ntpMetadataCache = null;
let ntpMetadataCacheTime = 0;

router.get('/ntp/metadata', async (req, res) => {
  try {
    const now = Date.now();

if (ntpMetadataCache && (now - ntpMetadataCacheTime) < NTP_CACHE_DURATION) {
      return res.json(ntpMetadataCache);
    }

    const allCompanies = await Company.find({});

    const metadata = {
      categories: new Set(),
      technologies: new Set(),
      predictions: new Set(),
      companies: new Set(),
      totalRecords: 0
    };

    allCompanies.forEach(company => {
      if (company['Company Name']) metadata.companies.add(company['Company Name']);

      (company.NTP || []).forEach(ntpItem => {
        if (ntpItem.Category) metadata.categories.add(ntpItem.Category);
        if (ntpItem.Technology) metadata.technologies.add(ntpItem.Technology);
        if (ntpItem['Purchase Prediction']) metadata.predictions.add(ntpItem['Purchase Prediction']);
        metadata.totalRecords++;
      });
    });

    const result = {
      categories: Array.from(metadata.categories).sort(),
      technologies: Array.from(metadata.technologies).sort(),
      predictions: Array.from(metadata.predictions).sort(),
      companies: Array.from(metadata.companies).sort(),
      totalRecords: metadata.totalRecords
    };

    ntpMetadataCache = result;
    ntpMetadataCacheTime = now;

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/ntp', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;

if (ntpCache && ntpCache.length > 0) {
      const paginatedData = ntpCache.slice(skip, skip + limit);

      return res.json({
        data: paginatedData,
        total: ntpCache.length,
        page,
        limit,
        pages: Math.ceil(ntpCache.length / limit)
      });
    }

if (!ntpCacheBuilding) {
      buildNtpCache();
    }

return res.status(503).json({
      error: 'Cache building in progress',
      data: [],
      retryAfter: 1000
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

router.get('/ntp/all', async (req, res) => {
  try {
    
    const filters = {
      companyName: req.query.companyName ? (Array.isArray(req.query.companyName) ? req.query.companyName : [req.query.companyName]) : [],
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      technology: req.query.technology ? (Array.isArray(req.query.technology) ? req.query.technology : [req.query.technology]) : [],
      prediction: req.query.prediction ? (Array.isArray(req.query.prediction) ? req.query.prediction : [req.query.prediction]) : []
    };

    if (ntpCache && ntpCache.length > 0) {
      
      let filteredData = ntpCache.filter(row => {
        if (filters.companyName.length > 0 && !filters.companyName.includes(String(row.companyName))) return false;
        if (filters.category.length > 0 && !filters.category.includes(String(row.category))) return false;
        if (filters.technology.length > 0 && !filters.technology.includes(String(row.technology))) return false;
        if (filters.prediction.length > 0 && !filters.prediction.includes(String(row.purchasePrediction))) return false;
        return true;
      });

      console.log(`[NTP-ALL] ✓ Returning ${filteredData.length} records (filtered from ${ntpCache.length})`);
      
      return res.json({
        data: filteredData,
        total: filteredData.length
      });
    }

    if (!ntpCacheBuilding) {
      console.log('[NTP-ALL] Cache not ready, starting build in background...');
      buildNtpCache(); 
    }

    console.log(`[NTP-ALL] Cache not ready, returning 503`);
    return res.status(503).json({ 
      error: 'Cache building in progress', 
      data: [],
      retryAfter: 1000 
    });
  } catch (err) {
    console.error('[NTP-ALL] Error:', err.message);
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

let techCache = null;
let techCacheTime = 0;
let techCacheBuilding = false;
const TECH_CACHE_DURATION = 10 * 60 * 1000;

const buildTechCache = async () => {
  if (techCacheBuilding) return;

  try {
    techCacheBuilding = true;
    const startTime = Date.now();

    const fetchStart = Date.now();

    const companies = await Company.find({})
      .lean()
      .hint({ '_id': 1 });

    const fetchTime = Date.now() - fetchStart;

    const processStart = Date.now();
    let technographicsData = [];
    let skippedCount = 0;
    let companiesWithTech = 0;
    let companiesWithoutTech = 0;

    companies.forEach((company, idx) => {
      const firmographics = company.Firmographics || {};
      const about = firmographics.About || {};
      const location = firmographics.Location || {};
      const finance = company.Financial_Data?.Finance || {};
      const companyName = company['Company Name'];

if (!companyName || companyName.trim() === '') {
        skippedCount++;
        return;
      }

const techArray = company.Technographics || [];
      if (techArray.length === 0) {
        companiesWithoutTech++;
        return;
      }

      companiesWithTech++;

      techArray.forEach(techItem => {
        technographicsData.push({
          companyName: companyName,
          region: location.Country || 'N/A',
          industry: about.Industry || 'N/A',
          employeeSize: about['Full Time employees'] || about['Full time employees'] || about.Employees || 'N/A',
          revenue: finance['Total Revenue'] || 'N/A',
          category: techItem.Category,
          technology: techItem.Keyword,
          domain: about.Domain || 'N/A',
          linkedinUrl: about.linkedinUrl || about['LinkedIn URL'] || about['Linkedin URL'] || about['linkedin url'] || '',
          previousDetectedDate: techItem['Previous Date'] || 'N/A',
          latestDetectedDate: techItem['Latest Date'] || 'N/A',
          renewalDate: techItem['Renewal Date'] || 'N/A'
        });
      });
    });

    const processTime = Date.now() - processStart;

    techCache = technographicsData;
    techCacheTime = Date.now();
    const totalTime = Date.now() - startTime;
  } catch (err) {
    console.error('[CACHE] Error building technographics cache:', err.message);
  } finally {
    techCacheBuilding = false;
  }
};

setTimeout(() => {
  if (mongoose.connection.readyState === 1) {
    console.log('[TECH-CACHE] MongoDB ready, starting cache build');
    buildTechCache();
  } else {
    console.log('[TECH-CACHE] Waiting for MongoDB connection...');
    mongoose.connection.once('open', () => {
      console.log('[TECH-CACHE] MongoDB connected, starting cache build');
      buildTechCache();
    });
  }
}, 3000); 

setInterval(() => {
  if (Date.now() - techCacheTime > TECH_CACHE_DURATION) {
    buildTechCache();
  }
}, 5 * 60 * 1000); 

let techMetadataCache = null;
let techMetadataCacheTime = 0;

router.get('/technographics/metadata', async (req, res) => {
  try {
    const now = Date.now();

if (techMetadataCache && (now - techMetadataCacheTime) < TECH_CACHE_DURATION) {
      return res.json(techMetadataCache);
    }

    const allCompanies = await Company.find({});

    const metadata = {
      regions: new Set(),
      industries: new Set(),
      categories: new Set(),
      employeeSizes: new Set(),
      revenues: new Set(),
      totalRecords: 0
    };

    allCompanies.forEach(company => {
      const firmographics = company.Firmographics || {};
      const about = firmographics.About || {};
      const location = firmographics.Location || {};
      const finance = company.Financial_Data?.Finance || {};

      if (location.Country) metadata.regions.add(location.Country);
      if (about.Industry) metadata.industries.add(about.Industry);
      if (about['Full Time employees'] || about['Full time employees'] || about.Employees) {
        metadata.employeeSizes.add(about['Full Time employees'] || about['Full time employees'] || about.Employees);
      }
      if (finance['Total Revenue']) metadata.revenues.add(finance['Total Revenue']);

      (company.Technographics || []).forEach(tech => {
        if (tech.Category) metadata.categories.add(tech.Category);
        metadata.totalRecords++;
      });
    });

    const result = {
      regions: Array.from(metadata.regions).sort(),
      industries: Array.from(metadata.industries).sort(),
      categories: Array.from(metadata.categories).sort(),
      employeeSizes: Array.from(metadata.employeeSizes).sort(),
      revenues: Array.from(metadata.revenues).sort(),
      totalRecords: metadata.totalRecords
    };

    techMetadataCache = result;
    techMetadataCacheTime = now;

    res.json(result);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/technographics', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    if (techCache && techCache.length > 0) {
      const paginatedData = techCache.slice(skip, skip + limit);

      if (page === 1 && paginatedData.length > 0) {
        console.log(`[TECH] ✓ Page ${page}: ${paginatedData.length} records from cache`);
        console.log('[TECH] Sample records:', paginatedData.slice(0, 3).map(r => ({
          companyName: r.companyName,
          technology: r.technology,
          region: r.region
        })));
      }
      
      return res.json({
        data: paginatedData,
        total: totalFiltered,
        page,
        limit,
        pages: Math.ceil(totalFiltered / limit)
      });
    }

if (!techCacheBuilding) {
      buildTechCache();
    }

return res.status(503).json({
      error: 'Cache building in progress',
      data: [],
      retryAfter: 1000
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

router.get('/technographics/all', async (req, res) => {
  try {
    
    const filters = {
      companyName: req.query.companyName ? (Array.isArray(req.query.companyName) ? req.query.companyName : [req.query.companyName]) : [],
      region: req.query.region ? (Array.isArray(req.query.region) ? req.query.region : [req.query.region]) : [],
      technology: req.query.technology ? (Array.isArray(req.query.technology) ? req.query.technology : [req.query.technology]) : [],
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      industry: req.query.industry ? (Array.isArray(req.query.industry) ? req.query.industry : [req.query.industry]) : [],
      employeeSize: req.query.employeeSize ? (Array.isArray(req.query.employeeSize) ? req.query.employeeSize : [req.query.employeeSize]) : [],
      revenue: req.query.revenue ? (Array.isArray(req.query.revenue) ? req.query.revenue : [req.query.revenue]) : []
    };

    if (techCache && techCache.length > 0) {
      
      let filteredData = techCache.filter(row => {
        if (filters.companyName.length > 0 && !filters.companyName.includes(String(row.companyName))) return false;
        if (filters.region.length > 0 && !filters.region.includes(String(row.region))) return false;
        if (filters.technology.length > 0 && !filters.technology.includes(String(row.technology))) return false;
        if (filters.category.length > 0 && !filters.category.includes(String(row.category))) return false;
        if (filters.industry.length > 0 && !filters.industry.includes(String(row.industry))) return false;
        return true;
      });

      console.log(`[TECH-ALL] ✓ Returning ${filteredData.length} records (filtered from ${techCache.length})`);
      
      return res.json({
        data: filteredData,
        total: filteredData.length
      });
    }

    if (!techCacheBuilding) {
      console.log('[TECH-ALL] Cache not ready, starting build in background...');
      buildTechCache(); 
    }

    console.log(`[TECH-ALL] Cache not ready, returning 503`);
    return res.status(503).json({ 
      error: 'Cache building in progress', 
      data: [],
      retryAfter: 1000 
    });
  } catch (err) {
    console.error('[TECH-ALL] Error:', err.message);
    res.status(500).json({ error: 'Server Error', data: [] });
  }
});

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
  console.log('[INTENT-API] Request received');
  try {
    const now = Date.now();

    if (intentCache && (now - intentCacheTime) < INTENT_CACHE_DURATION) {
      console.log('[INTENT-API] Returning cached data');
      return res.json(intentCache);
    }

    console.log('[INTENT-API] Fetching from MongoDB...');
    const intentCollection = mongoose.connection.db.collection('intent_data');
    const intentDocs = await intentCollection.find({}).toArray();
    console.log(`[INTENT-API] Found ${intentDocs.length} documents`);

    const intentData = intentDocs.map(item => ({
      companyName: item['Company Name'],
      intentStatus: item['Intent Status']
    }));

    intentCache = intentData;
    intentCacheTime = now;

    console.log('[INTENT-API] Sending response');
    res.json(intentData);
  } catch (err) {
    console.error('[INTENT-API] Error:', err);
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
    const XLSX = require('xlsx');

let excelPath = path.join(__dirname, '../nexora Buying group.xlsx');

if (!fs.existsSync(excelPath)) {
      excelPath = path.join(__dirname, '../AI_sample (1).xlsx');
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

const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

const sanitizeFilename = (name) => {
      name = String(name);
      name = name.replace(/[^\w\s-]/g, '').trim();
      name = name.replace(/[-\s]+/g, '_');
      return name || 'untitled_chart';
    };

    let newChartsGenerated = 0;
    let chartsSkipped = 0;

    for (const company of selectedCompanies) {
      const companyData = data.filter(row => row['Company Name'] === company);

      if (!companyData.length) {

        continue;
      }

      const location = companyData[0]?.Location ? String(companyData[0].Location).trim() : '';

      let safeFileName = sanitizeFilename(company);
      if (location) {
        safeFileName = `${sanitizeFilename(company)}_${sanitizeFilename(location)}`;
      }

if (existingCompanies.has(safeFileName)) {

        chartsSkipped++;
        continue;
      }

try {
        const html = await generateOrgChartForCompany(excelPath, company);
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

router.get('/dashboard-stats', async (req, res) => {
  try {

    const cached = getCachedStats();
    if (cached) {
      return res.json(cached);
    }

const statsResult = await Company.aggregate([
      {
        $facet: {
          companies: [
            { $group: { _id: '$Company Name' } },
            { $count: 'count' }
          ],
          technologies: [
            { $unwind: '$Technographics' },
            { $match: { 'Technographics.Keyword': { $exists: true, $ne: null } } },
            { $group: { _id: '$Technographics.Keyword' } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const companyCount = statsResult[0].companies[0]?.count || 0;
    const techCount = statsResult[0].technologies[0]?.count || 0;

const productCatalogueCollection = mongoose.connection.db.collection('product_catlog_2025');
    const productStats = await productCatalogueCollection.aggregate([
      {
        $facet: {
          products: [
            { $match: { 'Product Name': { $exists: true, $ne: null } } },
            { $group: { _id: '$Product Name' } },
            { $count: 'count' }
          ],
          categories: [
            { $match: { 'Category': { $exists: true, $ne: null } } },
            { $group: { _id: '$Category' } },
            { $count: 'count' }
          ]
        }
      }
    ]).toArray();

    const productCount = productStats[0].products[0]?.count || 0;
    const categoryCount = productStats[0].categories[0]?.count || 0;

    const stats = {
      totalCompanies: companyCount,
      totalTechnologies: techCount,
      totalProducts: productCount,
      totalCategories: categoryCount
    };

setCachedStats(stats);
    res.json(stats);
  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Credit management endpoints
router.get('/user/credits', async (req, res) => {
  try {
    const User = require('../models/User');
    const userId = req.query.userId;
    
    console.log('[API] GET /user/credits - userId:', userId, 'type:', typeof userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Try to find user by ID (handle both string and ObjectId)
    let user;
    try {
      user = await User.findById(userId).select('freeCredits');
    } catch (e) {
      console.log('[API] findById failed, trying findOne with string match');
      user = await User.findOne({ _id: userId }).select('freeCredits');
    }
    
    console.log('[API] User found:', user ? 'yes' : 'no', 'credits:', user?.freeCredits);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ freeCredits: user.freeCredits || 0 });
  } catch (error) {
    console.error('[CREDITS-API] Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

router.post('/user/reveal-company', async (req, res) => {
  try {
    const User = require('../models/User');
    const { userId, companyName } = req.body;
    
    console.log('[API] POST /user/reveal-company - userId:', userId, 'type:', typeof userId, 'companyName:', companyName);
    
    if (!userId || !companyName) {
      return res.status(400).json({ error: 'userId and companyName are required' });
    }

    // Try to find user by ID (handle both string and ObjectId)
    let user;
    try {
      user = await User.findById(userId);
    } catch (e) {
      console.log('[API] findById failed, trying findOne with string match');
      user = await User.findOne({ _id: userId });
    }
    
    console.log('[API] User found:', user ? 'yes' : 'no');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Increment credits by 1
    user.freeCredits = (user.freeCredits || 0) + 1;
    await user.save();

    console.log('[API] Credits updated to:', user.freeCredits);

    res.json({ 
      success: true, 
      freeCredits: user.freeCredits,
      message: `+1 credit for revealing ${companyName}`
    });
  } catch (error) {
    console.error('[CREDITS-API] Error updating credits:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

module.exports = router;
module.exports.generateSelectedOrgCharts = generateSelectedOrgCharts;