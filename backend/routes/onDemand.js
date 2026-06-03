const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const authMiddleware = require('../middleware/authMiddleware');
const OnDemand = require('../models/OnDemand');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'amzn-s3-nexora';
const ON_DEMAND_FOLDER = 'on_demand_uploads';

/**
 * POST /api/on-demand/upload-csv
 * Upload CSV file to S3 and save metadata to MongoDB
 */
router.post('/upload-csv', authMiddleware, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const userId = req.user.userId;
    const userEmail = req.user.email;
    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const fileSize = req.file.size;

    // Convert buffer to text for validation
    const csvContent = fileBuffer.toString('utf8');

    // Basic malware/malicious content checks
    const maliciousPatterns = [
      /<script/i,                    // Script tags
      /javascript:/i,                // JavaScript protocol
      /on\w+\s*=/i,                 // Event handlers (onclick, onload, etc.)
      /<iframe/i,                   // Iframes
      /eval\s*\(/i,                 // eval() function
      /document\./i,                // Document manipulation
      /window\./i,                  // Window manipulation
      /\.exe$/i,                    // Executable references
      /\.bat$/i,                    // Batch file references
      /\.sh$/i,                     // Shell script references
      /<!--[\s\S]*?-->/,            // HTML comments with potential injection
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(csvContent)) {
        return res.status(400).json({ 
          error: 'File contains potentially malicious content and cannot be uploaded' 
        });
      }
    }

    // Count rows in CSV
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // Determine if first line is header
    const hasHeader = /^[a-zA-Z_]/i.test(lines[0]?.trim() || '');
    const dataRowCount = hasHeader ? lines.length - 1 : lines.length;

    // Check row limit (5000 rows max, excluding header)
    if (dataRowCount > 5000) {
      return res.status(400).json({ 
        error: `CSV file has ${dataRowCount} rows. Maximum allowed is 5,000 rows (excluding header)`,
        rowCount: dataRowCount,
        maxRows: 5000
      });
    }

    // Validate CSV has data
    if (dataRowCount === 0) {
      return res.status(400).json({ 
        error: 'CSV file is empty or contains no data rows' 
      });
    }

    // Additional validation: Check for reasonable column count (prevent CSV bomb)
    const firstDataLine = hasHeader ? lines[1] : lines[0];
    const columnCount = firstDataLine?.split(',').length || 0;
    
    if (columnCount > 100) {
      return res.status(400).json({ 
        error: 'CSV file has too many columns (max 100)' 
      });
    }

    // Validate file size again (belt and suspenders approach)
    if (fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        error: 'File size exceeds 5MB limit' 
      });
    }

    // Generate unique S3 key with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `${ON_DEMAND_FOLDER}/${userId}_${timestamp}_${sanitizedFileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: 'text/csv',
      Metadata: {
        userId: String(userId),
        userEmail: String(userEmail),
        uploadedAt: new Date().toISOString(),
        originalFileName: fileName,
        rowCount: String(dataRowCount),
        fileSize: String(fileSize)
      }
    });

    await s3Client.send(command);

    // Generate S3 URL (internal reference, not exposed to frontend)
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

    // Save to MongoDB
    const notesText = `CSV file with ${dataRowCount} rows uploaded from Home page`;
    const onDemandRequest = new OnDemand({
      userId,
      userEmail,
      type: 'csv_upload',
      csvFileName: fileName.substring(0, 255), // Limit filename length
      s3Key,
      s3Url,
      fileSize,
      rowCount: dataRowCount,
      status: 'pending',
      notes: notesText.substring(0, 500) // Limit notes length
    });

    await onDemandRequest.save();

    res.json({
      success: true,
      message: `CSV file uploaded successfully! ${dataRowCount} rows will be processed.`,
      data: {
        requestId: onDemandRequest._id,
        fileName,
        fileSize,
        rowCount: dataRowCount,
        uploadedAt: onDemandRequest.createdAt
      }
    });
  } catch (error) {
    console.error('[on-demand/upload-csv] Error:', error);
    console.error('[on-demand/upload-csv] Error stack:', error.stack);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File size exceeds 5MB limit' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload CSV file',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/on-demand/submit-company
 * Submit company name or domain for on-demand request
 */
router.post('/submit-company', authMiddleware, async (req, res) => {
  try {
    const { companyName, domain, notes } = req.body;

    // Validate that at least one field is provided
    if (!companyName && !domain) {
      return res.status(400).json({ 
        error: 'Either company name or domain is required' 
      });
    }

    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Save to MongoDB
    const onDemandRequest = new OnDemand({
      userId,
      userEmail,
      type: 'company_domain',
      companyName: companyName || null,
      domain: domain || null,
      notes: notes || null,
      status: 'pending'
    });

    await onDemandRequest.save();

    res.json({
      success: true,
      message: 'On-demand request submitted successfully',
      data: {
        requestId: onDemandRequest._id,
        companyName,
        domain,
        submittedAt: onDemandRequest.createdAt
      }
    });
  } catch (error) {
    console.error('[on-demand/submit-company] Error:', error);
    res.status(500).json({ 
      error: 'Failed to submit on-demand request',
      details: error.message 
    });
  }
});

/**
 * GET /api/on-demand/my-requests
 * Get all on-demand requests for the authenticated user
 */
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, type, limit = 50 } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const requests = await OnDemand.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('[on-demand/my-requests] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch requests',
      details: error.message 
    });
  }
});

/**
 * GET /api/on-demand/admin/all-requests
 * Admin endpoint to get all on-demand requests
 */
router.get('/admin/all-requests', async (req, res) => {
  try {
    // Verify admin key
    if (req.query.key !== process.env.ADMIN_PROVISION_KEY) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status, type, limit = 100 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const requests = await OnDemand.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('[on-demand/admin/all-requests] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch requests',
      details: error.message 
    });
  }
});

module.exports = router;
