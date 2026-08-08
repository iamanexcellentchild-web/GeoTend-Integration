import { Link } from 'react-router-dom';

const courses = [
  { code: 'CPE102', title: 'Computer Engineering Lab', students: 84, status: 'Active session' },
  { code: 'MTH201', title: 'Calculus II', students: 132, status: '3 sessions this term' },
  { code: 'ENG201', title: 'Engineering Graphics', students: 61, status: 'Ready to start' },
];

export default function TeacherDashboard() {
  return (
    <div className="page">
      <div className="hero">
        <div>
          <h2>Teacher dashboard</h2>
          <p>Use the actions below to start and manage class sessions.</p>
          <div className="btn-row">
            <Link className="btn primary" to="/teacher/session/new">Start session</Link>
            <Link className="btn secondary" to="/teacher/course/1/announcements">Post announcements</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h3>Courses</h3>
          <div className="list">
            {courses.map((course) => (
              <div className="list-item" key={course.code}>
                <div>
                  <strong>{course.code}</strong>
                  <div className="muted">{course.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge">{course.status}</div>
                  <div className="muted">{course.students} students</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3>Quick actions</h3>
          <div className="list">
            <div className="list-item"><span>Open live session</span><Link className="btn secondary" to="/teacher/session/1/live">View</Link></div>
            <div className="list-item"><span>Review analytics</span><Link className="btn secondary" to="/teacher/session/1/analytics">View</Link></div>
          </div>
        </section>
      </div>
    </div>
  );
}
