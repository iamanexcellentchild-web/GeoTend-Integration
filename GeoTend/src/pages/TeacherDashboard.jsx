import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSessions } from '../utils/api';

export default function TeacherDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await listSessions();
        if (!cancelled) setSessions(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load your sessions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const activeSession = sessions.find((s) => s.status === 'active');

  return (
    <div className="page">
      <div className="hero">
        <div>
          <h2>Teacher dashboard</h2>
          <p>Use the actions below to start and manage class sessions.</p>
          <div className="btn-row">
            <Link className="btn primary" to="/teacher/session/new">Start session</Link>
            {activeSession && (
              <Link className="btn secondary" to={`/teacher/course/${activeSession.course_code}/announcements`}>
                Post announcements
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h3>Your sessions</h3>
          {loading && <p className="muted">Loading sessions…</p>}
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          {!loading && !error && sessions.length === 0 && (
            <p className="muted">No sessions yet. Start one to see it here.</p>
          )}
          <div className="list">
            {sessions.map((session) => (
              <div className="list-item" key={session.id}>
                <div>
                  <strong>{session.course_code}</strong>
                  <div className="muted">{session.course_title || 'Untitled course'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge">{session.status === 'active' ? 'Active session' : 'Ended'}</div>
                  <div className="muted">{new Date(session.start_time).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3>Quick actions</h3>
          {activeSession ? (
            <div className="list">
              <div className="list-item">
                <span>Open live session ({activeSession.course_code})</span>
                <Link className="btn secondary" to={`/teacher/session/${activeSession.id}/live`}>View</Link>
              </div>
              <div className="list-item">
                <span>Review analytics</span>
                <Link className="btn secondary" to={`/teacher/session/${activeSession.id}/analytics`}>View</Link>
              </div>
            </div>
          ) : (
            <p className="muted">Start a session to unlock live tracking and analytics.</p>
          )}
        </section>
      </div>
    </div>
  );
}
