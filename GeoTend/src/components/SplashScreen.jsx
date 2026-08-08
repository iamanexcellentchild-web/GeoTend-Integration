import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: fadeOut ? 'none' : 'auto',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '240px',
              height: '240px',
              marginBottom: '50px',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <svg viewBox="0 0 512 512" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 10px 30px rgba(20, 184, 166, 0.3))' }}>
              <circle cx="256" cy="256" r="250" fill="rgba(255,255,255,0.1)" stroke="#14b8a6" strokeWidth="8"/>
              <g transform="translate(256, 256)">
                <path d="M 0 -180 A 180 180 0 0 1 180 0" stroke="#003d82" strokeWidth="40" fill="none" strokeLinecap="round"/>
                <path d="M 0 -130 A 130 130 0 0 1 130 0" stroke="#0055b3" strokeWidth="35" fill="none" strokeLinecap="round"/>
              </g>
              <g transform="translate(256, 256)">
                <circle cx="-60" cy="-80" r="22" fill="#14b8a6"/>
                <circle cx="-60" cy="-80" r="12" fill="#f0f9ff"/>
                <rect x="40" y="-100" width="80" height="140" rx="12" fill="none" stroke="#003d82" strokeWidth="6"/>
                <rect x="50" y="-85" width="60" height="100" rx="4" fill="#e0f2fe"/>
                <path d="M 65 -45 L 70 -35 L 80 -50" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="80" cy="-10" r="6" fill="#003d82"/>
                <path d="M 72 0 L 88 0" stroke="#003d82" strokeWidth="2"/>
              </g>
              <text x="256" y="420" fontFamily="Arial, sans-serif" fontSize="64" fontWeight="bold" textAnchor="middle" fill="#003d82">GEO</text>
              <text x="380" y="420" fontFamily="Arial, sans-serif" fontSize="64" fontWeight="bold" textAnchor="middle" fill="#14b8a6">TEND</text>
            </svg>
          </div>

          <h1
            style={{
              color: '#ffffff',
              fontSize: '42px',
              fontWeight: '700',
              margin: '20px 0 10px 0',
              letterSpacing: '-0.5px',
            }}
          >
            GeoTend
          </h1>

          <div style={{ height: '4px', width: '60px', background: 'linear-gradient(90deg, #14b8a6 0%, #0055b3 100%)', borderRadius: '2px', margin: '15px auto 40px' }}></div>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '16px',
              fontWeight: '400',
              margin: '0 0 30px 0',
            }}
          >
            Attendance Made Simple
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#14b8a6', borderRadius: '50%', margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>

          <p
            style={{
              color: '#14b8a6',
              fontSize: '13px',
              fontWeight: '500',
              margin: '0',
              letterSpacing: '0.5px',
            }}
          >
            Built by The Game Changers
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
    </>
  );
}
