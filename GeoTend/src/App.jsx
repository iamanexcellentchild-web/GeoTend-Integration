import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
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

function Shell({ children }) {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const isLogin = location.pathname === '/login';

  return (
    <div className="app-shell">
      <OfflineIndicator />
      <header className="topbar">
        <div>
          <p className="eyebrow">UNILAG classroom attendance</p>
          <h1>GeoTend</h1>
        </div>
        <nav className="top-nav" aria-label="Primary">
          <Link to="/register" className={isRegister ? 'active' : ''}>Register</Link>
          <Link to="/login" className={isLogin ? 'active' : ''}>Login</Link>
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
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/session/new" element={<TeacherSessionCreate />} />
        <Route path="/teacher/session/:id/live" element={<TeacherSessionLive />} />
        <Route path="/teacher/session/:id/analytics" element={<TeacherAnalytics />} />
        <Route path="/teacher/course/:id/announcements" element={<TeacherAnnouncements />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/join" element={<StudentJoin />} />
        <Route path="/student/session/:id/checkin" element={<StudentCheckin />} />
        <Route path="/student/history" element={<StudentHistory />} />
      </Routes>
    </Shell>
  );
}
