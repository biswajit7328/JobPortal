
import { useEffect, useState } from 'react';
import JobDetails from './JobDetails';

const API_URL = 'http://127.0.0.1:8000';

function BrowseJobs({ token, onApplicationSubmitted }) {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState('');
  const [savingJobId, setSavingJobId] = useState(null);

  // Load available jobs
  async function loadJobs() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (jobType) params.append('job_type', jobType);

      const response = await fetch(
        `${API_URL}/api/jobs/?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Unable to load jobs.');
      }

      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load saved jobs
  async function loadSavedJobs() {
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
      console.error('Saved jobs:', err.message);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (token) {
      loadSavedJobs();
    }
  }, [token]);

  function handleSearch(e) {
    e.preventDefault();
    loadJobs();
  }

  // Check whether a job is saved
  function getSavedJob(jobId) {
    return savedJobs.find(
      (saved) => Number(saved.job) === Number(jobId)
    );
  }

  // Save or remove a saved job
  async function handleSaveJob(job) {
    setError('');
    setMessage('');
    setSavingJobId(job.id);

    try {
      const savedJob = getSavedJob(job.id);

      let response;

      if (savedJob) {
        response = await fetch(
          `${API_URL}/api/jobs/saved/${savedJob.id}/`,
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
          previous.filter((item) => item.id !== savedJob.id)
        );

        setMessage('Job removed from saved jobs.');
      } else {
        response = await fetch(`${API_URL}/api/jobs/saved/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ job: job.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Unable to save job.');
        }

        setSavedJobs((previous) => [...previous, data]);
        setMessage('Job saved successfully!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingJobId(null);
    }
  }

  // Submit job application
  async function handleApply(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('job', selectedJob.id);
    formData.append('cover_letter', coverLetter);

    if (resume) {
      formData.append('resume', resume);
    }

    try {
      const response = await fetch(`${API_URL}/api/applications/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.non_field_errors?.[0] ||
          data.resume?.[0] ||
          data.job?.[0] ||
          'Application failed.'
        );
      }

      setMessage('Application submitted successfully!');
      setSelectedJob(null);
      setCoverLetter('');
      setResume(null);

      await onApplicationSubmitted();
    } catch (err) {
      setError(err.message);
    }
  }

  // Format job type
  function formatJobType(type) {
    if (!type) return 'Not specified';

    return type
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // Format salary
  function getSalary(job) {
    if (job.salary) return job.salary;

    if (job.min_salary && job.max_salary) {
      return `₹${job.min_salary.toLocaleString('en-IN')} - ₹${job.max_salary.toLocaleString('en-IN')}`;
    }

    if (job.min_salary) {
      return `From ₹${job.min_salary.toLocaleString('en-IN')}`;
    }

    if (job.max_salary) {
      return `Up to ₹${job.max_salary.toLocaleString('en-IN')}`;
    }

    return 'Salary not specified';
  }

  // Company initials
  function getInitials(company) {
    return (company || 'Company')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  // Show job details when a job is selected
  if (viewingJob) {
    return (
      <JobDetails
        job={viewingJob}
        onBack={() => setViewingJob(null)}
        onApply={() => {
          setSelectedJob(viewingJob);
          setViewingJob(null);
        }}
      />
    );
  }

  return (
    <div className="browse-jobs">
      <div className="jobs-header">
        <div>
          <h1>Find Your Dream Job</h1>
          <p>
            Explore opportunities and take the next step in your career.
          </p>
        </div>

        <div className="jobs-count">
          {jobs.length} Jobs Found
        </div>
      </div>

      {/* Search and filters */}
      <form className="job-search" onSubmit={handleSearch}>
        <input
          placeholder="Search job title or company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="">All Job Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>

        <button type="submit">Search Jobs</button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading jobs...</p>}

      {/* Job listings */}
      <div className="job-list">
        {jobs.map((job) => {
          const isSaved = Boolean(getSavedJob(job.id));

          return (
            <div className="job-card" key={job.id}>
              <div className="job-card-header">
                <div className="company-avatar">
                  {getInitials(job.company)}
                </div>

                <button
                  type="button"
                  className={`save-job-button ${isSaved ? 'saved' : ''}`}
                  onClick={() => handleSaveJob(job)}
                  disabled={savingJobId === job.id}
                  title={isSaved ? 'Remove saved job' : 'Save job'}
                >
                  {savingJobId === job.id
                    ? 'Saving...'
                    : isSaved
                      ? '♥ Saved'
                      : '♡ Save'}
                </button>
              </div>

              <h2>{job.title}</h2>
              <h3>{job.company}</h3>

              <div className="job-tags">
                <span className="job-type-tag">
                  {formatJobType(job.job_type)}
                </span>

                <span className="location-tag">
                  📍 {job.location}
                </span>
              </div>

              <div className="salary-badge">
                💰 {getSalary(job)}
              </div>

              <p className="job-description">
                {job.description}
              </p>

              {job.application_deadline && (
                <p className="job-deadline">
                  📅 Apply before: {job.application_deadline}
                </p>
              )}

              {selectedJob?.id === job.id ? (
                <form className="application-form" onSubmit={handleApply}>
                  <label>Cover Letter</label>

                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write your cover letter..."
                    rows="5"
                  />

                  <label>Upload Resume (PDF or DOCX)</label>

                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      setResume(e.target.files[0] || null)
                    }
                  />

                  <button type="submit">
                    Submit Application
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(null);
                      setResume(null);
                      setCoverLetter('');
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="job-card-actions">
                  <button
                    type="button"
                    className="view-details-button"
                    onClick={() => setViewingJob(job)}
                  >
                    View Details
                  </button>

                  <button
                    className="apply-button"
                    onClick={() => {
                      setSelectedJob(job);
                      setError('');
                      setMessage('');
                    }}
                  >
                    Apply Now →
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!loading && jobs.length === 0 && !error && (
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>Try changing your search or location.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseJobs;
