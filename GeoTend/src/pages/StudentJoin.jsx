import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { joinSession } from '../utils/api';

export default function StudentJoin() {
  const navigate = useNavigate();
  const [code, setCode] = useState('ABC123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await joinSession({
        code,
        latitude: 6.5244,
        longitude: 3.3792,
      });
      if (result?.session) {
        localStorage.setItem('lastQrToken', result.qr_token || '');
        navigate('/student/session/1/checkin');
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
          {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
          <div className="btn-row">
            <button className="btn primary" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Joining...' : 'Continue'}
            </button>
            <Link className="btn secondary" to="/student/dashboard">Back</Link>
          </div>
        </form>
      </section>
    </div>
  );
}
