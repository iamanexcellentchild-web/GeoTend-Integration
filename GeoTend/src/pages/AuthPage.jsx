import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser, verifyEmail } from '../utils/api';

export default function AuthPage({ type }) {
  const isRegister = type === 'register';
  const navigate = useNavigate();
  const [role, setRole] = useState(() => localStorage.getItem('geoRole') || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(() => localStorage.getItem('geoVerified') === 'true');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const payload = {
          username: fullName.trim() || email.split('@')[0],
          email,
          password,
          role,
          matric_or_staff_id: `${role === 'teacher' ? 'T' : 'S'}-${Date.now()}`,
        };
        const result = await registerUser(payload);
        if (result?.id || result?.username || result?.email || result?.detail) {
          localStorage.setItem('geoRole', role);
          localStorage.setItem('geoVerified', 'false');
          setVerified(false);
          navigate('/login');
          return;
        }
        throw new Error(result?.detail || 'Registration failed');
      }

      const result = await loginUser({ email, password });
      if (result?.access) {
        localStorage.setItem('accessToken', result.access);
        localStorage.setItem('refreshToken', result.refresh);
        const selectedRole = role || localStorage.getItem('geoRole') || 'teacher';
        localStorage.setItem('geoRole', selectedRole);
        navigate(selectedRole === 'student' ? '/student/dashboard' : '/teacher/dashboard');
        return;
      }
      throw new Error(result?.detail || 'Login failed');
    } catch (err) {
      const message = err?.message || 'Something went wrong';
      setError(message);
      console.error('Auth request failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verifyEmail();
      if (result?.is_email_verified) {
        localStorage.setItem('geoVerified', 'true');
        setVerified(true);
        return;
      }
      throw new Error(result?.detail || 'Unable to verify email');
    } catch (err) {
      const message = err?.message || 'Unable to verify email';
      setError(message);
      console.error('Email verification failed', err);
    }
  };

  return (
    <div className="page">
      <div style={{ maxWidth: '500px', margin: '60px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#0d2f4f',
            margin: '0 0 12px',
            letterSpacing: '-0.5px',
          }}>
            {isRegister ? 'Get Started' : 'Welcome Back'}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6e8090',
            margin: '0',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {isRegister 
              ? 'Create your account to access intelligent attendance tracking'
              : 'Sign in to your account to continue'}
          </p>
        </div>

        <div className="card" style={{ boxShadow: '0 4px 16px rgba(0, 85, 179, 0.08)' }}>
          <form className="form" style={{ gap: '18px' }}>
            {isRegister && (
              <label>
                <span style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0d2f4f' }}>
                  Full Name
                </span>
                <input 
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #d7e1eb',
                    backgroundColor: '#f9fbfd',
                  }}
                />
              </label>
            )}
            
            <label>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0d2f4f' }}>
                University Email
              </span>
              <input 
                placeholder="your.email@unilag.edu.ng" 
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d7e1eb',
                  backgroundColor: '#f9fbfd',
                }}
              />
            </label>

            <label>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0d2f4f' }}>
                Account Type
              </span>
              <select 
                value={role} 
                onChange={(event) => setRole(event.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d7e1eb',
                  backgroundColor: '#f9fbfd',
                  cursor: 'pointer',
                }}
              >
                <option value="" disabled>Select account type</option>
                <option value="student">Student</option>
                <option value="teacher">Instructor</option>
              </select>
            </label>

            <label>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0d2f4f' }}>
                Password
              </span>
              <input 
                type="password" 
                placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d7e1eb',
                  backgroundColor: '#f9fbfd',
                }}
              />
            </label>

            {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}

            <div style={{ marginTop: '8px' }}>
              {!isRegister && !verified && (
                <button 
                  className="btn secondary" 
                  type="button" 
                  onClick={handleVerify}
                  style={{ width: '100%', marginBottom: '12px' }}
                >
                  Verify Email
                </button>
              )}
              <button 
                className="btn primary" 
                type="button" 
                onClick={handleSubmit}
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Working...' : isRegister ? 'Create Account' : verified ? 'Sign In' : 'Awaiting Verification'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link 
                to={isRegister ? '/login' : '/register'}
                style={{
                  fontSize: '14px',
                  color: '#0055b3',
                  textDecoration: 'none',
                  fontWeight: '500',
                  hover: { textDecoration: 'underline' },
                }}
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </Link>
            </div>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '30px',
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
