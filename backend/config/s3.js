const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'amzn-s3-nexora';
const ORG_CHART_FOLDER = 'org_chart_folder';

/**
 * Upload HTML file to S3
 * @param {string} fileName - Name of the file (e.g., "CompanyName_Location.html")
 * @param {string} htmlContent - HTML content to upload
 * @returns {Promise<{s3Key: string, s3Url: string, fileSize: number}>}
 */
async function uploadOrgChartToS3(fileName, htmlContent) {
  try {
    const s3Key = `${ORG_CHART_FOLDER}/${fileName}`;
    const fileSize = Buffer.byteLength(htmlContent, 'utf8');

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: htmlContent,
      ContentType: 'text/html; charset=utf-8',
      CacheControl: 'max-age=3600', // Cache for 1 hour
      Metadata: {
        uploadedAt: new Date().toISOString()
      }
    });

    await s3Client.send(command);

    // Generate public URL (if bucket is public) or signed URL
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

    console.log(`✓ Uploaded to S3: ${s3Key}`);

    return {
      s3Key,
      s3Url,
      fileSize
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Get signed URL for private S3 object (valid for 1 hour)
 * @param {string} s3Key - S3 object key
 * @returns {Promise<string>} Signed URL
 */
async function getSignedOrgChartUrl(s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Get HTML content from S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<string>} HTML content
 */
async function getOrgChartFromS3(s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    const response = await s3Client.send(command);
    const htmlContent = await streamToString(response.Body);
    
    return htmlContent;
  } catch (error) {
    console.error('Error fetching from S3:', error);
    throw new Error(`Failed to fetch from S3: ${error.message}`);
  }
}

/**
 * Check if file exists in S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<boolean>}
 */
async function orgChartExistsInS3(s3Key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Delete org chart from S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<void>}
 */
async function deleteOrgChartFromS3(s3Key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    await s3Client.send(command);
    console.log(`✓ Deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
}

/**
 * Helper function to convert stream to string
 */
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

module.exports = {
  s3Client,
  uploadOrgChartToS3,
  getSignedOrgChartUrl,
  getOrgChartFromS3,
  orgChartExistsInS3,
  deleteOrgChartFromS3,
  BUCKET_NAME,
  ORG_CHART_FOLDER
};
