import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, listAnnouncements } from '../utils/api';

const SEEN_KEY_PREFIX = 'geotend_seen_announcements_';
const POLL_INTERVAL_MS = 15000;

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((result) => { if (!cancelled) setUser(result); })
      .catch(() => { if (!cancelled) setUser(null); });
    return () => { cancelled = true; };
  }, []);

  // Announcement polling: this is what actually gets a lecturer's post in
  // front of students as a notification, not just a page they'd have to
  // remember to visit.
  useEffect(() => {
    if (!user) return undefined;

    const seenKey = `${SEEN_KEY_PREFIX}${user.username}`;

    const poll = async () => {
      try {
        const result = await listAnnouncements();
        const list = Array.isArray(result) ? result : [];
        setAnnouncements(list);
        const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
        const unseen = list.filter((a) => !seen.includes(a.id));
        setUnreadCount(unseen.length);
      } catch {
        // Silently skip — notifications are a nice-to-have, not core flow.
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const openNotifications = () => {
    setNotifOpen((open) => !open);
    if (!notifOpen && user) {
      const seenKey = `${SEEN_KEY_PREFIX}${user.username}`;
      const ids = announcements.map((a) => a.id);
      localStorage.setItem(seenKey, JSON.stringify(ids));
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('geoRole');
    navigate('/login');
  };

  if (!user) return null;

  const displayName = user.display_name || user.first_name || user.username;
  const initial = displayName?.[0]?.toUpperCase() || '?';

  return (
    <div className="app-navbar">
      <div className="app-navbar-left">
        <span className="app-navbar-avatar">{initial}</span>
        <span className="app-navbar-name">{displayName}</span>
      </div>

      <div className="app-navbar-right">
        <div className="app-navbar-notif" ref={notifRef}>
          <button
            type="button"
            className="app-navbar-icon-btn"
            onClick={openNotifications}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && <span className="app-navbar-badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="app-navbar-dropdown app-navbar-notif-dropdown">
              <div className="app-navbar-dropdown-header">Announcements</div>
              {announcements.length === 0 ? (
                <div className="app-navbar-dropdown-empty">Nothing yet</div>
              ) : (
                announcements.slice(0, 8).map((a) => (
                  <div className="app-navbar-notif-item" key={a.id}>
                    <strong>{a.title}</strong>
                    <span className="muted">{a.course_code}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="app-navbar-menu" ref={menuRef}>
          <button
            type="button"
            className="app-navbar-icon-btn app-navbar-hamburger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
          {menuOpen && (
            <div className="app-navbar-dropdown app-navbar-menu-dropdown">
              <Link to="/profile/edit" className="app-navbar-dropdown-link" onClick={() => setMenuOpen(false)}>
                Edit profile
              </Link>
              <button type="button" className="app-navbar-dropdown-link app-navbar-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
