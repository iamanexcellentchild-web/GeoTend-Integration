import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createSession } from '../utils/api';

export default function TeacherSessionCreate() {
  const navigate = useNavigate();
  const [courseCode, setCourseCode] = useState('CPE102');
  const [courseTitle, setCourseTitle] = useState('Computer Engineering Lab');
  const [code, setCode] = useState('ABC123');
  const [latitude, setLatitude] = useState('6.5244');
  const [longitude, setLongitude] = useState('3.3792');
  const [radius, setRadius] = useState('50');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await createSession({
        course_code: courseCode,
        course_title: courseTitle,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius_m: Number(radius),
        code,
      });
      if (result?.id) {
        navigate('/teacher/dashboard');
        return;
      }
      throw new Error(result?.detail || 'Unable to create session');
    } catch (err) {
      setError(err.message || 'Unable to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="card">
        <h2>Create session</h2>
        <p className="muted">Set the class details and start attendance for the room.</p>
        <form className="form">
          <label>
            Course code
            <input value={courseCode} onChange={(event) => setCourseCode(event.target.value)} />
          </label>
          <label>
            Course title
            <input value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} />
          </label>
          <label>
            Join code
            <input value={code} onChange={(event) => setCode(event.target.value)} />
          </label>
          <label>
            Latitude
            <input value={latitude} onChange={(event) => setLatitude(event.target.value)} />
          </label>
          <label>
            Longitude
            <input value={longitude} onChange={(event) => setLongitude(event.target.value)} />
          </label>
          <label>
            Radius (meters)
            <input value={radius} onChange={(event) => setRadius(event.target.value)} />
          </label>
          {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
          <div className="btn-row">
            <button className="btn primary" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Start session'}
            </button>
            <Link className="btn secondary" to="/teacher/dashboard">Back</Link>
          </div>
        </form>
      </section>
    </div>
  );
}
