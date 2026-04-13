const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// ─── Log directory setup ──────────────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, '../logs/analytics');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// In-memory store (resets on restart, max 10k entries)
const analyticsLog = [];
const MAX_LOG_SIZE = 10000;

function getTodayFile() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `${today}.log`);
}

function writeToFile(entry) {
  try {
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(getTodayFile(), line, 'utf8');
  } catch (err) {
    // don't crash the server if logging fails
  }
}

function getClientIP(req) {
  // x-real-ip is set by nginx directly to $remote_addr (most reliable)
  // x-forwarded-for can contain multiple IPs (client, proxies)
  const realIP = req.headers['x-real-ip'];
  if (realIP && realIP !== '127.0.0.1' && realIP !== '::1') return realIP;

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Take the first IP (original client), skip local IPs
    const ips = forwarded.split(',').map(ip => ip.trim());
    const publicIP = ips.find(ip => ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('10.') && !ip.startsWith('172.') && !ip.startsWith('192.168.'));
    if (publicIP) return publicIP;
    if (ips[0]) return ips[0]; // fallback to first even if private
  }

  return (
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function getUserFromToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_change_in_production');
    return decoded.email || null;
  } catch {
    return null;
  }
}

function analyticsMiddleware() {
  return (req, res, next) => {
    const skip = ['/favicon', '/.well-known', '/health', '/api/admin/analytics'];
    if (skip.some(s => req.path.startsWith(s))) return next();

    const ip = getClientIP(req);
    const user = getUserFromToken(req);
    const page = req.originalUrl;
    const method = req.method;
    const ua = req.headers['user-agent'] || 'unknown';
    const timestamp = new Date().toISOString();

    const entry = {
      timestamp,
      ip,
      user: user || 'anonymous',
      method,
      page,
      ua
    };

    console.log(`[analytics] ${timestamp} | IP: ${ip} | User: ${entry.user} | ${method} ${page}`);

    // In-memory store
    analyticsLog.push(entry);
    if (analyticsLog.length > MAX_LOG_SIZE) analyticsLog.shift();

    // Write to date file (e.g. logs/analytics/2026-04-13.log)
    writeToFile(entry);

    next();
  };
}

function getAnalyticsLog() {
  return analyticsLog;
}

// Read logs from a specific date file
function getLogsByDate(date) {
  const filePath = path.join(LOG_DIR, `${date}.log`);
  if (!fs.existsSync(filePath)) return [];
  try {
    return fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

// List all available log dates
function getAvailableLogDates() {
  try {
    return fs.readdirSync(LOG_DIR)
      .filter(f => f.endsWith('.log'))
      .map(f => f.replace('.log', ''))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

function logEntry(entry) {
  analyticsLog.push(entry);
  if (analyticsLog.length > MAX_LOG_SIZE) analyticsLog.shift();
  writeToFile(entry);
  console.log(`[analytics] ${entry.timestamp} | IP: ${entry.ip} | User: ${entry.user} | ${entry.method} ${entry.page}`);
}

module.exports = { analyticsMiddleware, getAnalyticsLog, getLogsByDate, getAvailableLogDates, logEntry };
