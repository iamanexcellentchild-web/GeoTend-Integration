import { Link } from 'react-router-dom';

const attendees = [
  { name: 'Tunde A.', status: 'Checked in', time: '08:14' },
  { name: 'Mariam O.', status: 'Pending', time: '08:15' },
  { name: 'Kola B.', status: 'Rejected', time: '08:16' },
];

export default function TeacherSessionLive() {
  return (
    <div className="page">
      <section className="card">
        <h2>Live session</h2>
        <p className="muted">Track attendance and manage the active room session.</p>
        <div className="list" style={{ marginTop: 16 }}>
          {attendees.map((person) => (
            <div className="list-item" key={person.name}>
              <div>
                <strong>{person.name}</strong>
                <div className="muted">{person.status}</div>
              </div>
              <span className="badge">{person.time}</span>
            </div>
          ))}
        </div>
        <div className="btn-row">
          <Link className="btn primary" to="/teacher/session/1/analytics">View analytics</Link>
          <button className="btn secondary" type="button">End session</button>
        </div>
      </section>
    </div>
  );
}
