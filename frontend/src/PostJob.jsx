
import { useState } from 'react';

const API_URL = 'https://jobportal-backend-s3ik.onrender.com';

function PostJob({ token, onJobPosted }) {
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

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        min_salary: formData.min_salary
          ? Number(formData.min_salary)
          : null,
        max_salary: formData.max_salary
          ? Number(formData.max_salary)
          : null,
        application_deadline: formData.application_deadline || null,
      };

      const response = await fetch(`${API_URL}/api/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = Object.entries(data)
          .map(([field, errors]) => {
            const details = Array.isArray(errors)
              ? errors.join(' ')
              : String(errors);

            return `${field}: ${details}`;
          })
          .join(' ');

        throw new Error(errorMessage || 'Unable to post job.');
      }

      setMessage('Job posted successfully!');

      setFormData({
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

      if (onJobPosted) {
        onJobPosted();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="applications-page">
      <div className="applications-header">
        <div>
          <h1>Post a Job</h1>
          <p>Create a new job opening for candidates.</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <label>Job Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Django Developer"
          required
        />

        <label>Company Name</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Enter company name"
          required
        />

        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Bhubaneswar"
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

        <label>Salary (Display Text)</label>
        <input
          type="text"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="e.g. ₹15,000 - ₹25,000"
        />

        <label>Minimum Salary (Number)</label>
        <input
          type="number"
          name="min_salary"
          value={formData.min_salary}
          onChange={handleChange}
          placeholder="e.g. 15000"
          min="0"
        />

        <label>Maximum Salary (Number)</label>
        <input
          type="number"
          name="max_salary"
          value={formData.max_salary}
          onChange={handleChange}
          placeholder="e.g. 25000"
          min="0"
        />

        <label>Job Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the job role..."
          rows="5"
          required
        />

        <label>Requirements</label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          placeholder="Enter required skills and experience..."
          rows="4"
        />

        <label>Application Deadline (DD/MM/YYYY)</label>

<input
  type="date"
  name="application_deadline"
  value={formData.application_deadline}
  onChange={handleChange}
  placeholder="DD/MM/YYYY"
  style={{
    width: '100%',
    padding: '13px',
    background: '#ffffff',
    color: '#312e81',
    border: '2px solid #a78bfa',
    borderRadius: '9px',
    fontSize: '15px',
    colorScheme: 'light'
  }}
/>

<small style={{ color: '#7c3aed' }}>
  Select your application deadline from the calendar.
</small>

        <button type="submit" disabled={loading}>
          {loading ? 'Posting Job...' : 'Publish Job'}
        </button>
      </form>
    </section>
  );
}

export default PostJob;
