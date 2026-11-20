
import { useEffect, useState } from 'react';

const API_URL = 'https://jobportal-backend-s3ik.onrender.com';

function Profile({ token }) {
  const [profile, setProfile] = useState({
    user: '',
    user_type: '',
    full_name: '',
    phone: '',
    address: '',
    profile_picture: '',
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Load profile information
  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/accounts/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load profile.');
      }

      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [token]);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Select profile picture
  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      return;
    }

    setError('');
    setMessage('');
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  // Upload profile picture
  async function handleImageUpload() {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('profile_picture', selectedImage);

      const response = await fetch(`${API_URL}/api/accounts/profile/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.profile_picture?.[0] ||
          data.detail ||
          'Unable to upload profile picture.'
        );
      }

      setProfile(data);
      setSelectedImage(null);
      setPreviewImage('');
      setMessage('Profile picture uploaded successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  // Save profile information
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/accounts/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to update profile.');
      }

      setProfile(data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  const imageUrl = previewImage || profile.profile_picture;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>View and update your personal information.</p>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="profile-card">
        <div className="profile-identity">
          <div className="profile-avatar">
            {imageUrl ? (
              <img
                src={
                  imageUrl.startsWith('http')
                    ? imageUrl
                    : `${API_URL}${imageUrl}`
                }
                alt="Profile"
              />
            ) : (
              profile.full_name
                ? profile.full_name.charAt(0).toUpperCase()
                : 'U'
            )}
          </div>

          <div className="profile-identity-info">
            <h2>{profile.full_name || 'Your Name'}</h2>

            <span className="profile-role">
              {profile.user_type === 'job_seeker'
                ? '✓ Job Seeker'
                : '✓ Recruiter'}
            </span>

            <p>Manage your personal information</p>
          </div>
        </div>

        <div className="profile-picture-upload">
          <h3>Profile Picture</h3>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {selectedImage && (
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Profile Picture'}
            </button>
          )}
        </div>

        <div className="profile-form-heading">
          <h3>Personal Information</h3>
          <p>Update your contact details below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name || ''}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          <label>Address</label>
          <textarea
            name="address"
            value={profile.address || ''}
            onChange={handleChange}
            placeholder="Enter your address"
            rows="4"
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
