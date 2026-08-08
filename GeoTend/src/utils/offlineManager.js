/**
 * Offline Data Manager
 * Handles localStorage, IndexedDB, and cookie-based storage for offline functionality
 */

const STORAGE_KEYS = {
  ANNOUNCEMENTS: 'geotend_announcements',
  ANALYTICS: 'geotend_analytics',
  SESSIONS: 'geotend_sessions',
  USER_DATA: 'geotend_user',
  LAST_SYNC: 'geotend_last_sync',
  OFFLINE_QUEUE: 'geotend_offline_queue',
};

class OfflineManager {
  /**
   * Save announcements to local storage
   */
  static saveAnnouncements(announcements) {
    try {
      const data = {
        announcements,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(data));
      this.updateLastSync('announcements');
      return true;
    } catch (error) {
      console.error('Failed to save announcements:', error);
      return false;
    }
  }

  /**
   * Get cached announcements
   */
  static getAnnouncements() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.announcements || [];
    } catch (error) {
      console.error('Failed to retrieve announcements:', error);
      return null;
    }
  }

  /**
   * Save analytics data to local storage
   */
  static saveAnalytics(courseId, analyticsData) {
    try {
      const existing = this.getAllAnalytics() || {};
      const data = {
        ...existing,
        [courseId]: {
          data: analyticsData,
          timestamp: Date.now(),
        },
      };
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(data));
      this.updateLastSync('analytics');
      return true;
    } catch (error) {
      console.error('Failed to save analytics:', error);
      return false;
    }
  }

  /**
   * Get cached analytics data
   */
  static getAnalytics(courseId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed[courseId]?.data || null;
    } catch (error) {
      console.error('Failed to retrieve analytics:', error);
      return null;
    }
  }

  /**
   * Get all analytics data
   */
  static getAllAnalytics() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (!data) return {};
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to retrieve all analytics:', error);
      return {};
    }
  }

  /**
   * Save session data
   */
  static saveSession(sessionId, sessionData) {
    try {
      const existing = this.getAllSessions() || {};
      const data = {
        ...existing,
        [sessionId]: {
          data: sessionData,
          timestamp: Date.now(),
        },
      };
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data));
      this.updateLastSync('sessions');
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }

  /**
   * Get cached session data
   */
  static getSession(sessionId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed[sessionId]?.data || null;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Get all sessions
   */
  static getAllSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return {};
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to retrieve all sessions:', error);
      return {};
    }
  }

  /**
   * Save user data
   */
  static saveUserData(userData) {
    try {
      const data = {
        user: userData,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  /**
   * Get cached user data
   */
  static getUserData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.user || null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Add request to offline queue (for sync later)
   */
  static addToOfflineQueue(method, url, data) {
    try {
      const queue = this.getOfflineQueue();
      queue.push({
        method,
        url,
        data,
        timestamp: Date.now(),
      });
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
      return false;
    }
  }

  /**
   * Get offline queue
   */
  static getOfflineQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve offline queue:', error);
      return [];
    }
  }

  /**
   * Clear offline queue
   */
  static clearOfflineQueue() {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return true;
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
      return false;
    }
  }

  /**
   * Update last sync timestamp
   */
  static updateLastSync(dataType) {
    try {
      const syncData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '{}');
      syncData[dataType] = Date.now();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify(syncData));
      return true;
    } catch (error) {
      console.error('Failed to update last sync:', error);
      return false;
    }
  }

  /**
   * Get last sync timestamp for data type
   */
  static getLastSync(dataType) {
    try {
      const syncData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '{}');
      return syncData[dataType] || null;
    } catch (error) {
      console.error('Failed to get last sync:', error);
      return null;
    }
  }

  /**
   * Clear all offline data
   */
  static clearAllOfflineData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear all offline data:', error);
      return false;
    }
  }

  /**
   * Get storage size info
   */
  static getStorageInfo() {
    try {
      const announcements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)?.length || 0;
      const analytics = localStorage.getItem(STORAGE_KEYS.ANALYTICS)?.length || 0;
      const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS)?.length || 0;
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA)?.length || 0;
      const queue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)?.length || 0;

      return {
        announcements,
        analytics,
        sessions,
        userData,
        queue,
        total: announcements + analytics + sessions + userData + queue,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }
}

export default OfflineManager;
