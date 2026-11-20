
import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000';

function RecruiterDashboard({ token, onProfile }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationsError, setApplicationsError] = useState('');
  const [message, setMessage] = useState('');

  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'full_time',
    salary: '',
    min_salary: '',
    max_salary: '',
    description: '',
    requirements: '',
    application_deadline: '',
  });

  async function loadJobs() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/jobs/recruiter/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load jobs.');
      }

      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    setApplicationsError('');

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
        throw new Error(data.detail || 'Unable to load applications.');
      }

      setApplications(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      setApplicationsError(err.message);
    }
  }

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, [token]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEdit(job) {
    setEditingJob(job);

    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      job_type: job.job_type || 'full_time',
      salary: job.salary || '',
      min_salary: job.min_salary ?? '',
      max_salary: job.max_salary ?? '',
      description: job.description || '',
      requirements: job.requirements || '',
      application_deadline: job.application_deadline || '',
    });

    setError('');
    setMessage('');
  }

  async function handleUpdate(e) {
    e.preventDefault();

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...formData,
        min_salary: formData.min_salary === ''
          ? null
          : Number(formData.min_salary),
        max_salary: formData.max_salary === ''
          ? null
          : Number(formData.max_salary),
        application_deadline: formData.application_deadline || null,
      };

      const response = await fetch(
        `${API_URL}/api/jobs/${editingJob.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const details = Object.entries(data)
          .map(([field, errors]) => {
            const value = Array.isArray(errors)
              ? errors.join(' ')
              : String(errors);

            return `${field}: ${value}`;
          })
          .join(' ');

        throw new Error(details || 'Unable to update job.');
      }

      setMessage('Job updated successfully!');
      setEditingJob(null);
      await loadJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function askDelete(job) {
    setJobToDelete(job);
    setShowDeleteConfirm(true);
    setError('');
    setMessage('');
  }

  async function handleDelete() {
    if (!jobToDelete) return;

    setDeleting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_URL}/api/jobs/${jobToDelete.id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Unable to delete job.');
      }

      setMessage('Job deleted successfully!');
      setShowDeleteConfirm(false);
      setJobToDelete(null);

      await loadJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleJobStatus(job) {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/jobs/${job.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: !job.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to update job status.');
      }

      setMessage('Job status updated successfully!');
      await loadJobs();
    } catch (err) {
      setError(err.message);
    }
  }

  const shortlistedCount = applications.filter(
    (app) => app.status === 'shortlisted'
  ).length;

  return (
    <div className="recruiter-dashboard">

      <div className="jobs-header">
        <div>
          <h1>Recruiter Dashboard</h1>
          <p>Manage your job postings and applicants.</p>
        </div>
      </div>

      <section className="stats">
        <div className="stat-card">
          <p>Total Posted Jobs</p>
          <h2>{jobs.length}</h2>
        </div>

        <div className="stat-card">
          <p>Active Jobs</p>
          <h2>{jobs.filter((job) => job.is_active).length}</h2>
        </div>

        <div className="stat-card">
          <p>Total Applications</p>
          <h2>{applicationsError ? '—' : applications.length}</h2>
        </div>

        <div className="stat-card">
          <p>Shortlisted Candidates</p>
          <h2>{applicationsError ? '—' : shortlistedCount}</h2>
        </div>
      </section>

      {error && <p className="error">{error}</p>}
      {applicationsError && (
        <p className="error">{applicationsError}</p>
      )}
      {message && <p className="success-message">{message}</p>}

      {editingJob && (
        <section className="applications-page">
          <div className="applications-header">
            <div>
              <h1>Edit Job</h1>
              <p>Update your job posting details.</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleUpdate}>
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label>Company Name</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />

            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <label>Job Type</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>

            <label>Salary</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
            />

            <label>Minimum Salary</label>
            <input
              type="number"
              name="min_salary"
              value={formData.min_salary}
              onChange={handleChange}
              min="0"
            />

            <label>Maximum Salary</label>
            <input
              type="number"
              name="max_salary"
              value={formData.max_salary}
              onChange={handleChange}
              min="0"
            />

            <label>Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />

            <label>Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
            />

            <label>Application Deadline</label>
            <input
              type="date"
              name="application_deadline"
              value={formData.application_deadline || ''}
              onChange={handleChange}
            />

            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => setEditingJob(null)}
            >
              Cancel
            </button>
          </form>
        </section>
      )}

      <section className="applications">
        <div className="section-heading">
          <h2>My Posted Jobs</h2>
        </div>

        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <h3>No jobs posted yet</h3>
            <p>Your posted jobs will appear here.</p>
          </div>
        ) : (
          <div className="job-list">
            {jobs.map((job) => (
              <div className="job-card" key={job.id}>
                <h2>{job.title}</h2>
                <h3>{job.company}</h3>

                <div className="job-info">
                  <p>📍 <strong>Location:</strong> {job.location}</p>
                  <p>💰 <strong>Salary:</strong> {job.salary || 'Not specified'}</p>
                  <p>
                    📅 <strong>Posted:</strong>{' '}
                    {new Date(job.created_at).toLocaleDateString('en-IN')}
                  </p>
                  <p>🆔 <strong>Job ID:</strong> #{job.id}</p>
                </div>

                <p className="job-status">
                  <span className={job.is_active ? 'active-badge' : 'inactive-badge'}>
                    {job.is_active ? '● Active' : '● Inactive'}
                  </span>
                </p>

                <div className="job-actions">
                  <button onClick={() => handleEdit(job)}>
                    Edit Job
                  </button>

                  <button onClick={() => askDelete(job)}>
                    Delete Job
                  </button>

                  <button onClick={() => toggleJobStatus(job)}>
                    {job.is_active ? 'Deactivate Job' : 'Activate Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button onClick={onProfile}>
        My Profile
      </button>

      {showDeleteConfirm && jobToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">

            <div className="delete-modal-icon">
              !
            </div>

            <h2>Delete Job?</h2>

            <p>
              Are you sure you want to delete
              <strong> {jobToDelete.title} </strong>?
            </p>

            <p className="delete-warning">
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                className="cancel-delete-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default RecruiterDashboard;
