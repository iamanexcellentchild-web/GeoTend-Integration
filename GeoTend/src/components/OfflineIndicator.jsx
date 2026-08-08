import { useOfflineMode } from '../hooks/useOfflineMode';

export default function OfflineIndicator() {
  const { isOnline, hasCache } = useOfflineMode();

  if (isOnline) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f59e0b',
        color: '#ffffff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 8000,
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <span style={{ fontSize: '18px' }}>⚠️</span>
      <span>
        {hasCache
          ? 'Offline - Showing cached data'
          : 'Offline - Limited functionality'}
      </span>
    </div>
  );
}
