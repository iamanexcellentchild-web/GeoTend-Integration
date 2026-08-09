import { Link, useParams } from 'react-router-dom';
import { useAnalyticsWithOffline } from '../hooks/useOfflineData';

export default function TeacherAnalytics() {
  // Previously hardcoded to 'course-001' regardless of which session was
  // open — every analytics page showed the same (fake) numbers.
  const { id: sessionId } = useParams();

  const { analytics, loading, error, isOnline } = useAnalyticsWithOffline(
    sessionId,
    `/api/attendance/sessions/${sessionId}/analytics/`
  );

  const handleExportReport = () => {
    if (!isOnline) {
      alert('Export requires internet connection');
      return;
    }
    if (!analytics) return;

    const report = `Attendance Report\n${new Date().toLocaleString()}\n\nCourse,${analytics.course_code}\nPresent,${analytics.present}\nRejected,${analytics.rejected}\nPending,${analytics.pending}\nTotal joined,${analytics.total_joined}\nPresent rate,${analytics.present_rate}%`;
    const blob = new Blob([report], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${sessionId}-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="page">
      <section className="card">
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: '#0d2f4f' }}>
              Attendance Analytics
            </h2>
            <p style={{ margin: '0', color: '#6e8090', fontSize: '14px' }}>
              {analytics?.course_code ? `${analytics.course_code} session overview` : 'Session overview'}
            </p>
          </div>
          {!isOnline && (
            <span className="badge accent" style={{ fontSize: '12px', padding: '6px 10px' }}>
              Offline Mode
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#6e8090', fontSize: '14px' }}>Loading...</p>
          </div>
        ) : error && !analytics ? (
          <p style={{ color: '#b91c1c' }}>{error}</p>
        ) : (
          <>
            <div className="stats" style={{ marginBottom: '32px' }}>
              <div className="stat">
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6e8090' }}>Present</span>
                <strong style={{ fontSize: '32px', color: '#10b981', marginTop: '8px' }}>
                  {analytics?.present ?? 0}
                </strong>
              </div>
              <div className="stat">
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6e8090' }}>Rejected</span>
                <strong style={{ fontSize: '32px', color: '#ef4444', marginTop: '8px' }}>
                  {analytics?.rejected ?? 0}
                </strong>
              </div>
              <div className="stat">
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6e8090' }}>Pending</span>
                <strong style={{ fontSize: '32px', color: '#f59e0b', marginTop: '8px' }}>
                  {analytics?.pending ?? 0}
                </strong>
              </div>
              <div className="stat">
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6e8090' }}>Present rate</span>
                <strong style={{ fontSize: '32px', color: '#0055b3', marginTop: '8px' }}>
                  {analytics?.present_rate ?? 0}%
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn primary"
                type="button"
                onClick={handleExportReport}
                disabled={!isOnline || !analytics}
              >
                Export Report
              </button>
              <Link className="btn secondary" to="/teacher/dashboard">
                Back
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
