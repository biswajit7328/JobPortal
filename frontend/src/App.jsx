
import { useState } from 'react';
import Profile from './Profile';
import BrowseJobs from './BrowseJobs';
import SavedJobs from './SavedJobs';
import Register from './Register';
import RecruiterDashboard from './RecruiterDashboard';
import PostJob from './PostJob';
import RecruiterApplications from './RecruiterApplications';
import './App.css';

const API_URL = 'https://jobportal-backend-s3ik.onrender.com';

function App() {
  // Read Reset Password URL
  const pathParts = window.location.pathname.split('/');

  const isResetPasswordPage =
    pathParts[1] === 'reset-password';

  const resetUid = pathParts[2];
  const resetToken = pathParts[3];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [userType, setUserType] = useState('');
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  // Reset Password states
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Admin states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Load admin users
  async function loadAdminUsers(accessToken) {
    setUsersLoading(true);
    setUsersError('');

    try {
      const response = await fetch(
        `${API_URL}/api/accounts/admin/users/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load users.');
      }

      setAdminUsers(data);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }

  // Activate or deactivate a user
  async function handleToggleUserStatus(user) {
    const newStatus = !user.is_active;

    setUsersError('');
    setUpdatingUserId(user.id);

    try {
      const response = await fetch(
        `${API_URL}/api/accounts/admin/users/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            is_active: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.detail || 'Could not update user status.'
        );
      }

      setAdminUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? { ...currentUser, is_active: newStatus }
            : currentUser
        )
      );
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  }

  // Normal user login
  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed.');
      }

      await loadApplications(data.access);
      await loadUserProfile(data.access);

      setToken(data.access);
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Forgot Password
  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotMessage('');
    setForgotLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/accounts/forgot-password/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: forgotEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setForgotMessage(data.message);
    } catch (err) {
      setForgotMessage(err.message);
    } finally {
      setForgotLoading(false);
    }
  }

// Reset Password
async function handleResetPassword(e, uid, resetToken) {
  e.preventDefault();
  setResetMessage('');
  setResetLoading(true);

  try {
    const response = await fetch(
      `${API_URL}/api/accounts/reset-password/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          token: resetToken,
          new_password: newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.error)
          ? data.error.join(', ')
          : data.error || 'Password reset failed.'
      );
    }

    setResetMessage(data.message);
    setNewPassword('');
  } catch (err) {
    setResetMessage(err.message);
  } finally {
    setResetLoading(false);
  }
}


  // Admin login
  async function handleAdminLogin(e) {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/accounts/admin/login/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: adminUsername,
            password: adminPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Admin login failed.');
      }

      const statsResponse = await fetch(
        `${API_URL}/api/accounts/admin/dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        }
      );

      const statsData = await statsResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsData.detail || 'Could not load admin dashboard.'
        );
      }

      setAdminStats(statsData);
      setAdminToken(data.access);

      await loadAdminUsers(data.access);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  }

  // Search and filter admin users
  const filteredAdminUsers = adminUsers.filter((user) => {
    const search = userSearch.toLowerCase();

    return (
      (user.username || '').toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.user_type || '').toLowerCase().includes(search)
    );
  });

  // Load applications
  async function loadApplications(accessToken) {
    const response = await fetch(`${API_URL}/api/applications/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Could not load applications.');
    }

    setApplications(
      Array.isArray(data) ? data : data.results || []
    );
  }

  // Load user profile
  async function loadUserProfile(accessToken) {
    const response = await fetch(`${API_URL}/api/accounts/profile/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Could not load user profile.');
    }

    setUserType(data.user_type);
  }

  // User logout
  function handleLogout() {
    setToken('');
    setUserType('');
    setApplications([]);
    setUsername('');
    setPassword('');
    setActivePage('dashboard');
    setShowRegister(false);
    setShowForgotPassword(false);
    setForgotMessage('');
    setError('');
  }

  // Admin logout
  function handleAdminLogout() {
    setAdminToken('');
    setAdminUsername('');
    setAdminPassword('');
    setAdminError('');
    setAdminStats(null);
    setAdminUsers([]);
    setUserSearch('');
    setUsersError('');
    setUpdatingUserId(null);
    setShowAdminLogin(false);
  }

  const countStatus = (status) =>
    applications.filter((app) => app.status === status).length;

  // Admin dashboard
  if (adminToken) {
    return (
      <div className="dashboard">
        <aside className="sidebar">
          <h2 className="logo">Admin Panel</h2>

          <nav>
            <a className="active" href="#admin-dashboard">
              Dashboard
            </a>
          </nav>

          <div className="sidebar-bottom">
            <p>{adminUsername}</p>
            <p>Administrator</p>
            <button onClick={handleAdminLogout}>Logout</button>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Welcome to your JobPortal administration panel.</p>
            </div>
          </header>

          <section className="stats">
            <div className="stat-card">
              <p>Total Users</p>
              <h2>{adminStats?.total_users ?? 0}</h2>
            </div>

            <div className="stat-card">
              <p>Total Recruiters</p>
              <h2>{adminStats?.total_recruiters ?? 0}</h2>
            </div>

            <div className="stat-card">
              <p>Total Job Seekers</p>
              <h2>{adminStats?.total_job_seekers ?? 0}</h2>
            </div>

            <div className="stat-card">
              <p>Total Jobs</p>
              <h2>{adminStats?.total_jobs ?? 0}</h2>
            </div>

            <div className="stat-card">
              <p>Active Jobs</p>
              <h2>{adminStats?.active_jobs ?? 0}</h2>
            </div>

            <div className="stat-card">
              <p>Total Applications</p>
              <h2>{adminStats?.total_applications ?? 0}</h2>
            </div>

            <div className="stat-card">
              <p>Pending Applications</p>
              <h2>{adminStats?.pending_applications ?? 0}</h2>
            </div>
          </section>

          {/* User Management */}
          <section className="applications" id="admin-users">
            <div className="section-heading">
              <h2>User Management</h2>
            </div>

            <input
              type="text"
              placeholder="Search by username, email, or user type..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />

            {usersError && (
              <p className="error">{usersError}</p>
            )}

            {usersLoading ? (
              <p>Loading users...</p>
            ) : filteredAdminUsers.length === 0 ? (
              <p>No matching users found.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>User Type</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAdminUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>{user.user_type}</td>

                        <td>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </td>

                        <td>
                          {new Date(user.date_joined).toLocaleDateString()}
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              user.is_active
                                ? 'deactivate-btn'
                                : 'activate-btn'
                            }
                            disabled={updatingUserId === user.id}
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {updatingUserId === user.id
                              ? 'Updating...'
                              : user.is_active
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }



  // Reset Password screen
  if (isResetPasswordPage) {
    return (
      <div className="login-container">
        <form
          className="login-card"
          onSubmit={(e) =>
            handleResetPassword(e, resetUid, resetToken)
          }
        >
          <h1>JobPortal</h1>
          <h2>Reset Password</h2>
          <p>Enter your new password below.</p>

          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          {resetMessage && (
            <p className="success-message">{resetMessage}</p>
          )}

          <button type="submit" disabled={resetLoading}>
            {resetLoading ? 'Updating...' : 'Reset Password'}
          </button>

          {resetMessage === 'Password reset successfully' && (
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Back to Login
            </button>
          )}
        </form>
      </div>
    );
  }

  // Login and registration pages
  if (!token) {

    // Forgot Password screen
    if (showForgotPassword) {
      return (
        <div className="login-container">
          <form className="login-card" onSubmit={handleForgotPassword}>
            <h1>JobPortal</h1>
            <h2>Forgot Password?</h2>
            <p>
              Enter your registered email to receive a password reset link.
            </p>

            <label>Email Address</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />

            {forgotMessage && (
              <p className="success-message">{forgotMessage}</p>
            )}

            <button type="submit" disabled={forgotLoading}>
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotMessage('');
              }}
            >
              Back to Login
            </button>
          </form>
        </div>
      );
    }

    // Admin login screen
    if (showAdminLogin) {
      return (
        <div className="login-container">
          <form className="login-card" onSubmit={handleAdminLogin}>
            <h1>JobPortal</h1>
            <h2>Admin Login</h2>
            <p>Sign in to access the administration panel.</p>

            <label>Admin Username</label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Enter admin username"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />

            {adminError && (
              <p className="error">{adminError}</p>
            )}

            <button type="submit" disabled={adminLoading}>
              {adminLoading ? 'Logging in...' : 'Admin Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAdminLogin(false);
                setAdminError('');
              }}
            >
              Back to User Login
            </button>
          </form>
        </div>
      );
    }

    // Registration screen
    if (showRegister) {
      return (
        <Register
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }

    // Normal user login screen
    return (
      <div className="login-container">
        <form className="login-card" onSubmit={handleLogin}>
          <h1>JobPortal</h1>
          <h2>Welcome Back!</h2>
          <p>Login to view your job applications.</p>

          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Forgot Password button */}
          <button
            type="button"
            onClick={() => {
              setForgotEmail('');
              setForgotMessage('');
              setShowForgotPassword(true);
            }}
          >
            Forgot Password?
          </button>

          <p>Don't have an account?</p>

          <button
            type="button"
            onClick={() => {
              setError('');
              setShowRegister(true);
            }}
          >
            Create New Account
          </button>

          <button
            type="button"
            onClick={() => {
              setError('');
              setShowAdminLogin(true);
            }}
          >
            Admin Login
          </button>
        </form>
      </div>
    );
  }

  // Normal user dashboard
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">JobPortal</h2>

        <nav>
          {userType === 'recruiter' ? (
            <>
              <a
                href="#dashboard"
                className={activePage === 'dashboard' ? 'active' : ''}
                onClick={() => setActivePage('dashboard')}
              >
                Dashboard
              </a>

              <a
                href="#post-job"
                className={activePage === 'post-job' ? 'active' : ''}
                onClick={() => setActivePage('post-job')}
              >
                Post a Job
              </a>

              <a
                href="#my-jobs"
                className={activePage === 'my-jobs' ? 'active' : ''}
                onClick={() => setActivePage('my-jobs')}
              >
                My Posted Jobs
              </a>

              <a
                href="#applications-received"
                className={
                  activePage === 'recruiter-applications' ? 'active' : ''
                }
                onClick={() => setActivePage('recruiter-applications')}
              >
                Applications Received
              </a>

              <a
                href="#profile"
                className={activePage === 'profile' ? 'active' : ''}
                onClick={() => setActivePage('profile')}
              >
                My Profile
              </a>
            </>
          ) : (
            <>
              <a
                href="#dashboard"
                className={activePage === 'dashboard' ? 'active' : ''}
                onClick={() => setActivePage('dashboard')}
              >
                Dashboard
              </a>

              <a
                href="#applications"
                className={activePage === 'applications' ? 'active' : ''}
                onClick={() => setActivePage('applications')}
              >
                My Applications
              </a>

              <a
                href="#browse-jobs"
                className={activePage === 'browse-jobs' ? 'active' : ''}
                onClick={() => setActivePage('browse-jobs')}
              >
                Browse Jobs
              </a>

              <a
                href="#saved-jobs"
                className={activePage === 'saved-jobs' ? 'active' : ''}
                onClick={() => setActivePage('saved-jobs')}
              >
                Saved Jobs
              </a>

              <a
                href="#profile"
                className={activePage === 'profile' ? 'active' : ''}
                onClick={() => setActivePage('profile')}
              >
                My Profile
              </a>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <p>{username}</p>

          <p>
            {userType === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
          </p>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        {userType === 'recruiter' ? (
          activePage === 'profile' ? (
            <Profile token={token} />
          ) : activePage === 'post-job' ? (
            <PostJob
              token={token}
              onJobPosted={() => setActivePage('dashboard')}
            />
          ) : activePage === 'recruiter-applications' ? (
            <RecruiterApplications token={token} />
          ) : (
            <RecruiterDashboard
              token={token}
              onProfile={() => setActivePage('profile')}
            />
          )
        ) : activePage === 'profile' ? (
          <Profile token={token} />
        ) : activePage === 'browse-jobs' ? (
          <BrowseJobs
            token={token}
            onApplicationSubmitted={() => loadApplications(token)}
          />
        ) : activePage === 'saved-jobs' ? (
          <SavedJobs
            token={token}
            onBrowseJobs={() => setActivePage('browse-jobs')}
          />
        ) : activePage === 'applications' ? (
          <section className="applications-page">
            <div className="applications-header">
              <div>
                <h1>My Applications</h1>
                <p>Track and manage your job applications.</p>
              </div>

              <div className="applications-count">
                {applications.length} Applications
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <h3>No applications yet</h3>
                <p>Your submitted job applications will appear here.</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div className="application-card" key={app.id}>
                    <div className="application-card-header">
                      <div>
                        <h2>{app.job_title}</h2>
                        <h3>{app.company || 'Company not available'}</h3>
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
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <header className="topbar">
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back! Here's your job search overview.</p>
              </div>

              <div className="user-info">{username}</div>
            </header>

            <section className="stats">
              <div className="stat-card">
                <p>Total Applications</p>
                <h2>{applications.length}</h2>
              </div>

              <div className="stat-card">
                <p>Pending</p>
                <h2>{countStatus('pending')}</h2>
              </div>

              <div className="stat-card">
                <p>Shortlisted</p>
                <h2>{countStatus('shortlisted')}</h2>
              </div>

              <div className="stat-card">
                <p>Accepted</p>
                <h2>{countStatus('accepted')}</h2>
              </div>

              <div className="stat-card">
                <p>Rejected</p>
                <h2>{countStatus('rejected')}</h2>
              </div>
            </section>

            <section className="applications" id="applications">
              <div className="section-heading">
                <h2>My Applications</h2>
              </div>

              {applications.length === 0 ? (
                <div className="empty-state">
                  <h3>No applications yet</h3>
                  <p>Your submitted job applications will appear here.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Status</th>
                        <th>Applied Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>{app.job_title}</td>
                          <td>
                            <span className={`status ${app.status}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {new Date(app.applied_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
