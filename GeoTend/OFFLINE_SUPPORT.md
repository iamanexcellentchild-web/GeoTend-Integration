# Offline Support Documentation

## Overview

GeoTend now includes comprehensive offline support using the Cache API, Service Workers, and localStorage. Users can view announcements and analytics even without an internet connection, and their actions will be synced when they come back online.

## Features

### 1. **Offline Data Caching**
- Announcements are automatically cached locally
- Analytics data is stored per course
- Session data is persisted
- User profile data is cached

### 2. **Offline Queue**
- Actions performed offline are queued automatically
- When connection is restored, queued items sync automatically
- Manual sync option available

### 3. **Offline Indicator**
- Banner appears at top of screen when offline
- Shows "Offline - Showing cached data" when cache is available
- Shows "Offline - Limited functionality" when no cache available

### 4. **Smart Caching Strategies**

#### Cache-First Strategy (Images, CSS, JS)
- Loads from cache first for instant display
- Updates cache in background if online
- Best for static assets

#### Network-First Strategy (API Data)
- Attempts network first
- Falls back to cache if offline
- Stores successful responses in cache

#### Stale-While-Revalidate (Announcements, Analytics)
- Returns cached data immediately
- Updates cache in background
- Always available, always fresh

## API Usage

### Using OfflineManager

```javascript
import OfflineManager from '../utils/offlineManager';

// Save announcements
OfflineManager.saveAnnouncements(announcementArray);

// Get cached announcements
const announcements = OfflineManager.getAnnouncements();

// Save analytics for a course
OfflineManager.saveAnalytics(courseId, analyticsData);

// Get analytics
const analytics = OfflineManager.getAnalytics(courseId);

// Add action to offline queue
OfflineManager.addToOfflineQueue('POST', '/api/announcements', data);

// Get storage info
const info = OfflineManager.getStorageInfo();
// Returns: { announcements, analytics, sessions, userData, queue, total }
```

### Using Hooks

#### useOfflineMode Hook

Detects online/offline status:

```javascript
import { useOfflineMode } from '../hooks/useOfflineMode';

function MyComponent() {
  const { isOnline, hasCache } = useOfflineMode();

  return (
    <div>
      {isOnline ? 'Online' : 'Offline'}
      {hasCache && 'Has cached data available'}
    </div>
  );
}
```

#### useAnnouncementsWithOffline Hook

Fetch announcements with automatic offline support:

```javascript
import { useAnnouncementsWithOffline } from '../hooks/useOfflineData';

function AnnouncementsPage() {
  const { announcements, loading, error, isOnline } = useAnnouncementsWithOffline(
    '/api/announcements'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {!isOnline && <p>Offline mode</p>}
      {announcements?.map(a => <div key={a.id}>{a.title}</div>)}
    </div>
  );
}
```

#### useAnalyticsWithOffline Hook

Fetch analytics with offline support:

```javascript
import { useAnalyticsWithOffline } from '../hooks/useOfflineData';

function AnalyticsPage() {
  const { analytics, loading, error, isOnline } = useAnalyticsWithOffline(
    courseId,
    '/api/analytics'
  );

  if (loading) return <div>Loading...</div>;
  if (error && !analytics) return <div>Error</div>;

  return <div>{analytics?.attendanceRate}%</div>;
}
```

#### useOfflineQueue Hook

Manage offline action queue:

```javascript
import { useOfflineQueue } from '../hooks/useOfflineData';

function MyForm() {
  const { queue, addToQueue, syncQueue } = useOfflineQueue();

  const handleSubmit = async (data) => {
    if (navigator.onLine) {
      // Try to send to server
    } else {
      // Queue for later
      addToQueue('POST', '/api/action', data);
    }
  };

  return (
    <div>
      <p>Queued items: {queue.length}</p>
      <button onClick={syncQueue}>Sync Now</button>
    </div>
  );
}
```

### Using CacheAPI

Advanced cache control:

```javascript
import CacheAPI from '../utils/cacheAPI';

// Fetch with cache fallback
const response = await CacheAPI.fetchWithCache('/api/data');

// Fetch network-first strategy
const response = await CacheAPI.fetchNetworkFirst('/api/data');

// Pre-cache resources
await CacheAPI.preCacheResources(['/api/data1', '/api/data2']);

// Get cache size
const size = await CacheAPI.getCacheSize();

// Clear all caches
await CacheAPI.clearAllCaches();
```

## Storage Details

### LocalStorage Keys

- `geotend_announcements` - Cached announcements
- `geotend_analytics` - Cached analytics data (keyed by courseId)
- `geotend_sessions` - Cached session data
- `geotend_user` - Cached user profile
- `geotend_offline_queue` - Queue of offline actions
- `geotend_last_sync` - Last sync timestamps per data type

### Cache Names

- `geotend-v1` - Main app shell
- `geotend-api-cache-v1` - API responses
- `geotend-data-cache-v1` - Data requests
- `geotend-image-cache-v1` - Images

## Storage Limits

- LocalStorage: ~5-10MB per domain
- Cache API: Varies by browser, typically 50MB+

Current usage can be checked:
```javascript
const info = OfflineManager.getStorageInfo();
console.log(`Total storage used: ${info.total} bytes`);
```

## Automatic Features

### Auto-Sync on Connection Restore
- Queued items automatically sync when device comes online
- No user action required

### Background Cache Updates
- Static assets updated in background while offline
- Ensures freshest data while maintaining offline availability

### Offline Detection
- Real-time detection using `navigator.onLine`
- Service Worker handles all offline scenarios

## Testing Offline Mode

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Test features

### Chrome DevTools (Service Worker)
1. Go to Application > Service Workers
2. Check "Offline" checkbox
3. Refresh page

### Practical Testing
1. Build and install as PWA
2. Close all tabs
3. Disconnect internet
4. Open app from home screen
5. Verify features work

## Examples

### Example: Viewing Announcements Offline

```javascript
// In TeacherAnnouncements.jsx
const { announcements, loading, error, isOnline } = useAnnouncementsWithOffline(
  '/api/announcements'
);

// Automatically:
// 1. Fetches from API if online
// 2. Saves to localStorage
// 3. Falls back to cache if offline
// 4. Shows cached data with "offline" badge
```

### Example: Publishing While Offline

```javascript
const handlePublish = async () => {
  const data = { title, message };

  if (isOnline) {
    // Send to server
    const response = await fetch('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } else {
    // Queue for later
    addToQueue('POST', '/api/announcements', data);
    // User sees: "✅ Saved offline - will sync when online"
  }
};
```

## Troubleshooting

### Data Not Appearing Offline
- Check Service Worker is registered: DevTools > Application > Service Workers
- Verify offline data was cached: DevTools > Storage > Local Storage
- Try clearing cache: `OfflineManager.clearAllOfflineData()`

### Cache Not Updating
- Wait a few seconds (background update is async)
- Come back online and revisit page
- Manual cache clear: `CacheAPI.clearAllCaches()`

### Storage Full
- Clear old data: `OfflineManager.clearAllOfflineData()`
- Check storage size: `OfflineManager.getStorageInfo()`

## Best Practices

1. **Always use the hooks** - They handle all offline logic
2. **Provide offline feedback** - Use `isOnline` flag to show status
3. **Handle offline actions gracefully** - Queue or defer non-critical actions
4. **Test offline mode regularly** - Use DevTools to simulate offline
5. **Monitor storage usage** - Clear old data periodically
6. **Sync manually** - Provide sync button for critical data

## Future Enhancements

- Background sync API for more reliable syncing
- IndexedDB for larger data storage
- Delta sync (only sync changed data)
- Compression for cache storage
- Conflict resolution for sync
