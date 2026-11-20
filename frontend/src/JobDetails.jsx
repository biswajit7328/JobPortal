
function JobDetails({ job, onBack, onApply }) {
  if (!job) {
    return <p>Job details not available.</p>;
  }

  function formatJobType(type) {
    if (!type) return 'Not specified';

    return type
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getSalary() {
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

  return (
    <div className="job-details-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Browse Jobs
      </button>

      <div className="job-details-card">
        <div className="job-details-header">
          <div>
            <h1>{job.title}</h1>
            <h2>{job.company}</h2>
          </div>

          <span className="job-type-tag">
            {formatJobType(job.job_type)}
          </span>
        </div>

        <div className="job-details-info">
          <div>
            <strong>Location</strong>
            <p>📍 {job.location}</p>
          </div>

          <div>
            <strong>Salary</strong>
            <p>💰 {getSalary()}</p>
          </div>

          <div>
            <strong>Posted On</strong>
            <p>
              {job.created_at
                ? new Date(job.created_at).toLocaleDateString()
                : 'Not available'}
            </p>
          </div>

          <div>
            <strong>Application Deadline</strong>
            <p>{job.application_deadline || 'Not specified'}</p>
          </div>
        </div>

        <section>
          <h3>Job Description</h3>
          <p className="details-description">
            {job.description || 'No description provided.'}
          </p>
        </section>

        <section>
          <h3>Requirements</h3>
          <p className="details-description">
            {job.requirements || 'No specific requirements provided.'}
          </p>
        </section>

        <button
          className="apply-button"
          onClick={onApply}
        >
          Apply Now →
        </button>
      </div>
    </div>
  );
}

export default JobDetails;
