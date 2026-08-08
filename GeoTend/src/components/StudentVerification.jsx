import { useState } from 'react';

export default function StudentVerification({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  const questions = [
    {
      id: 0,
      question: "What does this symbol represent?",
      image: (
        <svg viewBox="0 0 200 200" style={{ width: '120px', height: '120px' }}>
          {/* Classroom building */}
          <rect x="30" y="60" width="140" height="100" fill="none" stroke="#003d82" strokeWidth="4" rx="8"/>
          <rect x="50" y="80" width="30" height="35" fill="#e0f2fe" stroke="#003d82" strokeWidth="2"/>
          <rect x="95" y="80" width="30" height="35" fill="#e0f2fe" stroke="#003d82" strokeWidth="2"/>
          <rect x="140" y="80" width="30" height="35" fill="#e0f2fe" stroke="#003d82" strokeWidth="2"/>
          <rect x="50" y="125" width="30" height="35" fill="#e0f2fe" stroke="#003d82" strokeWidth="2"/>
          <rect x="95" y="125" width="30" height="35" fill="#e0f2fe" stroke="#003d82" strokeWidth="2"/>
          <rect x="140" y="125" width="30" height="35" fill="#e0f2fe" stroke="#003d82" strokeWidth="2"/>
          <path d="M 100 50 L 85 60 L 115 60 Z" fill="#003d82"/>
        </svg>
      ),
      options: [
        { id: 'a', label: 'Classroom', icon: '🏫', correct: true },
        { id: 'b', label: 'Hospital', icon: '🏥', correct: false },
        { id: 'c', label: 'Store', icon: '🏪', correct: false },
        { id: 'd', label: 'Home', icon: '🏠', correct: false },
      ]
    },
    {
      id: 1,
      question: "Which icon represents student attendance?",
      image: (
        <svg viewBox="0 0 200 200" style={{ width: '120px', height: '120px' }}>
          {/* Checkmark */}
          <circle cx="100" cy="100" r="70" fill="none" stroke="#14b8a6" strokeWidth="4"/>
          <path d="M 70 105 L 90 120 L 135 70" stroke="#14b8a6" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      options: [
        { id: 'a', label: 'Checkmark', icon: '✓', correct: true },
        { id: 'b', label: 'X Mark', icon: '✕', correct: false },
        { id: 'c', label: 'Question', icon: '?', correct: false },
        { id: 'd', label: 'Star', icon: '★', correct: false },
      ]
    },
    {
      id: 2,
      question: "What does a location pin indicate in an attendance app?",
      image: (
        <svg viewBox="0 0 200 200" style={{ width: '120px', height: '120px' }}>
          {/* Location pin */}
          <path d="M 100 30 C 75 30 60 45 60 70 C 60 100 100 170 100 170 C 100 170 140 100 140 70 C 140 45 125 30 100 30 Z" fill="none" stroke="#003d82" strokeWidth="4"/>
          <circle cx="100" cy="70" r="15" fill="#14b8a6"/>
        </svg>
      ),
      options: [
        { id: 'a', label: 'Location/Geofence', icon: '📍', correct: true },
        { id: 'b', label: 'Time', icon: '⏰', correct: false },
        { id: 'c', label: 'Grade', icon: '📊', correct: false },
        { id: 'd', label: 'Message', icon: '💬', correct: false },
      ]
    },
  ];

  const current = questions[currentQuestion];

  const handleAnswer = (optionId) => {
    const selected = current.options.find(opt => opt.id === optionId);
    
    if (!selected.correct) {
      setError('❌ Incorrect. Try again!');
      return;
    }

    setError('');
    setAnswers({ ...answers, [currentQuestion]: optionId });

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 800);
    } else {
      // All questions answered correctly
      localStorage.setItem('geotend_student_verified', 'true');
      onComplete();
    }
  };

  const isAnswered = answers[currentQuestion] !== undefined;

  return (
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
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(20, 184, 166, 0.2)',
          padding: '40px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Progress indicator */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
            {questions.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: i <= currentQuestion ? '#14b8a6' : '#64748b',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '13px',
              margin: '0',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}
          >
            STUDENT VERIFICATION • QUESTION {currentQuestion + 1} OF {questions.length}
          </p>
        </div>

        {/* Title */}
        <h2
          style={{
            color: '#f1f5f9',
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 30px 0',
            letterSpacing: '-0.5px',
          }}
        >
          Verify Your Identity
        </h2>

        {/* Image container */}
        <div
          style={{
            margin: '30px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '140px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(20, 184, 166, 0.1)',
          }}
        >
          {current.image}
        </div>

        {/* Question */}
        <p
          style={{
            color: '#cbd5e1',
            fontSize: '18px',
            fontWeight: '500',
            margin: '30px 0 25px 0',
            letterSpacing: '-0.3px',
          }}
        >
          {current.question}
        </p>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '25px' }}>
          {current.options.map(option => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={isAnswered}
              style={{
                padding: '14px 16px',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                background: isAnswered && answers[currentQuestion] === option.id ? 'rgba(20, 184, 166, 0.2)' : 'transparent',
                color: '#f1f5f9',
                borderRadius: '8px',
                cursor: isAnswered ? 'default' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: isAnswered ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isAnswered) {
                  e.target.style.background = 'rgba(20, 184, 166, 0.15)';
                  e.target.style.borderColor = 'rgba(20, 184, 166, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnswered) {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(20, 184, 166, 0.3)';
                }
              }}
            >
              <span style={{ marginRight: '6px' }}>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p
            style={{
              color: '#ff6b6b',
              fontSize: '14px',
              fontWeight: '500',
              margin: '20px 0 0 0',
              animation: 'shake 0.4s ease-in-out',
            }}
          >
            {error}
          </p>
        )}

        {/* Success message */}
        {isAnswered && !error && (
          <p
            style={{
              color: '#14b8a6',
              fontSize: '14px',
              fontWeight: '500',
              margin: '20px 0 0 0',
              animation: 'fadeIn 0.3s ease-in-out',
            }}
          >
            ✓ Correct! Moving to next question...
          </p>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
