import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, updateProfile } from '../utils/api';

export default function ProfileEdit() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [matricOrStaffId, setMatricOrStaffId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setEmail(user.email || '');
        setMatricOrStaffId(user.matric_or_staff_id || '');
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Unable to load profile'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({ first_name: firstName, last_name: lastName });
      setSuccess('Profile updated');
    } catch (err) {
      setError(err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <section className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2>Edit profile</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="form" style={{ gap: 16, marginTop: 16 }}>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>First name</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Last name</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</span>
              <input value={email} disabled title="Email can't be changed here yet" />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Matric / Staff ID</span>
              <input value={matricOrStaffId} disabled />
            </label>

            {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
            {success && <p style={{ color: '#0d6b3c', margin: 0 }}>{success}</p>}

            <div className="btn-row">
              <button className="btn primary" type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <Link className="btn secondary" to="/">Back</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
