import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import SplashScreen from './components/SplashScreen';
import StudentVerification from './components/StudentVerification';
import { OfflineProvider } from './hooks/useOfflineMode';
import './index.css';

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(err => {
    console.log('Service Worker registration failed: ', err);
  });
}

function AppWithSplash() {
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // Check if user has already completed verification
    const verified = localStorage.getItem('geotend_student_verified');
    if (!verified) {
      setIsFirstTime(true);
    } else {
      setVerificationComplete(true);
    }
  }, []);

  return (
    <>
      {!splashComplete && <SplashScreen onComplete={() => setSplashComplete(true)} />}
      {splashComplete && isFirstTime && !verificationComplete && (
        <StudentVerification onComplete={() => {
          setVerificationComplete(true);
          setIsFirstTime(false);
        }} />
      )}
      {splashComplete && (isFirstTime ? verificationComplete : true) && <App />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <OfflineProvider>
        <AppWithSplash />
      </OfflineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
