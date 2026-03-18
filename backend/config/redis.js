const { createClient } = require('redis');

let client = null;
let clientReadyPromise = null;

function getRedisClient() {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  client = createClient({ url: redisUrl });

  client.on('error', (err) => {
    console.error('[redis] error', err?.message || err);
  });

  client.on('ready', () => {
    console.log('[redis] connected');
  });

  clientReadyPromise = client.connect().catch((err) => {
    console.error('[redis] connection failed', err?.message || err);
  });

  return client;
}

async function getReadyClient() {
  const c = getRedisClient();
  if (!c) return null;
  if (clientReadyPromise) {
    await clientReadyPromise;
  }
  return c;
}

async function cacheGet(key) {
  try {
    const c = await getReadyClient();
    if (!c) return null;
    return await c.get(key);
  } catch (err) {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds) {
  try {
    const c = await getReadyClient();
    if (!c) return false;
    if (ttlSeconds && Number.isFinite(ttlSeconds)) {
      await c.set(key, value, { EX: ttlSeconds });
    } else {
      await c.set(key, value);
    }
    return true;
  } catch (err) {
    return false;
  }
}

async function cacheDel(key) {
  try {
    const c = await getReadyClient();
    if (!c) return false;
    await c.del(key);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDel
};
