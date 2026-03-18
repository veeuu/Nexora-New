const { cacheGet, cacheSet } = require('../config/redis');

function buildCacheKey(req) {
  return `api:${req.originalUrl}`;
}

function cacheResponse(ttlSeconds = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const cacheKey = buildCacheKey(req);

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      // cache errors should not affect the response
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        cacheSet(cacheKey, JSON.stringify(body), ttlSeconds);
        res.setHeader('X-Cache', 'MISS');
      } catch (err) {
        // ignore cache set errors
      }
      return originalJson(body);
    };

    return next();
  };
}

module.exports = { cacheResponse };
