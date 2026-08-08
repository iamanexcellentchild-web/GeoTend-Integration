import { useState, useEffect } from 'react';
import OfflineManager from '../utils/offlineManager';
import CacheAPI from '../utils/cacheAPI';
import { useOfflineMode } from './useOfflineMode';

/**
 * Hook for fetching announcements with offline support
 */
export function useAnnouncementsWithOffline(apiUrl) {
  const [announcements, setAnnouncements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline } = useOfflineMode();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API if online
        if (isOnline && apiUrl) {
          const response = await CacheAPI.fetchNetworkFirst(apiUrl);
          if (response.ok) {
            const data = await response.json();
            OfflineManager.saveAnnouncements(data);
            setAnnouncements(data);
          } else {
            throw new Error('Failed to fetch announcements');
          }
        } else {
          // Try to get cached data
          const cached = OfflineManager.getAnnouncements();
          if (cached) {
            setAnnouncements(cached);
          } else {
            setError('No announcements available offline');
          }
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
        // Try cached data as fallback
        const cached = OfflineManager.getAnnouncements();
        if (cached) {
          setAnnouncements(cached);
          setError('Showing cached announcements');
        } else {
          setError(err.message || 'Failed to fetch announcements');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [apiUrl, isOnline]);

  return { announcements, loading, error, isOnline };
}

/**
 * Hook for fetching analytics with offline support
 */
export function useAnalyticsWithOffline(courseId, apiUrl) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline } = useOfflineMode();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API if online
        if (isOnline && apiUrl) {
          const response = await CacheAPI.fetchNetworkFirst(apiUrl);
          if (response.ok) {
            const data = await response.json();
            OfflineManager.saveAnalytics(courseId, data);
            setAnalytics(data);
          } else {
            throw new Error('Failed to fetch analytics');
          }
        } else {
          // Try to get cached data
          const cached = OfflineManager.getAnalytics(courseId);
          if (cached) {
            setAnalytics(cached);
          } else {
            setError('No analytics available offline');
          }
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        // Try cached data as fallback
        const cached = OfflineManager.getAnalytics(courseId);
        if (cached) {
          setAnalytics(cached);
          setError('Showing cached analytics');
        } else {
          setError(err.message || 'Failed to fetch analytics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [apiUrl, courseId, isOnline]);

  return { analytics, loading, error, isOnline };
}

/**
 * Hook for managing offline queue (for syncing later)
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState([]);
  const { isOnline } = useOfflineMode();

  useEffect(() => {
    // Load queue on mount
    const offlineQueue = OfflineManager.getOfflineQueue();
    setQueue(offlineQueue);
  }, []);

  const addToQueue = (method, url, data) => {
    OfflineManager.addToOfflineQueue(method, url, data);
    const offlineQueue = OfflineManager.getOfflineQueue();
    setQueue(offlineQueue);
  };

  const syncQueue = async () => {
    const offlineQueue = OfflineManager.getOfflineQueue();
    let syncedCount = 0;

    for (const item of offlineQueue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          syncedCount++;
        }
      } catch (err) {
        console.error('Failed to sync item:', err);
      }
    }

    if (syncedCount > 0) {
      OfflineManager.clearOfflineQueue();
      setQueue([]);
    }

    return syncedCount;
  };

  useEffect(() => {
    // Auto-sync when coming back online
    if (isOnline && queue.length > 0) {
      syncQueue();
    }
  }, [isOnline]);

  return { queue, addToQueue, syncQueue };
}
