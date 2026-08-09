import { Navigate, Route, Routes, useLocation, useNavigate, Link } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherSessionCreate from './pages/TeacherSessionCreate';
import TeacherSessionLive from './pages/TeacherSessionLive';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherAnnouncements from './pages/TeacherAnnouncements';
import StudentDashboard from './pages/StudentDashboard';
import StudentJoin from './pages/StudentJoin';
import StudentCheckin from './pages/StudentCheckin';
import StudentHistory from './pages/StudentHistory';
import OfflineIndicator from './components/OfflineIndicator';
import RequireAuth from './components/RequireAuth';
import { logoutLocally } from './utils/api';

function Shell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';
  const isLogin = location.pathname === '/login';
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

  const handleLogout = () => {
    logoutLocally();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <OfflineIndicator />
      <header className="topbar">
        <div>
          <p className="eyebrow">UNILAG classroom attendance</p>
          <h1>GeoTend</h1>
        </div>
        <nav className="top-nav" aria-label="Primary">
          {isLoggedIn ? (
            <button className="btn secondary" type="button" onClick={handleLogout}>Log out</button>
          ) : (
            <>
              <Link to="/register" className={isRegister ? 'active' : ''}>Register</Link>
              <Link to="/login" className={isLogin ? 'active' : ''}>Login</Link>
            </>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/register" element={<AuthPage type="register" />} />
        <Route path="/teacher/dashboard" element={<RequireAuth role="teacher"><TeacherDashboard /></RequireAuth>} />
        <Route path="/teacher/session/new" element={<RequireAuth role="teacher"><TeacherSessionCreate /></RequireAuth>} />
        <Route path="/teacher/session/:id/live" element={<RequireAuth role="teacher"><TeacherSessionLive /></RequireAuth>} />
        <Route path="/teacher/session/:id/analytics" element={<RequireAuth role="teacher"><TeacherAnalytics /></RequireAuth>} />
        <Route path="/teacher/course/:id/announcements" element={<RequireAuth role="teacher"><TeacherAnnouncements /></RequireAuth>} />
        <Route path="/student/dashboard" element={<RequireAuth role="student"><StudentDashboard /></RequireAuth>} />
        <Route path="/student/join" element={<RequireAuth role="student"><StudentJoin /></RequireAuth>} />
        <Route path="/student/session/:id/checkin" element={<RequireAuth role="student"><StudentCheckin /></RequireAuth>} />
        <Route path="/student/history" element={<RequireAuth role="student"><StudentHistory /></RequireAuth>} />
      </Routes>
    </Shell>
  );
}
