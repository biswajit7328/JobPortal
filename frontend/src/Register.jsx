
import { useState } from 'react';

const API_URL = 'http://127.0.0.1:8000';

function Register({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'job_seeker',
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
      const response = await fetch(`${API_URL}/api/accounts/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

        throw new Error(errorMessage || 'Registration failed.');
      }

      setMessage('Registration successful! You can now log in.');

      setFormData({
        username: '',
        email: '',
        password: '',
        user_type: 'job_seeker',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>JobPortal</h1>
        <h2>Create Account</h2>
        <p>Join our Job Portal</p>

        {error && <p className="error">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter username"
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          required
        />

        <label>Account Type</label>
        <select
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
        >
          <option value="job_seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <p>Already have an account?</p>

        <button type="button" onClick={onBackToLogin}>
          Back to Login
        </button>
      </form>
    </div>
  );
}

export default Register;
