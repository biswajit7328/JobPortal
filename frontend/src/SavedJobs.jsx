
import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000';

function SavedJobs({ token, onBrowseJobs }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadSavedJobs() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/jobs/saved/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load saved jobs.');
      }

      setSavedJobs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSavedJobs();
  }, [token]);

  async function handleRemove(savedJobId) {
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_URL}/api/jobs/saved/${savedJobId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Unable to remove saved job.');
      }

      setSavedJobs((previous) =>
        previous.filter((job) => job.id !== savedJobId)
      );

      setMessage('Job removed from saved jobs.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="browse-jobs">
      <div className="jobs-header">
        <div>
          <h1>My Saved Jobs</h1>
          <p>All the jobs you have saved for later.</p>
        </div>

        <div className="jobs-count">
          {savedJobs.length} Saved Jobs
        </div>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading saved jobs...</p>}

      {!loading && savedJobs.length === 0 && !error && (
        <div className="empty-state">
          <h3>No saved jobs yet</h3>
          <p>Save jobs from Browse Jobs and they will appear here.</p>

          <button onClick={onBrowseJobs}>
            Browse Jobs
          </button>
        </div>
      )}

      <div className="job-list">
        {savedJobs.map((saved) => (
          <div className="job-card" key={saved.id}>
            <h2>{saved.job_title}</h2>
            <h3>{saved.company}</h3>

            <div className="job-tags">
              <span className="job-type-tag">
                {saved.job_type?.replaceAll('_', ' ')}
              </span>

              <span className="location-tag">
                📍 {saved.location}
              </span>
            </div>

            {saved.salary && (
              <div className="salary-badge">
                💰 {saved.salary}
              </div>
            )}

            <button
              className="save-job-button"
              onClick={() => handleRemove(saved.id)}
            >
              ♥ Remove Saved Job
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedJobs;
