let redis = null;
try {
  redis = require('redis');
} catch (err) {
  console.log('ℹ️ Redis package not installed or loadable. Utilizing in-memory cache fallback.');
}

let redisClient = null;
let isRedisConnected = false;

// Local fallback cache in-memory
const localCache = new Map();
const localCacheTTLs = new Map();

// Initialize Redis if configured and package is present
if (redis && (process.env.REDIS_URL || process.env.REDIS_HOST)) {
  try {
    const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;
    redisClient = redis.createClient({ url });
    
    redisClient.on('connect', () => {
      console.log('✅ Redis client connecting...');
    });
    redisClient.on('ready', () => {
      isRedisConnected = true;
      console.log('✅ Redis Connected successfully.');
    });
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis Connection Error. Falling back to In-Memory Cache.', err.message);
      isRedisConnected = false;
    });

    redisClient.connect().catch((err) => {
      console.warn('⚠️ Redis initial connection failed. Using in-memory fallback.', err.message);
    });
  } catch (err) {
    console.error('❌ Redis client creation failed:', err.message);
  }
}

/**
 * Get item from cache
 */
const get = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.warn('Redis GET failed, using local cache', e.message);
    }
  }

  // Fallback to local cache
  if (localCache.has(key)) {
    const expiry = localCacheTTLs.get(key);
    if (expiry && Date.now() > expiry) {
      localCache.delete(key);
      localCacheTTLs.delete(key);
      return null;
    }
    return localCache.get(key);
  }
  return null;
};

/**
 * Set item in cache with TTL in seconds
 */
const set = async (key, value, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds
      });
      return true;
    } catch (e) {
      console.warn('Redis SET failed, using local cache', e.message);
    }
  }

  // Fallback to local cache
  localCache.set(key, value);
  localCacheTTLs.set(key, Date.now() + ttlSeconds * 1000);
  return true;
};

/**
 * Delete key from cache
 */
const del = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
      return true;
    } catch (e) {
      console.warn('Redis DEL failed', e.message);
    }
  }
  localCache.delete(key);
  localCacheTTLs.delete(key);
  return true;
};

/**
 * Clear all cache
 */
const clear = async () => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.flushAll();
      return true;
    } catch (e) {
      console.warn('Redis Flush failed', e.message);
    }
  }
  localCache.clear();
  localCacheTTLs.clear();
  return true;
};

module.exports = {
  get,
  set,
  del,
  clear
};
