import { Link } from 'react-router-dom';

const history = [
  { course: 'CPE102', date: '12 Jul', status: 'Present' },
  { course: 'MTH201', date: '09 Jul', status: 'Present' },
  { course: 'ENG201', date: '05 Jul', status: 'Absent' },
];

export default function StudentHistory() {
  return (
    <div className="page">
      <section className="card">
        <h2>Attendance history</h2>
        <p className="muted">Review your attendance across courses and keep track of your record.</p>
        <div className="list" style={{ marginTop: 18 }}>
          {history.map((row) => (
            <div className="list-item" key={row.course + row.date}>
              <div>
                <strong>{row.course}</strong>
                <div className="muted">{row.date}</div>
              </div>
              <span className="badge">{row.status}</span>
            </div>
          ))}
        </div>
        <div className="btn-row">
          <Link className="btn primary" to="/student/dashboard">Back to dashboard</Link>
        </div>
      </section>
    </div>
  );
}
