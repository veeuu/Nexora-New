const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const { cacheResponse } = require('../middleware/redisCache');
const authMiddleware = require('../middleware/authMiddleware');

const Company = require('../models/Company');
const { generateOrgChartForCompany, getCompaniesFromCSV } = require('../org_chart');
const { uploadOrgChartToS3, getSignedOrgChartUrl, orgChartExistsInS3, ORG_CHART_FOLDER } = require('../config/s3');

router.use(cors());

// --- Plan-aware collection resolver ------------------------------------------
// free_trial users get *_free collections, paid users get full collections
const PLAN_COLLECTIONS = {
  free_trial: {
    data:                'data_free',
    renewal_intel:       'renewal_intel_free',
    intent_data:         'intent_data_free',
    buyinggroups:        'buyinggroups_free',
    ntp_flat:            'ntp_flat_free',            
    technographics_flat: 'technographics_flat_free'  
  },
  paid: {
    data:                'data',
    renewal_intel:       'renewal_intel',
    intent_data:         'intent_data',
    buyinggroups:        'buyinggroups',
    ntp_flat:            'ntp_flat',
    technographics_flat: 'technographics_flat'
  }
};

const getCol = (req, key) => {
  const plan = req.user?.plan || 'free_trial';
  const map = PLAN_COLLECTIONS[plan] || PLAN_COLLECTIONS.free_trial;
  const col = map[key] || key;
  return col;
};

// Apply auth to all data API routes (login/signup handled separately in auth.js)
router.use(authMiddleware);

// --- NTP ROUTES

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

// Helper to get data collection (plan-aware)
const getDataCollection = (req) => {
  if (mongoose.connection.readyState !== 1) throw new Error('MongoDB not connected');
  if (!mongoose.connection.db) throw new Error('MongoDB database not available');
  const colName = getCol(req, 'data');
  return mongoose.connection.db.collection(colName);
};

// Query-level caching for repeated requests (5-minute TTL)
const queryCache = new Map();
const QUERY_CACHE_DURATION = 5 * 60 * 1000;
const QUERY_CACHE_MAX = 200;

const MONGO_MAX_TIME_MS = Number(process.env.MONGO_MAX_TIME_MS || 1000);
const SLOW_QUERY_MS = Number(process.env.SLOW_QUERY_MS || 200);
const USE_FLAT_COLLECTIONS = process.env.USE_FLAT_COLLECTIONS !== 'false';

// Employee size range definitions (must match frontend employeeSizeRanges labels)
const EMPLOYEE_SIZE_RANGES = [
  { label: '1-10',        min: 1,     max: 10 },
  { label: '11-50',       min: 11,    max: 50 },
  { label: '51-200',      min: 51,    max: 200 },
  { label: '201-500',     min: 201,   max: 500 },
  { label: '501-1000',    min: 501,   max: 1000 },
  { label: '1000-5000',   min: 1000,  max: 5000 },
  { label: '5000-10,000+', min: 5000,  max: Infinity }
];

// Parse a raw employee size string (e.g. "1,001-5,000", "10,001+") to its lower bound number
function parseEmployeeSizeLower(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/,/g, '').trim();
  const plusMatch = s.match(/^(\d+)\+?$/);
  if (plusMatch) return parseInt(plusMatch[1]);
  const rangeMatch = s.match(/^(\d+)[–\-](\d+)$/);
  if (rangeMatch) return parseInt(rangeMatch[1]);
  return null;
}

// Map a raw employeeSize string to a frontend range label
function normalizeEmployeeSizeLabel(raw) {
  const num = parseEmployeeSizeLower(raw);
  if (num === null) return null;
  const range = EMPLOYEE_SIZE_RANGES.find(r => num >= r.min && num <= r.max);
  return range ? range.label : null;
}

const FILE_CACHE_DURATION = 5 * 60 * 1000;
const FILE_CACHE_MAX = 50;
const fileCache = new Map();

const FLAT_COLLECTIONS_CACHE_DURATION = 5 * 60 * 1000;
let flatCollectionsCache = { timestamp: 0, ntp: false, technographics: false };

function pruneCache(map, maxSize, ttlMs) {
  const now = Date.now();
  for (const [key, value] of map.entries()) {
    if (now - value.timestamp > ttlMs) {
      map.delete(key);
    }
  }
  while (map.size > maxSize) {
    const firstKey = map.keys().next().value;
    map.delete(firstKey);
  }
}

function setCachedFile(key, data) {
  pruneCache(fileCache, FILE_CACHE_MAX, FILE_CACHE_DURATION);
  fileCache.set(key, { data, timestamp: Date.now() });
}

function getCachedFile(key) {
  const cached = fileCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < FILE_CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

async function readJsonCached(filePath) {
  const cacheKey = `json:${filePath}`;
  const cached = getCachedFile(cacheKey);
  if (cached) return cached;

  const raw = await fsp.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);
  setCachedFile(cacheKey, data);
  return data;
}

async function readTextCached(filePath) {
  const cacheKey = `text:${filePath}`;
  const cached = getCachedFile(cacheKey);
  if (cached) return cached;

  const data = await fsp.readFile(filePath, 'utf8');
  setCachedFile(cacheKey, data);
  return data;
}

function readCsvFile(filePath) {
  const csv = require('csv-parser');
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', reject);
  });
}

async function readCsvCached(filePath) {
  const cacheKey = `csv:${filePath}`;
  const cached = getCachedFile(cacheKey);
  if (cached) return cached;

  const data = await readCsvFile(filePath);
  setCachedFile(cacheKey, data);
  return data;
}

function getCachedQuery(key) {
  const cached = queryCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < QUERY_CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedQuery(key, data) {
  pruneCache(queryCache, QUERY_CACHE_MAX, QUERY_CACHE_DURATION);
  queryCache.set(key, { data, timestamp: Date.now() });
}

// Plan-aware cache key helper
function planCacheKey(req, key) {
  const plan = req.user?.plan || 'free_trial';
  return `${plan}:${key}`;
}

async function timed(label, fn) {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = Date.now() - start;
    if (duration > SLOW_QUERY_MS) {
      console.warn(`[slow-query] ${label} ${duration}ms`);
    }
  }
}

async function aggregateTimed(collection, pipeline, options, label) {
  const mergedOptions = { ...(options || {}), maxTimeMS: MONGO_MAX_TIME_MS };
  return timed(label, async () => collection.aggregate(pipeline, mergedOptions).toArray());
}

async function findTimed(collection, query, options, label) {
  const mergedOptions = { ...(options || {}), maxTimeMS: MONGO_MAX_TIME_MS };
  return timed(label, async () => collection.find(query, mergedOptions).toArray());
}

async function getFlatCollectionsAvailability(req) {
  try {
    const ntpCol = getCol(req, 'ntp_flat');
    const techCol = getCol(req, 'technographics_flat');
    const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
    const names = new Set(collections.map(c => c.name));
    return { ntp: names.has(ntpCol), technographics: names.has(techCol) };
  } catch (err) {
    return { ntp: false, technographics: false };
  }

  return { ntp: flatCollectionsCache.ntp, technographics: flatCollectionsCache.technographics };
}

async function streamCursorAsNdjson(res, cursor) {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.flushHeaders();

  let closed = false;
  res.on('close', () => {
    closed = true;
    if (typeof cursor.close === 'function') {
      cursor.close().catch(() => {});
    }
  });

  try {
    for await (const doc of cursor) {
      if (closed || res.writableEnded) break;
      const line = `${JSON.stringify(doc)}\n`;
      if (!res.write(line)) {
        await new Promise(resolve => res.once('drain', resolve));
      }
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
}

// ============================================
// NTP ROUTES - Query data collection directly
// ============================================

router.get('/ntp/metadata', cacheResponse(300), async (req, res) => {
  try {
    const startTime = Date.now();
    
    const cacheKey = planCacheKey(req, 'ntp-metadata');
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { ntp: false };
    const useFlat = availability.ntp;

    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'ntp_flat')) : dataCollection;
    const pipeline = useFlat ? [
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$category' },
          technologies: { $addToSet: '$technology' },
          predictions: { $addToSet: '$purchasePrediction' },
          companies: { $addToSet: '$companyName' },
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
    ] : [
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
    ];

    const result = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'ntp_flat.metadata' : 'data.ntp.metadata'
    );

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

// ============================================
// NTP SUMMARY - Aggregations for charts & filters
// ============================================
router.get('/ntp/summary', cacheResponse(300), async (req, res) => {
  try {
    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { ntp: false };
    const useFlat = availability.ntp;

    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'ntp_flat')) : dataCollection;

    const baseProject = useFlat ? {
      $project: {
        _id: 0,
        companyName: 1,
        category: 1,
        technology: 1,
        purchasePrediction: 1
      }
    } : {
      $project: {
        _id: 0,
        companyName: '$Company Name',
        category: '$NTP.Category',
        technology: '$NTP.Technology',
        purchasePrediction: '$NTP.Purchase Prediction'
      }
    };

    const countFacet = (field) => ([
      { $match: { [field]: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $project: { _id: 0, label: '$_id', value: 1 } },
      { $sort: { label: 1 } }
    ]);

    const pipeline = [
      ...(useFlat ? [] : [{ $unwind: '$NTP' }]),
      baseProject,
      {
        $facet: {
          categories: countFacet('category'),
          technologies: countFacet('technology'),
          predictions: countFacet('purchasePrediction'),
          companies: [
            { $match: { companyName: { $exists: true, $ne: null, $ne: '' } } },
            { $group: { _id: '$companyName' } },
            { $sort: { _id: 1 } }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'ntp_flat.summary' : 'data.ntp.summary'
    );

    res.json({
      totalRecords: result?.total?.[0]?.count || 0,
      categories: result?.categories || [],
      technologies: result?.technologies || [],
      predictions: result?.predictions || [],
      companies: (result?.companies || []).map(c => c._id)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

router.get('/ntp', cacheResponse(120), async (req, res) => {
  try {
    const startTime = Date.now();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;

    const filters = {
      companyName: req.query.companyName ? (Array.isArray(req.query.companyName) ? req.query.companyName : [req.query.companyName]) : [],
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      technology: req.query.technology ? (Array.isArray(req.query.technology) ? req.query.technology : [req.query.technology]) : [],
      prediction: req.query.prediction ? (Array.isArray(req.query.prediction) ? req.query.prediction : [req.query.prediction]) : []
    };

    const cacheKey = planCacheKey(req, `ntp-page-${page}-${limit}-${JSON.stringify(filters)}`);
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { ntp: false };
    const useFlat = availability.ntp;
    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'ntp_flat')) : dataCollection;

    const matchStage = {};
    if (filters.companyName.length > 0) matchStage[useFlat ? 'companyName' : 'Company Name'] = { $in: filters.companyName };
    if (useFlat) {
      if (filters.category.length > 0) matchStage.category = { $in: filters.category };
      if (filters.technology.length > 0) matchStage.technology = { $in: filters.technology };
      if (filters.prediction.length > 0) matchStage.purchasePrediction = { $in: filters.prediction };
    }

    const pipeline = [];
    if (!useFlat) pipeline.push({ $unwind: '$NTP' });
    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });
    if (!useFlat) {
      if (filters.category.length > 0) pipeline.push({ $match: { 'NTP.Category': { $in: filters.category } } });
      if (filters.technology.length > 0) pipeline.push({ $match: { 'NTP.Technology': { $in: filters.technology } } });
      if (filters.prediction.length > 0) pipeline.push({ $match: { 'NTP.Purchase Prediction': { $in: filters.prediction } } });
    }
    pipeline.push({
      $project: {
        _id: 0,
        companyName: useFlat ? '$companyName' : '$Company Name',
        domain: useFlat ? '$domain' : '$Firmographics.About.Domain',
        linkedinUrl: useFlat ? '$linkedinUrl' : {
          $ifNull: ['$Firmographics.About.linkedinUrl', { $ifNull: ['$Firmographics.About.LinkedIn URL', ''] }]
        },
        category: useFlat ? '$category' : '$NTP.Category',
        technology: useFlat ? '$technology' : '$NTP.Technology',
        purchaseProbability: useFlat ? '$purchaseProbability' : '$NTP.Purchase Probability (%)',
        purchasePrediction: useFlat ? '$purchasePrediction' : '$NTP.Purchase Prediction',
        ntpAnalysis: useFlat ? '$ntpAnalysis' : '$NTP.NTP Analysis',
        latestDetectedDate: useFlat ? '$latestDetectedDate' : { $ifNull: ['$NTP.Latest Date', 'N/A'] },
        previousDetectedDate: useFlat ? '$previousDetectedDate' : { $ifNull: ['$NTP.Previous Date', 'N/A'] }
      }
    });
    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }]
      }
    });

    const [result] = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'ntp_flat.page' : 'data.ntp.page'
    );

    const results = result?.data || [];
    const total = result?.total?.[0]?.count || 0;

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

    const cacheKey = planCacheKey(req, `ntp-all-${JSON.stringify(filters)}`);
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { ntp: false };
    const useFlat = availability.ntp;

    const matchStage = {};
    if (filters.companyName.length > 0) {
      matchStage[useFlat ? 'companyName' : 'Company Name'] = { $in: filters.companyName };
    }

    if (useFlat) {
      if (filters.category.length > 0) matchStage.category = { $in: filters.category };
      if (filters.technology.length > 0) matchStage.technology = { $in: filters.technology };
      if (filters.prediction.length > 0) matchStage.purchasePrediction = { $in: filters.prediction };
    }

    const pipeline = [];
    if (!useFlat) {
      pipeline.push({ $unwind: '$NTP' });
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    if (!useFlat) {
      if (filters.category.length > 0) {
        pipeline.push({ $match: { 'NTP.Category': { $in: filters.category } } });
      }
      if (filters.technology.length > 0) {
        pipeline.push({ $match: { 'NTP.Technology': { $in: filters.technology } } });
      }
      if (filters.prediction.length > 0) {
        pipeline.push({ $match: { 'NTP.Purchase Prediction': { $in: filters.prediction } } });
      }
    }

    pipeline.push({
      $project: {
        _id: 0,
        companyName: useFlat ? '$companyName' : '$Company Name',
        domain: useFlat ? '$domain' : '$Firmographics.About.Domain',
        linkedinUrl: useFlat ? '$linkedinUrl' : {
          $ifNull: [
            '$Firmographics.About.linkedinUrl',
            { $ifNull: ['$Firmographics.About.LinkedIn URL', ''] }
          ]
        },
        category: useFlat ? '$category' : '$NTP.Category',
        technology: useFlat ? '$technology' : '$NTP.Technology',
        purchaseProbability: useFlat ? '$purchaseProbability' : '$NTP.Purchase Probability (%)',
        purchasePrediction: useFlat ? '$purchasePrediction' : '$NTP.Purchase Prediction',
        ntpAnalysis: useFlat ? '$ntpAnalysis' : '$NTP.NTP Analysis',
        latestDetectedDate: useFlat ? '$latestDetectedDate' : { $ifNull: ['$NTP.Latest Date', 'N/A'] },
        previousDetectedDate: useFlat ? '$previousDetectedDate' : { $ifNull: ['$NTP.Previous Date', 'N/A'] }
      }
    });

    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'ntp_flat')) : dataCollection;
    const results = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'ntp_flat.all' : 'data.ntp.all'
    );

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
// NTP EXPORT (NDJSON streaming)
// ====================================================
router.get('/ntp/export', async (req, res) => {
  try {
    const filters = {
      companyName: req.query.companyName ? (Array.isArray(req.query.companyName) ? req.query.companyName : [req.query.companyName]) : [],
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      technology: req.query.technology ? (Array.isArray(req.query.technology) ? req.query.technology : [req.query.technology]) : [],
      prediction: req.query.prediction ? (Array.isArray(req.query.prediction) ? req.query.prediction : [req.query.prediction]) : []
    };

    res.setHeader('Content-Disposition', 'attachment; filename="ntp-export.ndjson"');
    res.setHeader('Cache-Control', 'no-store');

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { ntp: false };
    const useFlat = availability.ntp;

    if (useFlat) {
      const query = {};
      if (filters.companyName.length > 0) query.companyName = { $in: filters.companyName };
      if (filters.category.length > 0) query.category = { $in: filters.category };
      if (filters.technology.length > 0) query.technology = { $in: filters.technology };
      if (filters.prediction.length > 0) query.purchasePrediction = { $in: filters.prediction };

      const cursor = mongoose.connection.db.collection(getCol(req, 'ntp_flat'))
        .find(query, {
          projection: {
            _id: 0,
            companyName: 1,
            domain: 1,
            linkedinUrl: 1,
            category: 1,
            technology: 1,
            purchaseProbability: 1,
            purchasePrediction: 1,
            ntpAnalysis: 1,
            latestDetectedDate: 1,
            previousDetectedDate: 1
          },
          maxTimeMS: MONGO_MAX_TIME_MS
        })
        .batchSize(1000);

      await streamCursorAsNdjson(res, cursor);
      return;
    }

    const matchStage = {};
    if (filters.companyName.length > 0) matchStage['Company Name'] = { $in: filters.companyName };

    const pipeline = [{ $unwind: '$NTP' }];
    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });
    if (filters.category.length > 0) pipeline.push({ $match: { 'NTP.Category': { $in: filters.category } } });
    if (filters.technology.length > 0) pipeline.push({ $match: { 'NTP.Technology': { $in: filters.technology } } });
    if (filters.prediction.length > 0) pipeline.push({ $match: { 'NTP.Purchase Prediction': { $in: filters.prediction } } });

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

    const cursor = dataCollection.aggregate(pipeline, { allowDiskUse: true, maxTimeMS: MONGO_MAX_TIME_MS });
    await streamCursorAsNdjson(res, cursor);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// ====================================================
// TECHNOGRAPHICS ROUTES - Query data collection directly
// ====================================================

router.get('/technographics/metadata', cacheResponse(300), async (req, res) => {
  try {
    const startTime = Date.now();
    console.log(`[tech/metadata] user=${req.user?.email} plan=${req.user?.plan}`);
    
    const cacheKey = planCacheKey(req, 'tech-metadata');
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { technographics: false };
    const useFlat = availability.technographics;
    const actualColName = useFlat ? getCol(req, 'technographics_flat') : getCol(req, 'data');
    console.log(`[tech/metadata] useFlat=${useFlat} actualCollection=${actualColName}`);
    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'technographics_flat')) : dataCollection;
    const pipeline = useFlat ? [
      {
        $group: {
          _id: null,
          regions: { $addToSet: '$region' },
          industries: { $addToSet: '$industry' },
          categories: { $addToSet: '$category' },
          employeeSizes: { $addToSet: '$employeeSize' },
          revenues: { $addToSet: '$revenue' },
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
    ] : [
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
    ];

    const result = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'technographics_flat.metadata' : 'data.technographics.metadata'
    );

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

// ====================================================
// TECHNOGRAPHICS SUMMARY - Aggregations for charts & filters
// ====================================================
router.get('/technographics/summary', cacheResponse(300), async (req, res) => {
  try {
    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { technographics: false };
    const useFlat = availability.technographics;

    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'technographics_flat')) : dataCollection;

    const baseProject = useFlat ? {
      $project: {
        _id: 0,
        companyName: 1,
        region: 1,
        industry: 1,
        category: 1,
        employeeSize: 1,
        revenue: 1,
        technology: 1
      }
    } : {
      $project: {
        _id: 0,
        companyName: '$Company Name',
        region: { $ifNull: ['$Firmographics.Location.Country', 'N/A'] },
        industry: { $ifNull: ['$Firmographics.About.Industry', 'N/A'] },
        category: '$Technographics.Category',
        employeeSize: {
          $ifNull: [
            '$Firmographics.About.Full Time employees',
            { $ifNull: ['$Firmographics.About.Employees', 'N/A'] }
          ]
        },
        revenue: { $ifNull: ['$Financial_Data.Finance.Total Revenue', 'N/A'] },
        technology: '$Technographics.Keyword'
      }
    };

    // Count distinct companies per field value (not total rows, since flat collection has one row per company+technology)
    const countFacet = (field) => ([
      { $match: { [field]: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: `$${field}`, companies: { $addToSet: '$companyName' } } },
      { $project: { _id: 0, label: '$_id', value: { $size: '$companies' } } },
      { $sort: { label: 1 } }
    ]);

    const pipeline = [
      ...(useFlat ? [] : [{ $unwind: '$Technographics' }]),
      baseProject,
      {
        $facet: {
          regions: countFacet('region'),
          industries: countFacet('industry'),
          categories: countFacet('category'),
          employeeSizes: countFacet('employeeSize'),
          revenues: countFacet('revenue'),
          technologies: countFacet('technology'),
          regionCategories: [
            { $match: { region: { $exists: true, $ne: null, $ne: '' }, category: { $exists: true, $ne: null, $ne: '' } } },
            { $group: { _id: { region: '$region', category: '$category' }, value: { $sum: 1 } } }
          ],
          companies: [
            { $match: { companyName: { $exists: true, $ne: null, $ne: '' } } },
            { $group: { _id: '$companyName' } },
            { $sort: { _id: 1 } }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'technographics_flat.summary' : 'data.technographics.summary'
    );

    const regionCategoryCounts = {};
    (result?.regionCategories || []).forEach(item => {
      const region = item._id?.region || 'N/A';
      const category = item._id?.category || 'N/A';
      if (!regionCategoryCounts[region]) regionCategoryCounts[region] = {};
      regionCategoryCounts[region][category] = item.value;
    });

    // Normalize raw employee size strings (e.g. "1,001-5,000", "10,001+") into
    // the range labels the frontend uses (e.g. "1000-5000", "5000-10,000+")
    const employeeSizeRanges = [
      { label: '1-10',       min: 1,     max: 10 },
      { label: '11-50',      min: 11,    max: 50 },
      { label: '51-200',     min: 51,    max: 200 },
      { label: '201-500',    min: 201,   max: 500 },
      { label: '501-1000',   min: 501,   max: 1000 },
      { label: '1000-5000',  min: 1000,  max: 5000 },
      { label: '5000-10,000+',min: 5000,  max: Infinity }
    ];

    const parseEmployeeNum = (raw) => {
      if (!raw) return null;
      const s = String(raw).replace(/,/g, '').trim();
      // Handle "10001+" style
      const plusMatch = s.match(/^(\d+)\+?$/);
      if (plusMatch) return parseInt(plusMatch[1]);
      // Handle "1001-5000" style
      const rangeMatch = s.match(/^(\d+)[–\-](\d+)$/);
      if (rangeMatch) return parseInt(rangeMatch[1]); // use lower bound
      return null;
    };

    const normalizedEmployeeSizes = {};
    (result?.employeeSizes || []).forEach(({ label: rawLabel, value }) => {
      const num = parseEmployeeNum(rawLabel);
      if (num === null) return;
      const range = employeeSizeRanges.find(r => num >= r.min && num <= r.max);
      if (!range) return;
      normalizedEmployeeSizes[range.label] = (normalizedEmployeeSizes[range.label] || 0) + value;
    });
    const employeeSizesNormalized = Object.entries(normalizedEmployeeSizes)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => {
        const ai = employeeSizeRanges.findIndex(r => r.label === a.label);
        const bi = employeeSizeRanges.findIndex(r => r.label === b.label);
        return ai - bi;
      });

    res.json({
      totalRecords: result?.total?.[0]?.count || 0,
      regions: result?.regions || [],
      industries: result?.industries || [],
      categories: result?.categories || [],
      employeeSizes: employeeSizesNormalized,
      revenues: result?.revenues || [],
      technologies: result?.technologies || [],
      companies: (result?.companies || []).map(c => c._id),
      regionCategoryCounts
    });
  } catch (err) {
    console.error('[technographics/summary] error:', err.message);
    res.json({
      totalRecords: 0,
      regions: [],
      industries: [],
      categories: [],
      employeeSizes: [],
      revenues: [],
      technologies: [],
      companies: [],
      regionCategoryCounts: {}
    });
  }
});
// ====================================================
router.get('/technographics/filter-options', cacheResponse(300), async (req, res) => {
  try {
    const optionsPath = path.join(__dirname, '../config/filter_options.json');
    if (!fs.existsSync(optionsPath)) {
      return res.status(404).json({ error: 'Filter options file not found' });
    }

    const options = await readJsonCached(optionsPath);
    res.json(options);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load filter options', message: err.message });
  }
});

router.get('/technographics', cacheResponse(120), async (req, res) => {
  try {
    const startTime = Date.now();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;

    const filters = {
      companyName: req.query.companyName ? (Array.isArray(req.query.companyName) ? req.query.companyName : [req.query.companyName]) : [],
      region: req.query.region ? (Array.isArray(req.query.region) ? req.query.region : [req.query.region]) : [],
      technology: req.query.technology ? (Array.isArray(req.query.technology) ? req.query.technology : [req.query.technology]) : [],
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      industry: req.query.industry ? (Array.isArray(req.query.industry) ? req.query.industry : [req.query.industry]) : [],
      employeeSize: req.query.employeeSize ? (Array.isArray(req.query.employeeSize) ? req.query.employeeSize : [req.query.employeeSize]) : [],
      revenue: req.query.revenue ? (Array.isArray(req.query.revenue) ? req.query.revenue : [req.query.revenue]) : []
    };

    const cacheKey = planCacheKey(req, `tech-page-${page}-${limit}-${JSON.stringify(filters)}`);
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { technographics: false };
    const useFlat = availability.technographics;

    const matchStage = {};
    if (filters.companyName.length > 0) {
      matchStage[useFlat ? 'companyName' : 'Company Name'] = { $in: filters.companyName };
    }
    if (useFlat) {
      if (filters.region.length > 0) matchStage.region = { $in: filters.region };
      if (filters.technology.length > 0) matchStage.technology = { $in: filters.technology };
      if (filters.category.length > 0) matchStage.category = { $in: filters.category };
      if (filters.industry.length > 0) matchStage.industry = { $in: filters.industry };
    }

    // For flat collection: build a $addFields + $match to filter by normalized employee size range labels
    // Build employee size filter stages (works for both flat and non-flat paths)
    // Parses raw strings like "5,001-10,000" or "10,001+" into normalized range labels
    const buildEmpSizeStages = (empField) => {
      if (filters.employeeSize.length === 0) return [];
      const branches = EMPLOYEE_SIZE_RANGES.map(r => ({
        case: { $and: [{ $gte: ['$$n', r.min] }, { $lte: ['$$n', r.max === Infinity ? 999999999 : r.max] }] },
        then: r.label
      }));
      return [
        {
          $addFields: {
            _empLabel: {
              $let: {
                vars: {
                  n: {
                    $convert: {
                      input: {
                        $replaceAll: {
                          input: {
                            $arrayElemAt: [
                              { $split: [{ $replaceAll: { input: { $ifNull: [empField, '0'] }, find: ',', replacement: '' } }, '-'] },
                              0
                            ]
                          },
                          find: '+', replacement: ''
                        }
                      },
                      to: 'int', onError: 0, onNull: 0
                    }
                  }
                },
                in: { $switch: { branches, default: 'N/A' } }
              }
            }
          }
        },
        { $match: { _empLabel: { $in: filters.employeeSize } } }
      ];
    };

    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'technographics_flat')) : dataCollection;
    const pipeline = useFlat ? [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      ...buildEmpSizeStages('$employeeSize'),
      { $sort: { companyName: 1 } },
      {
        $project: {
          _id: 0,
          companyName: 1,
          region: 1,
          industry: 1,
          employeeSize: 1,
          revenue: 1,
          category: 1,
          technology: 1,
          domain: 1,
          linkedinUrl: 1,
          previousDetectedDate: 1,
          latestDetectedDate: 1,
          renewalDate: 1
        }
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ] : [
      { $unwind: '$Technographics' },
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      ...(filters.region.length > 0 ? [{ $match: { 'Firmographics.Location.Country': { $in: filters.region } } }] : []),
      ...(filters.technology.length > 0 ? [{ $match: { 'Technographics.Keyword': { $in: filters.technology } } }] : []),
      ...(filters.category.length > 0 ? [{ $match: { 'Technographics.Category': { $in: filters.category } } }] : []),
      ...(filters.industry.length > 0 ? [{ $match: { 'Firmographics.About.Industry': { $in: filters.industry } } }] : []),
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
      ...buildEmpSizeStages('$employeeSize'),
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ];

    const [result] = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'technographics_flat.page' : 'data.technographics.page'
    );

    const results = result?.data || [];
    const total = result?.total?.[0]?.count || 0;

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

    const cacheKey = planCacheKey(req, `tech-all-${JSON.stringify(filters)}`);
    const cached = getCachedQuery(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { technographics: false };
    const useFlat = availability.technographics;

    const matchStage = {};
    if (filters.companyName.length > 0) {
      matchStage[useFlat ? 'companyName' : 'Company Name'] = { $in: filters.companyName };
    }

    if (useFlat) {
      if (filters.region.length > 0) matchStage.region = { $in: filters.region };
      if (filters.technology.length > 0) matchStage.technology = { $in: filters.technology };
      if (filters.category.length > 0) matchStage.category = { $in: filters.category };
      if (filters.industry.length > 0) matchStage.industry = { $in: filters.industry };
      if (filters.revenue.length > 0) matchStage.revenue = { $in: filters.revenue };
    }

    const pipeline = [];
    if (!useFlat) {
      pipeline.push({ $unwind: '$Technographics' });
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Filter by employee size range labels using numeric $addFields + $match
    if (useFlat && filters.employeeSize.length > 0) {
      const branches = EMPLOYEE_SIZE_RANGES.map(r => ({
        case: { $and: [{ $gte: ['$$n', r.min] }, { $lte: ['$$n', r.max === Infinity ? 999999999 : r.max] }] },
        then: r.label
      }));
      pipeline.push({
        $addFields: {
          _empLabel: {
            $let: {
              vars: {
                n: {
                  $convert: {
                    input: { $arrayElemAt: [{ $split: [{ $replaceAll: { input: { $ifNull: ['$employeeSize', '0'] }, find: ',', replacement: '' } }, '-'] }, 0] },
                    to: 'int', onError: 0, onNull: 0
                  }
                }
              },
              in: { $switch: { branches, default: 'N/A' } }
            }
          }
        }
      });
      pipeline.push({ $match: { _empLabel: { $in: filters.employeeSize } } });
    }
    if (!useFlat) {
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
    }

    pipeline.push({
      $project: {
        _id: 0,
        companyName: useFlat ? '$companyName' : '$Company Name',
        region: useFlat ? '$region' : { $ifNull: ['$Firmographics.Location.Country', 'N/A'] },
        industry: useFlat ? '$industry' : { $ifNull: ['$Firmographics.About.Industry', 'N/A'] },
        employeeSize: useFlat ? '$employeeSize' : {
          $ifNull: [
            '$Firmographics.About.Full Time employees',
            { $ifNull: ['$Firmographics.About.Employees', 'N/A'] }
          ]
        },
        revenue: useFlat ? '$revenue' : { $ifNull: ['$Financial_Data.Finance.Total Revenue', 'N/A'] },
        category: useFlat ? '$category' : '$Technographics.Category',
        technology: useFlat ? '$technology' : '$Technographics.Keyword',
        domain: useFlat ? '$domain' : { $ifNull: ['$Firmographics.About.Domain', 'N/A'] },
        linkedinUrl: useFlat ? '$linkedinUrl' : {
          $ifNull: [
            '$Firmographics.About.linkedinUrl',
            { $ifNull: ['$Firmographics.About.LinkedIn URL', ''] }
          ]
        },
        previousDetectedDate: useFlat ? '$previousDetectedDate' : { $ifNull: ['$Technographics.Previous Date', 'N/A'] },
        latestDetectedDate: useFlat ? '$latestDetectedDate' : { $ifNull: ['$Technographics.Latest Date', 'N/A'] },
        renewalDate: useFlat ? '$renewalDate' : { $ifNull: ['$Technographics.Renewal Date', 'N/A'] }
      }
    });

    const collection = useFlat ? mongoose.connection.db.collection(getCol(req, 'technographics_flat')) : dataCollection;
    const results = await aggregateTimed(
      collection,
      pipeline,
      { allowDiskUse: true },
      useFlat ? 'technographics_flat.all' : 'data.technographics.all'
    );

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
// TECHNOGRAPHICS EXPORT (NDJSON streaming)
// ====================================================
router.get('/technographics/export', async (req, res) => {
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

    res.setHeader('Content-Disposition', 'attachment; filename="technographics-export.ndjson"');
    res.setHeader('Cache-Control', 'no-store');

    const dataCollection = getDataCollection(req);
    const availability = USE_FLAT_COLLECTIONS ? await getFlatCollectionsAvailability(req) : { technographics: false };
    const useFlat = availability.technographics;

    if (useFlat) {
      const query = {};
      if (filters.companyName.length > 0) query.companyName = { $in: filters.companyName };
      if (filters.region.length > 0) query.region = { $in: filters.region };
      if (filters.technology.length > 0) query.technology = { $in: filters.technology };
      if (filters.category.length > 0) query.category = { $in: filters.category };
      if (filters.industry.length > 0) query.industry = { $in: filters.industry };
      if (filters.employeeSize.length > 0) query.employeeSize = { $in: filters.employeeSize };
      if (filters.revenue.length > 0) query.revenue = { $in: filters.revenue };

      const cursor = mongoose.connection.db.collection(getCol(req, 'technographics_flat'))
        .find(query, {
          projection: {
            _id: 0,
            companyName: 1,
            region: 1,
            industry: 1,
            employeeSize: 1,
            revenue: 1,
            category: 1,
            technology: 1,
            domain: 1,
            linkedinUrl: 1,
            previousDetectedDate: 1,
            latestDetectedDate: 1,
            renewalDate: 1
          },
          maxTimeMS: MONGO_MAX_TIME_MS
        })
        .batchSize(1000);

      await streamCursorAsNdjson(res, cursor);
      return;
    }

    const matchStage = {};
    if (filters.companyName.length > 0) matchStage['Company Name'] = { $in: filters.companyName };

    const pipeline = [{ $unwind: '$Technographics' }];
    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });
    if (filters.region.length > 0) pipeline.push({ $match: { 'Firmographics.Location.Country': { $in: filters.region } } });
    if (filters.technology.length > 0) pipeline.push({ $match: { 'Technographics.Keyword': { $in: filters.technology } } });
    if (filters.category.length > 0) pipeline.push({ $match: { 'Technographics.Category': { $in: filters.category } } });
    if (filters.industry.length > 0) pipeline.push({ $match: { 'Firmographics.About.Industry': { $in: filters.industry } } });

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

    const cursor = dataCollection.aggregate(pipeline, { allowDiskUse: true, maxTimeMS: MONGO_MAX_TIME_MS });
    await streamCursorAsNdjson(res, cursor);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// Company details endpoint (still uses Company model for compatibility)
let companyDetailsCache = null;
let companyDetailsCacheTime = 0;
const COMPANY_DETAILS_CACHE_DURATION = 10 * 60 * 1000;

router.get('/company-details', cacheResponse(300), async (req, res) => {
  try {
    const now = Date.now();

    if (companyDetailsCache && (now - companyDetailsCacheTime) < COMPANY_DETAILS_CACHE_DURATION) {
      return res.json(companyDetailsCache);
    }

    const companies = await timed('company_details.find', async () => {
      return Company.find({}, { 'Company Name': 1, Firmographics: 1, _id: 0 })
        .maxTimeMS(MONGO_MAX_TIME_MS)
        .lean();
    });

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
const RENEWAL_CACHE_DURATION = 10 * 60 * 1000;

router.get('/renewal-intelligence/metadata', cacheResponse(300), async (req, res) => {
  try {
    const plan = req.user?.plan || 'free_trial';
    const cacheKey = `renewal-metadata-${plan}`;
    const cached = getCachedQuery(cacheKey);
    if (cached) return res.json(cached);

    const renewalCollection = mongoose.connection.db.collection(getCol(req, 'renewal_intel'));
    const [result] = await aggregateTimed(renewalCollection, [
      {
        $facet: {
          categories: [
            { $project: { value: { $ifNull: ['$Category', 'N/A'] } } },
            { $group: { _id: '$value' } },
            { $sort: { _id: 1 } }
          ],
          products: [
            { $project: { value: { $ifNull: ['$Keyword', 'N/A'] } } },
            { $group: { _id: '$value' } },
            { $sort: { _id: 1 } }
          ],
          quarters: [
            {
              $project: {
                value: {
                  $trim: {
                    input: {
                      $ifNull: [
                        '$Renewal Date',
                        { $ifNull: ['$Renewal Date\n', 'N/A'] }
                      ]
                    }
                  }
                }
              }
            },
            { $match: { value: { $ne: 'N/A', $ne: '' } } },
            { $group: { _id: '$value' } },
            { $sort: { _id: 1 } }
          ],
          companies: [
            { $project: { value: { $ifNull: ['$Company Name', 'N/A'] } } },
            { $group: { _id: '$value' } },
            { $sort: { _id: 1 } }
          ],
          totalRecords: [
            { $count: 'count' }
          ],
          categoryCounts: [
            { $project: { category: { $ifNull: ['$Category', 'N/A'] }, company: '$Company Name' } },
            { $group: { _id: { category: '$category', company: '$company' } } },
            { $group: { _id: '$_id.category', value: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, label: '$_id', value: 1 } }
          ],
          productCounts: [
            { $project: { product: { $ifNull: ['$Keyword', 'N/A'] }, company: '$Company Name' } },
            { $group: { _id: { product: '$product', company: '$company' } } },
            { $group: { _id: '$_id.product', value: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, label: '$_id', value: 1 } }
          ],
          quarterCounts: [
            {
              $project: {
                qtr: {
                  $trim: {
                    input: {
                      $ifNull: [
                        '$Renewal Date',
                        { $ifNull: ['$Renewal Date\n', 'N/A'] }
                      ]
                    }
                  }
                },
                company: '$Company Name'
              }
            },
            { $group: { _id: { qtr: '$qtr', company: '$company' } } },
            { $group: { _id: '$_id.qtr', value: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, label: '$_id', value: 1 } }
          ]
        }
      }
    ], { allowDiskUse: true }, 'renewal_intel.metadata');

    const response = result ? {
      categories: (result.categories || []).map((item) => item._id),
      products: (result.products || []).map((item) => item._id),
      quarters: (result.quarters || []).map((item) => item._id),
      companies: (result.companies || []).map((item) => item._id),
      totalRecords: result.totalRecords && result.totalRecords[0] ? result.totalRecords[0].count : 0,
      categoryCounts: result.categoryCounts || [],
      productCounts: result.productCounts || [],
      quarterCounts: result.quarterCounts || []
    } : {
      categories: [],
      products: [],
      quarters: [],
      companies: [],
      totalRecords: 0,
      categoryCounts: [],
      productCounts: [],
      quarterCounts: []
    };

    setCachedQuery(cacheKey, response);
    res.json(response);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/renewal-intelligence', async (req, res) => {
  try {
    const plan = req.user?.plan || 'free_trial';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const toArray = (value) => value ? (Array.isArray(value) ? value : [value]) : [];
    const companyNames = toArray(req.query.companyName);
    const categories = toArray(req.query.category);
    const products = toArray(req.query.product);
    const qtrs = toArray(req.query.qtr);

    const hasFilters = companyNames.length > 0 || categories.length > 0 || products.length > 0 || qtrs.length > 0;

    const renewalCacheKey = `renewal-data-${plan}-p${page}`;
    if (page === 1 && !hasFilters) {
      const cached = getCachedQuery(renewalCacheKey);
      if (cached) return res.json(cached);
    }

    const renewalCollection = mongoose.connection.db.collection(getCol(req, 'renewal_intel'));

    // The field name in DB has a trailing newline due to CSV import: "Renewal Date\n"
    // Values also have trailing \r. We normalise via $trim in the projection.
    // For filtering we must match against both the clean and dirty field names.
    const renewalDateField = { $trim: { input: { $ifNull: ['$Renewal Date', { $ifNull: ['$Renewal Date\n', ''] }] } } };

    const query = {};
    if (companyNames.length > 0) query['Company Name'] = { $in: companyNames };
    if (categories.length > 0) query['Category'] = { $in: categories };
    if (products.length > 0) query['Keyword'] = { $in: products };
    // qtr filter applied after $addFields so we can match trimmed values
    const hasQtrFilter = qtrs.length > 0;

    const pipeline = [
      { $match: query },
      {
        $addFields: {
          _renewalDateClean: renewalDateField
        }
      },
      ...(hasQtrFilter ? [{ $match: { _renewalDateClean: { $in: qtrs } } }] : []),
      {
        $project: {
          _id: 0,
          companyName: '$Company Name',
          category: { $ifNull: ['$Category', 'N/A'] },
          product: '$Keyword',
          renewalDate: '$_renewalDateClean',
          qtr: '$_renewalDateClean'
        }
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ];

    const [result] = await aggregateTimed(renewalCollection, pipeline, { allowDiskUse: true }, 'renewal_intel.page');
    const paginatedData = result?.data || [];
    const total = result?.total?.[0]?.count || 0;
    const response = {
      data: paginatedData,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };

    if (page === 1 && !hasFilters) {
      setCachedQuery(renewalCacheKey, response);
    }

    res.json(response);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/buyergroups', cacheResponse(120), async (req, res) => {
  try {

    const companies = await timed('buyergroups.find', async () => {
      return Company.find({}, { 'Company Name': 1, Firmographics: 1, Buyers_Group: 1, Financial_Data: 1, _id: 0 })
        .maxTimeMS(MONGO_MAX_TIME_MS)
        .lean();
    });

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

router.get('/intent', cacheResponse(120), async (req, res) => {
  try {
    const plan = req.user?.plan || 'free_trial';
    const cacheKey = `intent-all-${plan}`;
    const cached = getCachedQuery(cacheKey);
    if (cached) return res.json(cached);

    const intentCollection = mongoose.connection.db.collection(getCol(req, 'intent_data'));
    const intentDocs = await findTimed(
      intentCollection,
      {},
      { projection: { 'Company Name': 1, 'Intent Status': 1 } },
      'intent_data.all'
    );

    const intentData = intentDocs.map(item => ({
      companyName: item['Company Name'],
      intentStatus: item['Intent Status']
    }));

    setCachedQuery(cacheKey, intentData);
    res.json(intentData);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

router.get('/product-catalogue', cacheResponse(300), async (req, res) => {
  try {
    const { year } = req.query;
    const collectionName = year === '2026' ? 'product_catlog_2026' : 'product_catlog_2025';

    const productCatalogueCollection = mongoose.connection.db.collection(collectionName);
    const cacheKey = `collection:product-catalogue:${collectionName}`;
    const cached = getCachedFile(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const productDocs = await findTimed(
      productCatalogueCollection,
      {},
      {
        projection: {
          'Product Name': 1,
          Category: 1,
          'Sub Category': 1,
          SubCategory: 1,
          Description: 1,
          prodName: 1,
          category: 1,
          subCategory: 1,
          description: 1
        }
      },
      `product_catalogue.${collectionName}`
    );

    const productData = productDocs.map(item => ({
      prodName: item['Product Name'] || item.prodName || 'N/A',
      category: item.Category || item.category || 'N/A',
      subCategory: item['Sub Category'] || item.SubCategory || item.subCategory || 'N/A',
      description: item.Description || item.description || 'N/A'
    }));

    setCachedFile(cacheKey, productData);
    res.json(productData);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/data-dictionary', cacheResponse(300), async (req, res) => {
  try {
    const dataDictionaryCollection = mongoose.connection.db.collection('tech_data_dictionary');
    const cacheKey = 'collection:data-dictionary';
    const cached = getCachedFile(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const dataDictionary = await timed('tech_data_dictionary.all', async () => {
      return dataDictionaryCollection
        .find({}, { maxTimeMS: MONGO_MAX_TIME_MS })
        .sort({ 'Data Attribute': 1 })
        .toArray();
    });

    setCachedFile(cacheKey, dataDictionary);
    res.json(dataDictionary);
  } catch (err) {

    res.status(500).send('Server Error');
  }
});

router.get('/org-chart/companies', cacheResponse(300), async (req, res) => {
  try {
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    const cacheKey = `org-chart:companies:${csvPath}`;
    const cached = getCachedFile(cacheKey);
    if (cached) {
      return res.json({ companies: cached });
    }

    const companies = await getCompaniesFromCSV(csvPath);
    setCachedFile(cacheKey, companies);
    res.json({ companies });
  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

router.get('/org-chart/categories', cacheResponse(300), async (req, res) => {
  try {
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const data = await readCsvCached(csvPath);
    const categories = [...new Set(data.map(row => row.Category).filter(Boolean))].sort();
    res.json({ categories });
  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/org-chart/person-details', cacheResponse(300), async (req, res) => {
  try {
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const data = await readCsvCached(csvPath);

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
  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch person details' });
  }
});

router.get('/org-chart/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const data = await readCsvCached(csvPath);
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
    const s3Key = `${ORG_CHART_FOLDER}/${htmlFileName}`;

    // Check S3 cache first
    const exists = await orgChartExistsInS3(s3Key).catch(() => false);
    if (exists) {
      const signedUrl = await getSignedOrgChartUrl(s3Key);
      return res.json({ success: true, s3Url: signedUrl, fromCache: true });
    }

    // Generate and upload to S3
    const html = await generateOrgChartForCompany(csvPath, decodedCompanyName);
    const s3Result = await uploadOrgChartToS3(htmlFileName, html);
    const signedUrl = await getSignedOrgChartUrl(s3Result.s3Key);

    res.json({ success: true, s3Url: signedUrl, fromCache: false });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch org chart' });
  }
});

async function generateSelectedOrgCharts(selectedCompanies = []) {
  try {
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');

    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }

    if (!selectedCompanies || selectedCompanies.length === 0) {
      return { success: false, message: 'No companies selected' };
    }

    const sanitizeFilename = (name) => {
      name = String(name);
      name = name.replace(/[^\w\s-]/g, '').trim();
      name = name.replace(/[-\s]+/g, '_');
      return name || 'untitled_chart';
    };

    let newChartsGenerated = 0;
    let chartsSkipped = 0;

    for (const company of selectedCompanies) {
      const safeFileName = sanitizeFilename(company);
      const htmlFileName = `${safeFileName}.html`;
      const s3Key = `${ORG_CHART_FOLDER}/${htmlFileName}`;

      // Skip if already in S3
      const exists = await orgChartExistsInS3(s3Key).catch(() => false);
      if (exists) {
        chartsSkipped++;
        continue;
      }

      try {
        const html = await generateOrgChartForCompany(csvPath, company);
        await uploadOrgChartToS3(htmlFileName, html);
        newChartsGenerated++;
      } catch (err) {
        // continue on per-company errors
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



router.get('/keywords', cacheResponse(300), async (req, res) => {
  try {
    const csvPath = require('path').join(__dirname, '../Keywords(AutoRecovered).csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'Keywords CSV file not found', path: csvPath });
    }

    const keywordsData = await readCsvCached(csvPath);
    res.json({
      data: keywordsData,
      total: keywordsData.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch keywords data', details: err.message });
  }
});

router.get('/glossary', cacheResponse(300), async (req, res) => {
  try {
    const glossaryPath = require('path').join(__dirname, '../glossary.json');

    if (!fs.existsSync(glossaryPath)) {
      return res.status(404).json({ error: 'Glossary file not found', path: glossaryPath });
    }

    const glossaryData = await readJsonCached(glossaryPath);
    res.json(glossaryData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch glossary data', details: err.message });
  }
});

// ============================================
// GET /api/keywords-data - Get master table and glossary data
// ============================================
router.get('/keywords-data', cacheResponse(300), async (req, res) => {
  try {
    const keywordsDataPath = path.join(__dirname, '../keywords-data.json');
    
    if (!fs.existsSync(keywordsDataPath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Keywords data not found. Please run extractMasterTable.js first.' 
      });
    }
    
    const keywordsData = await readJsonCached(keywordsDataPath);
    res.json({
      success: true,
      data: keywordsData
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch keywords data', 
      details: err.message 
    });
  }
});

module.exports = router;
module.exports.generateSelectedOrgCharts = generateSelectedOrgCharts;