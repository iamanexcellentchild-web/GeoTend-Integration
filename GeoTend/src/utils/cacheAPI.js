/**
 * Cache API Wrapper
 * Handles advanced caching strategies for API responses
 */

const API_CACHE_NAME = 'geotend-api-cache-v1';
const DATA_CACHE_NAME = 'geotend-data-cache-v1';
const IMAGE_CACHE_NAME = 'geotend-image-cache-v1';

class CacheAPI {
  /**
   * Cache API response
   */
  static async cacheResponse(url, response) {
    try {
      const cache = await caches.open(API_CACHE_NAME);
      const responseToCache = response.clone();
      await cache.put(url, responseToCache);
      return true;
    } catch (error) {
      console.error('Failed to cache response:', error);
      return false;
    }
  }

  /**
   * Get cached response
   */
  static async getCachedResponse(url) {
    try {
      const cache = await caches.open(API_CACHE_NAME);
      return await cache.match(url);
    } catch (error) {
      console.error('Failed to get cached response:', error);
      return null;
    }
  }

  /**
   * Cache image
   */
  static async cacheImage(url) {
    try {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response.clone());
      }
      return response;
    } catch (error) {
      console.error('Failed to cache image:', error);
      return null;
    }
  }

  /**
   * Get cached image
   */
  static async getCachedImage(url) {
    try {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        return cached;
      }
      return await this.cacheImage(url);
    } catch (error) {
      console.error('Failed to get cached image:', error);
      return null;
    }
  }

  /**
   * Perform fetch with cache fallback (cache-first strategy)
   */
  static async fetchWithCache(url, options = {}) {
    try {
      const cache = await caches.open(API_CACHE_NAME);
      const cached = await cache.match(url);

      if (cached) {
        // Update cache in background if online
        if (navigator.onLine) {
          fetch(url)
            .then(response => {
              if (response.ok) {
                cache.put(url, response.clone());
              }
            })
            .catch(() => {});
        }
        return cached;
      }

      const response = await fetch(url, options);
      if (response.ok) {
        await cache.put(url, response.clone());
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch with cache:', error);
      const cached = await caches.match(url);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  /**
   * Perform fetch with network-first strategy
   */
  static async fetchNetworkFirst(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const cache = await caches.open(API_CACHE_NAME);
        await cache.put(url, response.clone());
      }
      return response;
    } catch (error) {
      console.error('Network request failed, trying cache:', error);
      const cache = await caches.open(API_CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  static async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('geotend-'))
          .map(name => caches.delete(name))
      );
      return true;
    } catch (error) {
      console.error('Failed to clear caches:', error);
      return false;
    }
  }

  /**
   * Clear specific cache
   */
  static async clearCache(cacheName) {
    try {
      await caches.delete(cacheName);
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Get cache size
   */
  static async getCacheSize() {
    try {
      const cacheNames = await caches.keys();
      const geoTendCaches = cacheNames.filter(name => name.startsWith('geotend-'));

      let totalSize = 0;
      for (const cacheName of geoTendCaches) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Pre-cache critical resources
   */
  static async preCacheResources(urls) {
    try {
      const cache = await caches.open(API_CACHE_NAME);
      await Promise.all(
        urls.map(url =>
          fetch(url)
            .then(response => {
              if (response.ok) {
                cache.put(url, response.clone());
              }
            })
            .catch(err => console.warn(`Failed to pre-cache ${url}:`, err))
        )
      );
      return true;
    } catch (error) {
      console.error('Failed to pre-cache resources:', error);
      return false;
    }
  }
}

export default CacheAPI;
