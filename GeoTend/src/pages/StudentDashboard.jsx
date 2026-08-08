import { Link } from 'react-router-dom';

const courses = [
  { code: 'CPE102', title: 'Computer Engineering Lab', next: 'Session today · 10:00' },
  { code: 'MTH201', title: 'Calculus II', next: 'Attendance history updated' },
];

export default function StudentDashboard() {
  return (
    <div className="page">
      <div className="hero">
        <div>
          <h2>Student dashboard</h2>
          <p>Use the options below to join a session and review your attendance.</p>
          <div className="btn-row">
            <Link className="btn primary" to="/student/join">Join session</Link>
            <Link className="btn secondary" to="/student/history">Attendance history</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h3>Your courses</h3>
          <div className="list">
            {courses.map((course) => (
              <div className="list-item" key={course.code}>
                <div>
                  <strong>{course.code}</strong>
                  <div className="muted">{course.title}</div>
                </div>
                <span className="badge">{course.next}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>Announcements</h3>
          <div className="list">
            <div className="list-item"><span>New class update</span><span className="badge">New</span></div>
            <div className="list-item"><span>Slides available</span><span className="badge">Ready</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
