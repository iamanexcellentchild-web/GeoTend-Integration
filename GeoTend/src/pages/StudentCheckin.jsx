import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { requestQrToken, scanAttendance } from '../utils/api';
import { getCurrentPosition } from '../utils/geolocation';

// Backend tokens expire after 90s (attendance/utils.py QR_TOKEN_TTL_SECONDS).
// Refresh a little before that so a slow student never hits a dead token.
const TOKEN_TTL_SECONDS = 90;
const REFRESH_MARGIN_SECONDS = 15;

export default function StudentCheckin() {
  const { id } = useParams();
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const tokenRef = useRef(localStorage.getItem('lastQrToken') || '');

  const refreshToken = async () => {
    setRefreshing(true);
    setError('');
    try {
      const position = await getCurrentPosition();
      const result = await requestQrToken({
        session_id: Number(id),
        latitude: position.latitude,
        longitude: position.longitude,
      });
      if (result?.qr_token) {
        tokenRef.current = result.qr_token;
        localStorage.setItem('lastQrToken', result.qr_token);
        setSecondsLeft(TOKEN_TTL_SECONDS);
        setStatus('Ready');
        return;
      }
      throw new Error(result?.detail || 'Unable to refresh QR token');
    } catch (err) {
      setError(err.message || 'Unable to refresh QR token');
    } finally {
      setRefreshing(false);
    }
  };

  // Get a fresh token as soon as the page loads, rather than trusting
  // whatever was stashed from the join step (it may already be stale).
  useEffect(() => {
    refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Local countdown + auto-refresh just before expiry.
  useEffect(() => {
    if (secondsLeft === null) return undefined;
    if (secondsLeft <= 0) {
      refreshToken();
      return undefined;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const position = await getCurrentPosition();
      const result = await scanAttendance({
        qr_token: tokenRef.current,
        latitude: position.latitude,
        longitude: position.longitude,
      });
      if (result?.status === 'present') {
        setStatus('Marked present');
        return;
      }
      throw new Error(result?.detail || 'Unable to confirm attendance');
    } catch (err) {
      const message = err.message || 'Unable to confirm attendance';
      setError(message);
      // A token error is exactly when a manual refresh is most useful.
      if (/token/i.test(message)) {
        refreshToken();
      }
    } finally {
      setLoading(false);
    }
  };

  const expiring = secondsLeft !== null && secondsLeft <= REFRESH_MARGIN_SECONDS;

  return (
    <div className="page">
      <section className="card">
        <h2>Attendance check-in</h2>
        <p className="muted">Your attendance is now being prepared for the active session.</p>
        <div className="list" style={{ marginTop: 16 }}>
          <div className="list-item"><span>Session</span><span className="badge">#{id}</span></div>
          <div className="list-item"><span>Status</span><span className="badge">{status}</span></div>
          <div className="list-item">
            <span>Check-in code expires</span>
            <span className="badge" style={expiring ? { color: '#b91c1c' } : undefined}>
              {secondsLeft === null ? '—' : `${secondsLeft}s`}
            </span>
          </div>
        </div>
        {error && <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p>}
        <div className="btn-row">
          <button className="btn primary" type="button" onClick={handleConfirm} disabled={loading || refreshing}>
            {loading ? 'Confirming...' : 'Confirm attendance'}
          </button>
          <button className="btn secondary" type="button" onClick={refreshToken} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh code'}
          </button>
          <Link className="btn secondary" to="/student/history">View history</Link>
        </div>
      </section>
    </div>
  );
}
