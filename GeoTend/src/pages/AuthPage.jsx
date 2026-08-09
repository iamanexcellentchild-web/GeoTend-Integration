import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser, verifyEmail, resendVerification } from '../utils/api';

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #d7e1eb',
  backgroundColor: '#f9fbfd',
};

const labelTextStyle = { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0d2f4f' };

export default function AuthPage({ type }) {
  const isRegister = type === 'register';
  const navigate = useNavigate();
  const [role, setRole] = useState(() => localStorage.getItem('geoRole') || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // 'form' = normal login/register form, 'verify' = enter the emailed code.
  // This replaces the old flow, where "Verify Email" was a button on the
  // login page that called an endpoint requiring a JWT the user didn't have
  // yet, so it always failed. Verification now happens with an emailed
  // 6-digit code, checked against a public endpoint, before login is possible.
  const [step, setStep] = useState('form');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (isRegister) {
        const trimmedName = fullName.trim();
        const [firstName, ...rest] = trimmedName ? trimmedName.split(/\s+/) : [];
        const lastName = rest.join(' ');
        const payload = {
          username: trimmedName ? trimmedName.replace(/\s+/g, '').toLowerCase() : email.split('@')[0],
          email,
          password,
          role,
          first_name: firstName || '',
          last_name: lastName || '',
          matric_or_staff_id: `${role === 'teacher' ? 'T' : 'S'}-${Date.now()}`,
        };
        const result = await registerUser(payload);
        if (result?.id || result?.username || result?.email) {
          localStorage.setItem('geoRole', role);
          setInfo(`We sent a 6-digit code to ${email}. Enter it below to verify your account.`);
          setStep('verify');
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
      // The backend tells us explicitly when the account just needs verifying,
      // so route the user straight to the code entry instead of a dead end.
      if (err?.message && /verify your email/i.test(err.message)) {
        setInfo('Your account needs email verification. Enter the code we sent you, or resend it below.');
        setStep('verify');
        return;
      }
      const message = err?.message || 'Something went wrong';
      setError(message);
      console.error('Auth request failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    setInfo('');
    try {
      const result = await verifyEmail({ email, code });
      if (result?.is_email_verified) {
        if (result.access) {
          // Backend hands back real tokens on verify now, so log the user
          // straight in instead of making them type their password again.
          localStorage.setItem('accessToken', result.access);
          localStorage.setItem('refreshToken', result.refresh);
          const finalRole = result.role || role || localStorage.getItem('geoRole') || 'student';
          localStorage.setItem('geoRole', finalRole);
          setInfo('Email verified! Logging you in...');
          setTimeout(() => {
            navigate(finalRole === 'student' ? '/student/dashboard' : '/teacher/dashboard');
          }, 2000);
          return;
        }
        setInfo('Email verified! You can sign in now.');
        setStep('form');
        setCode('');
        return;
      }
      throw new Error(result?.detail || 'Unable to verify email');
    } catch (err) {
      setError(err?.message || 'Unable to verify email');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setInfo('');
    try {
      await resendVerification({ email });
      setInfo('If that account exists, a new code has been sent.');
    } catch (err) {
      setError(err?.message || 'Unable to resend code');
    } finally {
      setResending(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="page">
        <div style={{ maxWidth: '500px', margin: '60px auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0d2f4f', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
              Verify your email
            </h1>
            <p style={{ fontSize: '16px', color: '#6e8090', margin: '0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              Enter the 6-digit code we sent to {email || 'your email'}
            </p>
          </div>

          <div className="card" style={{ boxShadow: '0 4px 16px rgba(0, 85, 179, 0.08)' }}>
            <form className="form" style={{ gap: '18px' }}>
              <label>
                <span style={labelTextStyle}>Verification code</span>
                <input
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  style={inputStyle}
                />
              </label>

              {info && <p style={{ color: '#0d6b3c', margin: 0 }}>{info}</p>}
              {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}

              <div style={{ marginTop: '8px' }}>
                <button
                  className="btn primary"
                  type="button"
                  onClick={handleVerify}
                  style={{ width: '100%' }}
                  disabled={verifying || code.length !== 6}
                >
                  {verifying ? 'Verifying...' : 'Verify email'}
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={handleResend}
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={resending || !email}
                >
                  {resending ? 'Resending...' : 'Resend code'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setError(''); setInfo(''); }}
                  style={{ background: 'none', border: 'none', color: '#0055b3', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}
                >
                  Back to {isRegister ? 'registration' : 'sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
                <span style={labelTextStyle}>Full Name</span>
                <input
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  style={inputStyle}
                />
              </label>
            )}

            <label>
              <span style={labelTextStyle}>University Email</span>
              <input
                placeholder="your.email@unilag.edu.ng"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span style={labelTextStyle}>Account Type</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" disabled>Select account type</option>
                <option value="student">Student</option>
                <option value="teacher">Instructor</option>
              </select>
            </label>

            <label>
              <span style={labelTextStyle}>Password</span>
              <input
                type="password"
                placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
              />
            </label>

            {info && <p style={{ color: '#0d6b3c', margin: 0 }}>{info}</p>}
            {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}

            <div style={{ marginTop: '8px' }}>
              <button
                className="btn primary"
                type="button"
                onClick={handleSubmit}
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Working...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  style={{ background: 'none', border: 'none', color: '#0055b3', fontWeight: '500', cursor: 'pointer', fontSize: '14px', marginTop: '12px', width: '100%' }}
                >
                  Have a verification code?
                </button>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link
                to={isRegister ? '/login' : '/register'}
                style={{
                  fontSize: '14px',
                  color: '#0055b3',
                  textDecoration: 'none',
                  fontWeight: '500',
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
