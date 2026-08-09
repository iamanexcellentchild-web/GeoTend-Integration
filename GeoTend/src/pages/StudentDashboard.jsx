import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSessions, getAttendanceHistory } from '../utils/api';

export default function StudentDashboard() {
  const [sessions, setSessions] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [sessionResult, historyResult] = await Promise.all([
          listSessions(),
          getAttendanceHistory(),
        ]);
        if (!cancelled) {
          setSessions(Array.isArray(sessionResult) ? sessionResult : []);
          setRecentHistory(Array.isArray(historyResult) ? historyResult.slice(0, 3) : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load your dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page">
      <div className="hero">
        <div>
          <h2>Student dashboard</h2>
          <p>Use the options below to join a session and review your attendance.</p>
          <div className="btn-row">
            <Link className="btn primary" to="/student/join">Join session</Link>
            <Link className="btn secondary" to="/student/history">Attendance history</Link>
          </div>
        </div>
      </div>

      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      <div className="grid grid-2">
        <section className="card">
          <h3>Active sessions</h3>
          {loading && <p className="muted">Loading…</p>}
          {!loading && sessions.length === 0 && (
            <p className="muted">No active sessions right now. Check back when class starts.</p>
          )}
          <div className="list">
            {sessions.map((session) => (
              <div className="list-item" key={session.id}>
                <div>
                  <strong>{session.course_code}</strong>
                  <div className="muted">{session.course_title || 'Untitled course'}</div>
                </div>
                <span className="badge">{session.status === 'active' ? 'Active now' : 'Ended'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>Recent attendance</h3>
          {loading && <p className="muted">Loading…</p>}
          {!loading && recentHistory.length === 0 && (
            <p className="muted">No attendance recorded yet.</p>
          )}
          <div className="list">
            {recentHistory.map((record, index) => (
              <div className="list-item" key={`${record.session_code}-${index}`}>
                <span>{record.course_code} · {record.session_code}</span>
                <span className="badge">{record.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
