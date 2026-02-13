const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose
const path = require('path');
// Assuming this file is in your 'routes' folder
const yahooFinance = require('yahoo-finance2').default;
const Company = require('../models/Company');
const { generateOrgChartForCompany, getCompaniesFromCSV } = require('../org_chart');

// Enable CORS for all routes in this router
// This will add the necessary headers to your API responses
// to allow requests from your frontend.
router.use(cors());

// @route   POST /api/auth/signup
// @desc    Create a new user account
// @access  Public
router.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Here you would typically:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Save to database
    // For now, we're just validating and returning success
    // The database will handle the actual storage

    res.status(201).json({
      message: 'User account created successfully',
      user: {
        username,
        email
      }
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// @access  Public
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Here you would typically:
    // 1. Query database to find user by username
    // 2. Compare password with hashed password
    // 3. Generate and return JWT token
    // For now, we're just validating and returning success
    // The database will handle the actual authentication

    res.status(200).json({
      message: 'Login successful',
      user: {
        username
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/ntp
// @desc    Get NTP data for all companies from MongoDB database with pagination
// @access  Public
router.get('/ntp', async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Fetch companies with pagination
    const companies = await Company.find({}, { 'Company Name': 1, NTP: 1, Firmographics: 1, Technographics: 1, _id: 0 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const totalCompanies = await Company.countDocuments({});
    
    const ntpData = companies.flatMap(company => {
      const techMap = new Map((company.Technographics || []).map(t => [t.Keyword, t]));
      
      return company.NTP?.map(ntpItem => ({
        companyName: company['Company Name'],
        domain: company.Firmographics?.About?.Domain || 'N/A',
        category: ntpItem.Category,
        technology: ntpItem.Technology,
        purchaseProbability: ntpItem['Purchase Probability (%)'],
        purchasePrediction: ntpItem['Purchase Prediction'],
        ntpAnalysis: ntpItem['NTP Analysis'],
        latestDetectedDate: techMap.get(ntpItem.Technology)?.['Latest Date'] || 'N/A',
        previousDetectedDate: techMap.get(ntpItem.Technology)?.['Previous Date'] || 'N/A'
      })) || [];
    });
    
    res.json({
      data: ntpData,
      pagination: {
        currentPage: page,
        totalCompanies: totalCompanies,
        totalRecords: ntpData.length,
        hasMore: skip + limit < totalCompanies
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/technographics
// @desc    Get Technographics data for all companies with pagination
// @access  Public
router.get('/technographics', async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Fetch companies with pagination
    const allCompanies = await Company.find({})
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const totalCompanies = await Company.countDocuments({});

    const technographicsData = allCompanies.flatMap(company => {
      // Firmographics is stored as an object in the database
      const firmographics = company.Firmographics || {};
      const about = firmographics.About || {};
      const location = firmographics.Location || {};
      const finance = company.Financial_Data?.Finance || {};

      return (company.Technographics || []).map(techItem => ({
        companyName: company['Company Name'],
        region: location.Country || 'N/A',
        industry: about.Industry || 'N/A',
        employeeSize: about['Full Time employees'] || about['Full time employees'] || about.Employees || 'N/A',
        revenue: finance['Total Revenue'] || 'N/A',
        category: techItem.Category,
        technology: techItem.Keyword,
        domain: about.Domain || 'N/A',
        linkedinUrl: about.linkedinUrl || '',
        previousDetectedDate: techItem['Previous Date'] || 'N/A',
        latestDetectedDate: techItem['Latest Date'] || 'N/A',
        renewalDate: techItem['Renewal Date'] || 'N/A'
      })) || [];
    });

    // Calculate total pages based on total records (not companies)
    const totalRecords = technographicsData.length;
    
    res.json({
      data: technographicsData,
      pagination: {
        currentPage: page,
        totalCompanies: totalCompanies,
        totalRecords: totalRecords,
        hasMore: skip + limit < totalCompanies
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
  
  

// @route   GET /api/buyergroups
// @desc    Get Buyer Group data for all companies with pagination
// @access  Public
router.get('/buyergroups', async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Buyers_Group: 1, Financial_Data: 1, _id: 0 })
      .skip(skip)
      .limit(limit);

    const totalCompanies = await Company.countDocuments({});

    const buyerGroupData = companies.flatMap(company => {
      const about = company.Firmographics?.About || {};
      const location = company.Firmographics?.Location || {};

      return company.Buyers_Group?.map(item => ({
        id: company.Financial_Data?.Finance?.ID || 'N/A',
        uniqueId: `BG-${Math.floor(Math.random() * 100000)}`, // Placeholder
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

    res.json({
      data: buyerGroupData,
      pagination: {
        currentPage: page,
        totalCompanies: totalCompanies,
        totalRecords: buyerGroupData.length,
        hasMore: skip + limit < totalCompanies
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/mutualfunds
// @desc    Get Mutual Fund Holders data for all companies
// @access  Public
router.get('/intent', async (req, res) => {
  try {
    // Directly query the 'intent_data' collection
    const intentCollection = mongoose.connection.db.collection('intent_data');
    const intentDocs = await intentCollection.find({}).toArray();

    // Map the documents to the format expected by the frontend
    const intentData = intentDocs.map(item => ({
      // Use the correct field names from your 'intent_data' collection
      companyName: item['Company Name'], // Corrected field name
      intentStatus: item['Intent Status']
    }));

    res.json(intentData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/renewal-intelligence', async (req, res) => {
  try {
    const { companyName } = req.query; // Filter by 'Company Name'
    const renewalCollection = mongoose.connection.db.collection('renewal_intel');

    const query = companyName ? { 'Company Name': companyName } : {};
    const renewalDocs = await renewalCollection.find(query).toArray();

    const renewalData = renewalDocs.map(item => ({
      companyName: item['Company Name'],
      product: item.Keyword, // Using Keyword as Product
      renewalDate: item['Renewal Date'],
      qtr: item['Renewal Date'] // The quarter is the same as the renewal date
    }));
    res.json(renewalData);
  } catch (err) {
    console.error('Error fetching renewal intelligence data:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/product-catalogue
// @desc    Get Product Catalogue data by year
// @access  Public
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
    console.error('Error fetching product catalogue data:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/org-chart/companies
// @desc    Get list of all companies with org chart data
// @access  Public
router.get('/org-chart/companies', async (req, res) => {
  try {
    const fs = require('fs');
    
    // Use the CSV file
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');
    
    // Fallback to old Excel file if CSV doesn't exist
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }
    
    const companies = await getCompaniesFromCSV(csvPath);
    res.json({ companies });
  } catch (err) {
    console.error('Error fetching companies:', err.message);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// @route   GET /api/org-chart/categories
// @desc    Get unique categories from CSV file
// @access  Public
router.get('/org-chart/categories', async (req, res) => {
  try {
    const fs = require('fs');
    const csv = require('csv-parser');
    
    // Use the CSV file
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');
    
    // Fallback to old Excel file if CSV doesn't exist
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }
    
    // Read CSV file
    const data = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        // Extract unique categories
        const categories = [...new Set(data.map(row => row.Category).filter(Boolean))].sort();
        res.json({ categories });
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error.message);
        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// @route   GET /api/org-chart/person-details
// @desc    Get person details from CSV file for buying group side panel
// @access  Public
router.get('/org-chart/person-details', async (req, res) => {
  try {
    const fs = require('fs');
    const csv = require('csv-parser');
    
    // Use the CSV file
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');
    
    // Fallback to old Excel file if CSV doesn't exist
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }
    
    // Read CSV file
    const data = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        // Group data by company
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
        
        // Send as JSON directly
        res.json(companiesMap);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error.message);
        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (err) {
    console.error('Error fetching person details:', err.message);
    res.status(500).json({ error: 'Failed to fetch person details' });
  }
});

// @route   GET /api/org-chart/:companyName
// @desc    Get org chart HTML for a specific company
// @access  Public
router.get('/org-chart/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const decodedCompanyName = decodeURIComponent(companyName);
    const fs = require('fs');
    const csv = require('csv-parser');
    
    // Use the CSV file
    let csvPath = path.join(__dirname, '../Nexora Buying groups 13_02_2026.csv');
    
    // Fallback to old Excel file if CSV doesn't exist
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '../nexora Buying group.xlsx');
    }
    
    const outputFolder = path.join(__dirname, '../org_charts_output_js');
    
    // Read CSV to get location for proper filename
    const data = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', async () => {
        const companyData = data.filter(row => row['Company Name'] === decodedCompanyName);
        const location = companyData[0]?.Location ? String(companyData[0].Location).trim() : '';
        
        // Sanitize filename
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
        
        // Check if file exists
        if (fs.existsSync(htmlFilePath)) {
          let html = fs.readFileSync(htmlFilePath, 'utf-8');
          html = injectScrollableCSS(html);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(html);
        } else {
          // If file doesn't exist, generate it on-demand
          console.log(`⏳ Generating org chart on-demand for: ${decodedCompanyName}`);
          let html = await generateOrgChartForCompany(csvPath, decodedCompanyName);
          html = injectScrollableCSS(html);
          
          // Save to disk
          fs.writeFileSync(htmlFilePath, html, 'utf-8');
          console.log(`✓ Org chart saved: ${htmlFileName}`);
          
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(html);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error.message);
        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (err) {
    console.error('Error fetching org chart:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch org chart' });
  }
});

// Helper function to inject scrollable CSS into org chart HTML
function injectScrollableCSS(html) {
  const scrollableCSS = `
    .container {
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
    }
  `;
  
  // Replace the existing .container CSS
  const containerRegex = /\.container\s*\{[^}]*\}/;
  if (containerRegex.test(html)) {
    html = html.replace(containerRegex, '.container { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: auto; }');
  }
  
  // Replace the existing .chart-wrapper CSS
  const chartWrapperRegex = /\.chart-wrapper\s*\{[^}]*\}/;
  if (chartWrapperRegex.test(html)) {
    html = html.replace(chartWrapperRegex, '.chart-wrapper { flex: 1; overflow: auto; background-color: white; display: flex; justify-content: center; align-items: flex-start; padding: 10px; }');
  } else {
    // If .chart-wrapper doesn't exist, inject it into the style tag
    html = html.replace(/<\/style>/, `.chart-wrapper { flex: 1; overflow: auto; background-color: white; display: flex; justify-content: center; align-items: flex-start; padding: 10px; }</style>`);
  }
  
  // Add zoom capability to #chart element
  html = html.replace(/<\/style>/, `#chart { transform-origin: top center; transition: transform 0.2s ease; }</style>`);
  
  // Add script to handle zoom from parent window and auto-detect optimal zoom
  const zoomScript = `
    <script>
      window.currentZoom = 100;
      window.optimalZoom = 100;
      
      // Calculate optimal zoom on page load
      window.addEventListener('load', function() {
        const chartElement = document.getElementById('chart');
        if (chartElement && chartElement.getBoundingClientRect) {
          const chartRect = chartElement.getBoundingClientRect();
          const containerWidth = window.innerWidth - 40; // Account for padding
          const containerHeight = 520; // Container height from React component
          
          // Calculate zoom to fit width
          const widthZoom = (containerWidth / chartRect.width) * 100;
          // Calculate zoom to fit height
          const heightZoom = (containerHeight / chartRect.height) * 100;
          
          // Use the smaller zoom to fit both dimensions
          window.optimalZoom = Math.min(widthZoom, heightZoom, 100);
          window.optimalZoom = Math.max(window.optimalZoom, 30); // Min 30%
          window.optimalZoom = Math.round(window.optimalZoom / 10) * 10; // Round to nearest 10
          
          // Apply optimal zoom
          chartElement.style.transform = 'scale(' + (window.optimalZoom / 100) + ')';
          window.currentZoom = window.optimalZoom;
          
          // Send optimal zoom back to parent
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
    </script>
  `;
  
  html = html.replace(/<\/body>/, zoomScript + '</body>');
  
  return html;
}

// Generate org charts only for selected companies (called on-demand)
async function generateSelectedOrgCharts(selectedCompanies = []) {
  try {
    const fs = require('fs');
    const XLSX = require('xlsx');
    
    // Try to read from the new buying group Excel file first
    let excelPath = path.join(__dirname, '../nexora Buying group.xlsx');
    
    // Fallback to old file if new one doesn't exist
    if (!fs.existsSync(excelPath)) {
      excelPath = path.join(__dirname, '../AI_sample (1).xlsx');
    }
    
    const outputFolder = path.join(__dirname, '../org_charts_output_js');
    
    if (!selectedCompanies || selectedCompanies.length === 0) {
      return { success: false, message: 'No companies selected' };
    }
    
    // Ensure output folder exists
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    
    // Get existing HTML files
    const existingFiles = fs.readdirSync(outputFolder).filter(f => f.endsWith('.html'));
    const existingCompanies = new Set(existingFiles.map(f => f.replace('.html', '')));
    
    // Read Excel to get company data with locations
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Sanitize filename helper
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
        console.log(`⚠ No data found for company: ${company}`);
        continue;
      }
      
      const location = companyData[0]?.Location ? String(companyData[0].Location).trim() : '';
      
      let safeFileName = sanitizeFilename(company);
      if (location) {
        safeFileName = `${sanitizeFilename(company)}_${sanitizeFilename(location)}`;
      }
      
      // Check if chart already exists
      if (existingCompanies.has(safeFileName)) {
        console.log(`⊘ Chart already exists for: ${company}${location ? ` (${location})` : ''}`);
        chartsSkipped++;
        continue;
      }
      
      // Generate new chart
      console.log(`⏳ Generating org chart for: ${company}${location ? ` (${location})` : ''}`);
      
      try {
        const html = await generateOrgChartForCompany(excelPath, company);
        const htmlFileName = `${safeFileName}.html`;
        const htmlFilePath = path.join(outputFolder, htmlFileName);
        
        fs.writeFileSync(htmlFilePath, html, 'utf-8');
        console.log(`✓ Org chart saved: ${htmlFileName}`);
        newChartsGenerated++;
      } catch (err) {
        console.error(`✗ Error generating chart for ${company}: ${err.message}`);
      }
    }
    
    return {
      success: true,
      newChartsGenerated,
      chartsSkipped,
      message: `${newChartsGenerated} new chart(s) generated, ${chartsSkipped} existing chart(s) skipped`
    };
  } catch (err) {
    console.error('Error generating org charts:', err.message);
    return { success: false, message: err.message };
  }
}

// @route   POST /api/org-chart/generate-selected
// @desc    Generate org charts only for selected companies (on-demand)
// @access  Public
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
    console.error('Error generating selected org charts:', err.message);
    res.status(500).json({ error: 'Failed to generate org charts' });
  }
});

// Export initialization function
module.exports = router;
module.exports.generateSelectedOrgCharts = generateSelectedOrgCharts;