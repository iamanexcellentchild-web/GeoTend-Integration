import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAttendanceHistory } from '../utils/api';

function statusLabel(status) {
  if (status === 'present') return 'Present';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

export default function StudentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await getAttendanceHistory();
        if (!cancelled) setHistory(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load attendance history');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page">
      <section className="card">
        <h2>Attendance history</h2>
        <p className="muted">Review your attendance across courses and keep track of your record.</p>
        {loading && <p className="muted" style={{ marginTop: 16 }}>Loading…</p>}
        {error && <p style={{ color: '#b91c1c', marginTop: 16 }}>{error}</p>}
        {!loading && !error && history.length === 0 && (
          <p className="muted" style={{ marginTop: 16 }}>No attendance recorded yet.</p>
        )}
        <div className="list" style={{ marginTop: 18 }}>
          {history.map((row, index) => (
            <div className="list-item" key={`${row.session_code}-${index}`}>
              <div>
                <strong>{row.course_code}</strong>
                <div className="muted">
                  {row.used_at ? new Date(row.used_at).toLocaleDateString() : new Date(row.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className="badge">{statusLabel(row.status)}</span>
            </div>
          ))}
        </div>
        <div className="btn-row">
          <Link className="btn primary" to="/student/dashboard">Back to dashboard</Link>
        </div>
      </section>
    </div>
  );
}
