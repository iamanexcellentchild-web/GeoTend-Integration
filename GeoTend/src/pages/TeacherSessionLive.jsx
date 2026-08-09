import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSessionAttendees, endSession } from '../utils/api';

const POLL_INTERVAL_MS = 5000;

export default function TeacherSessionLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);
  const [ended, setEnded] = useState(false);

  const loadAttendees = useCallback(async () => {
    try {
      const result = await getSessionAttendees(id);
      setAttendees(Array.isArray(result) ? result : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load attendees');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Live tracking: poll for new check-ins while the session is open,
  // instead of showing a static hardcoded list.
  useEffect(() => {
    loadAttendees();
    if (ended) return undefined;
    const interval = setInterval(loadAttendees, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadAttendees, ended]);

  const handleEndSession = async () => {
    setEnding(true);
    setError('');
    try {
      const result = await endSession(id);
      if (result?.status === 'ended') {
        setEnded(true);
        return;
      }
      throw new Error(result?.detail || 'Unable to end session');
    } catch (err) {
      setError(err.message || 'Unable to end session');
    } finally {
      setEnding(false);
    }
  };

  const statusLabel = (status) => {
    if (status === 'present') return 'Checked in';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  return (
    <div className="page">
      <section className="card">
        <h2>Live session</h2>
        <p className="muted">
          {ended ? 'This session has ended.' : 'Track attendance and manage the active room session.'}
        </p>
        {loading && <p className="muted">Loading attendees…</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        {!loading && attendees.length === 0 && !error && (
          <p className="muted" style={{ marginTop: 16 }}>No one has joined yet.</p>
        )}
        <div className="list" style={{ marginTop: 16 }}>
          {attendees.map((person, index) => (
            <div className="list-item" key={`${person.name}-${index}`}>
              <div>
                <strong>{person.name}</strong>
                <div className="muted">{statusLabel(person.status)}</div>
              </div>
              <span className="badge">
                {person.used_at ? new Date(person.used_at).toLocaleTimeString() : '—'}
              </span>
            </div>
          ))}
        </div>
        <div className="btn-row">
          <Link className="btn primary" to={`/teacher/session/${id}/analytics`}>View analytics</Link>
          <button className="btn secondary" type="button" onClick={handleEndSession} disabled={ending || ended}>
            {ended ? 'Session ended' : ending ? 'Ending...' : 'End session'}
          </button>
          <button className="btn secondary" type="button" onClick={() => navigate('/teacher/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
