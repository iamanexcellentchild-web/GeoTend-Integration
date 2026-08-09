import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { joinSession } from '../utils/api';
import { getCurrentPosition } from '../utils/geolocation';

export default function StudentJoin() {
  const navigate = useNavigate();
  const [code, setCode] = useState('ABC123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      setLocating(true);
      let position;
      try {
        position = await getCurrentPosition();
      } finally {
        setLocating(false);
      }

      const result = await joinSession({
        code,
        latitude: position.latitude,
        longitude: position.longitude,
      });
      if (result?.session) {
        localStorage.setItem('lastQrToken', result.qr_token || '');
        localStorage.setItem('lastSessionId', String(result.session.id));
        navigate(`/student/session/${result.session.id}/checkin`);
        return;
      }
      throw new Error(result?.detail || 'Unable to join session');
    } catch (err) {
      setError(err.message || 'Unable to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="card">
        <h2>Join session</h2>
        <p className="muted">Enter the room code to continue into attendance.</p>
        <form className="form">
          <label>
            Join code
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter join code" />
          </label>
          {locating && <p className="muted" style={{ margin: 0 }}>Getting your location…</p>}
          {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
          <div className="btn-row">
            <button className="btn primary" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (locating ? 'Locating...' : 'Joining...') : 'Continue'}
            </button>
            <Link className="btn secondary" to="/student/dashboard">Back</Link>
          </div>
        </form>
      </section>
    </div>
  );
}
