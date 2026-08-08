import { useState } from 'react';
import { Link } from 'react-router-dom';
import { scanAttendance } from '../utils/api';

export default function StudentCheckin() {
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('lastQrToken');
      const result = await scanAttendance({
        qr_token: token,
        latitude: 6.5244,
        longitude: 3.3792,
      });
      if (result?.status === 'present') {
        setStatus('Marked present');
        return;
      }
      throw new Error(result?.detail || 'Unable to confirm attendance');
    } catch (err) {
      setError(err.message || 'Unable to confirm attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="card">
        <h2>Attendance check-in</h2>
        <p className="muted">Your attendance is now being prepared for the active session.</p>
        <div className="list" style={{ marginTop: 16 }}>
          <div className="list-item"><span>Session</span><span className="badge">CPE102</span></div>
          <div className="list-item"><span>Status</span><span className="badge">{status}</span></div>
        </div>
        {error && <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p>}
        <div className="btn-row">
          <button className="btn primary" type="button" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm attendance'}
          </button>
          <Link className="btn secondary" to="/student/history">View history</Link>
        </div>
      </section>
    </div>
  );
}
