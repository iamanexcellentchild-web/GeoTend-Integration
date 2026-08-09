import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAnnouncementsWithOffline, useOfflineQueue } from '../hooks/useOfflineData';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function TeacherAnnouncements() {
  const { id: courseCode } = useParams();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [publishStatus, setPublishStatus] = useState('');

  // The real backend route + auth header — the old version pointed at
  // '/api/announcements', which doesn't exist anywhere in Django.
  const apiUrl = `/api/attendance/announcements/?course_code=${encodeURIComponent(courseCode || '')}`;
  const createUrl = '/api/attendance/announcements/';

  const { announcements, loading, error, isOnline } = useAnnouncementsWithOffline(apiUrl);
  const { addToQueue } = useOfflineQueue();

  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) {
      setPublishStatus('Please fill in all fields');
      return;
    }

    // Field names match CreateAnnouncementSerializer on the backend.
    const announcementData = {
      course_code: courseCode || '',
      title,
      body: message,
    };

    if (isOnline) {
      try {
        setPublishStatus('Publishing...');
        const response = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(announcementData),
        });

        if (response.ok) {
          setTitle('');
          setMessage('');
          setPublishStatus('✓ Published');
          setTimeout(() => setPublishStatus(''), 2000);
        } else {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || 'Failed to publish');
        }
      } catch (err) {
        addToQueue('POST', createUrl, announcementData);
        setPublishStatus('Saved for later sync');
        setTimeout(() => setPublishStatus(''), 2000);
      }
    } else {
      addToQueue('POST', createUrl, announcementData);
      setTitle('');
      setMessage('');
      setPublishStatus('Saved offline');
      setTimeout(() => setPublishStatus(''), 2000);
    }
  };

  return (
    <div className="page">
      <section className="card">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: '#0d2f4f' }}>
            Announcements
          </h2>
          <p style={{ margin: '0', color: '#6e8090', fontSize: '14px' }}>
            {courseCode ? `Communicate with your ${courseCode} class` : 'Communicate with your class'}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0d2f4f', marginBottom: '16px' }}>
              Post Announcement
            </h3>
            <form className="form" style={{ gap: '16px' }}>
              <label>
                <span style={{ fontWeight: '500', color: '#0d2f4f', display: 'block', marginBottom: '6px' }}>
                  Title
                </span>
                <input
                  placeholder="E.g., Assignment deadline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                <span style={{ fontWeight: '500', color: '#0d2f4f', display: 'block', marginBottom: '6px' }}>
                  Message
                </span>
                <textarea
                  rows="5"
                  placeholder="Type your announcement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
              {publishStatus && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: '500',
                }}>
                  {publishStatus}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn primary"
                  type="button"
                  onClick={handlePublish}
                  style={{ flex: 1 }}
                >
                  Publish
                </button>
                <Link className="btn secondary" to="/teacher/dashboard" style={{ flex: 1, textAlign: 'center' }}>
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0d2f4f', marginBottom: '16px' }}>
              Recent Activity
            </h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            ) : error && !announcements ? (
              <div className="empty" style={{ textAlign: 'center', padding: '20px' }}>
                No announcements yet
              </div>
            ) : announcements?.length > 0 ? (
              <div className="list" style={{ gap: '12px' }}>
                {announcements.slice(0, 5).map((a) => (
                  <div key={a.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '14px', color: '#0d2f4f' }}>{a.title}</strong>
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">No announcements</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
