import { useState, useEffect, useContext, createContext } from 'react';

/**
 * Offline context for detecting online/offline status
 */
const OfflineContext = createContext({
  isOnline: true,
  hasCache: false,
});

export function useOfflineMode() {
  const context = useContext(OfflineContext);
  if (!context) {
    return {
      isOnline: navigator.onLine,
      hasCache: false,
    };
  }
  return context;
}

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasCache, setHasCache] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for service worker and caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        setHasCache(cacheNames.some(name => name.startsWith('geotend-')));
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, hasCache }}>
      {children}
    </OfflineContext.Provider>
  );
}
