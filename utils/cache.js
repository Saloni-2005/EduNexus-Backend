class CacheService {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  async connect() {
    console.log('In-memory cache initialized');
    return Promise.resolve();
  }

  async get(key) {
    return this.cache.get(key) || null;
  }

  async set(key, value, expireInSeconds = 3600) {
    try {
      this.cache.set(key, value);
      
      // Clear any existing timeout for this key
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
      }
      
      // Set new timeout
      const timeout = setTimeout(() => {
        this.cache.delete(key);
        this.timeouts.delete(key);
      }, expireInSeconds * 1000);
      
      this.timeouts.set(key, timeout);
      return true;
    } catch (error) {
      console.log('Cache SET error:', error.message);
      return false;
    }
  }

  async del(key) {
    try {
      this.cache.delete(key);
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
        this.timeouts.delete(key);
      }
      return true;
    } catch (error) {
      console.log('Cache DEL error:', error.message);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace('*', '.*'));
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          await this.del(key);
        }
      }
      return true;
    } catch (error) {
      console.log('Cache DEL pattern error:', error.message);
      return false;
    }
  }

  async flush() {
    try {
      // Clear all timeouts
      for (const timeout of this.timeouts.values()) {
        clearTimeout(timeout);
      }
      
      // Clear maps
      this.cache.clear();
      this.timeouts.clear();
      return true;
    } catch (error) {
      console.log('Cache FLUSH error:', error.message);
      return false;
    }
  }
}

module.exports = new CacheService();

