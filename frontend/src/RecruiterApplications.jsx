
import { useEffect, useState } from 'react';

const API_URL = 'https://jobportal-backend-s3ik.onrender.com';

function RecruiterApplications({ token }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadApplications() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/applications/recruiter/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load applications.'
        );
      }

      setApplications(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(applicationId, status) {
    try {
      const response = await fetch(
        `${API_URL}/api/applications/recruiter/${applicationId}/status/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to update status.'
        );
      }

      await loadApplications();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [token]);

  return (
    <section className="applications-page">
      <div className="applications-header">
        <div>
          <h1>Applications Received</h1>
          <p>Review candidates who applied for your jobs.</p>
        </div>

        <div className="applications-count">
          {applications.length} Applications
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications received yet</h3>
          <p>Applications for your posted jobs will appear here.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => (
            <div className="application-card" key={app.id}>
              <div className="application-card-header">
                <div>
                  <h2>{app.job_title}</h2>
                  <h3>
                    Candidate: {app.applicant_username || 'Candidate'}
                  </h3>
                </div>

                <span className={`status ${app.status}`}>
                  {app.status}
                </span>
              </div>

              <div className="application-meta">
                <p>
                  <strong>Applied On:</strong>{' '}
                  {new Date(app.applied_at).toLocaleDateString()}
                </p>

                <p>
                  <strong>Application ID:</strong> #{app.id}
                </p>
              </div>

              {app.resume && (
                <a
                  className="resume-link"
                  href={`${API_URL}${app.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resume ↗
                </a>
              )}

              <div className="status-actions">
                <label>Update Status</label>

                <select
                  value={app.status}
                  onChange={(e) =>
                    updateStatus(app.id, e.target.value)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecruiterApplications;
