import { Navigate, useLocation } from 'react-router-dom';

// Simple client-side guard. The backend is still the real authority (every
// endpoint enforces IsAuthenticated + role checks independently) - this
// just avoids flashing a broken dashboard at someone who isn't logged in
// or is the wrong role.
export default function RequireAuth({ role, children }) {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  const currentRole = localStorage.getItem('geoRole');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === 'student' ? '/student/dashboard' : '/teacher/dashboard'} replace />;
  }

  return children;
}

