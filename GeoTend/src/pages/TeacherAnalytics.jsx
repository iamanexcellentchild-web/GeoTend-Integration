import { Link } from 'react-router-dom';
import { useAnalyticsWithOffline } from '../hooks/useOfflineData';

export default function TeacherAnalytics() {
  const courseId = 'course-001';

  const { analytics, loading, error, isOnline } = useAnalyticsWithOffline(
    courseId,
    '/api/analytics'
  );

  const defaultAnalytics = {
    present: 18,
    absent: 4,
    attendanceRate: 82,
  };

  const data = analytics || defaultAnalytics;

  const handleExportReport = () => {
    if (!isOnline) {
      alert('Export requires internet connection');
      return;
    }

    const report = `Attendance Report\n${new Date().toLocaleString()}\n\nPresent,${data.present}\nAbsent,${data.absent}\nAttendance Rate,${data.attendanceRate}%`;
    const blob = new Blob([report], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${Date.now()}.csv`;
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
              Class attendance overview
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
        ) : (
          <>
            <div className="stats" style={{ marginBottom: '32px' }}>
              <div className="stat">
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6e8090' }}>Present</span>
                <strong style={{ fontSize: '32px', color: '#10b981', marginTop: '8px' }}>
                  {data.present}
                </strong>
              </div>
              <div className="stat">
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6e8090' }}>Absent</span>
                <strong style={{ fontSize: '32px', color: '#ef4444', marginTop: '8px' }}>
                  {data.absent}
                </strong>
              </div>
              <div className="stat">
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#6e8090' }}>Rate</span>
                <strong style={{ fontSize: '32px', color: '#0055b3', marginTop: '8px' }}>
                  {data.attendanceRate}%
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn primary"
                type="button"
                onClick={handleExportReport}
                disabled={!isOnline}
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
