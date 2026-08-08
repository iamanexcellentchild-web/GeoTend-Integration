const CACHE_NAME = 'geotend-v1';
const API_CACHE_NAME = 'geotend-api-cache-v1';
const DATA_CACHE_NAME = 'geotend-data-cache-v1';
const IMAGE_CACHE_NAME = 'geotend-image-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/src/main.jsx',
  '/src/index.css'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/announcements',
  '/api/analytics',
  '/api/sessions',
  '/api/user'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache main app shell
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('Failed to cache some URLs:', err);
        });
      }),
      // Create API cache
      caches.open(API_CACHE_NAME),
      // Create data cache
      caches.open(DATA_CACHE_NAME),
      // Create image cache
      caches.open(IMAGE_CACHE_NAME),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep only current versions
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== DATA_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Cache-first strategy for images
 */
function cacheFirstImage(request) {
  return caches.match(request).then((response) => {
    if (response) {
      return response;
    }
    return fetch(request).then((response) => {
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }
      const responseToCache = response.clone();
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
      return response;
    }).catch(() => {
      // Return placeholder or cached version if available
      return caches.match(request);
    });
  });
}

/**
 * Network-first strategy for API calls
 * Try network first, fall back to cache if offline
 */
function networkFirstAPI(request) {
  return fetch(request).then((response) => {
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }
    const responseToCache = response.clone();
    caches.open(API_CACHE_NAME).then((cache) => {
      cache.put(request, responseToCache);
    });
    return response;
  }).catch(() => {
    return caches.match(request).then((response) => {
      if (response) {
        // Add flag to indicate cached data
        const clonedResponse = response.clone();
        const responseHeaders = new Headers(clonedResponse.headers);
        responseHeaders.set('X-From-Cache', 'true');
        return new Response(clonedResponse.body, {
          status: clonedResponse.status,
          statusText: clonedResponse.statusText,
          headers: responseHeaders,
        });
      }
      // Return offline fallback
      return new Response(
        JSON.stringify({
          offline: true,
          message: 'You are offline. Showing cached data.',
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'application/json' }),
        }
      );
    });
  });
}

/**
 * Stale-while-revalidate strategy for API data
 * Return cached immediately, update cache in background
 */
function staleWhileRevalidate(request) {
  return caches.match(request).then((response) => {
    const fetchPromise = fetch(request).then((newResponse) => {
      if (!newResponse || newResponse.status !== 200 || newResponse.type !== 'basic') {
        return newResponse;
      }
      const responseToCache = newResponse.clone();
      caches.open(API_CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
      return newResponse;
    }).catch(() => {
      return response || new Response('Offline', { status: 503 });
    });

    return response || fetchPromise;
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-app requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle image requests - cache first
  if (request.destination === 'image') {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // For announcements and analytics - use stale-while-revalidate
    if (url.pathname.includes('announcements') || url.pathname.includes('analytics')) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
    // For other API calls - network first
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // Handle app shell - cache first
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        }).catch(() => {
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Handle static assets - cache first
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'manifest' ||
      url.pathname.includes('.css') ||
      url.pathname.includes('.js') ||
      url.pathname.includes('.svg')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request).then((response) => {
      if (!response || response.status !== 200) {
        return response;
      }
      const responseToCache = response.clone();
      caches.open(DATA_CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
      return response;
    }).catch(() => {
      return caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('geotend-'))
          .map(name => caches.delete(name))
      );
    });
  }
});
