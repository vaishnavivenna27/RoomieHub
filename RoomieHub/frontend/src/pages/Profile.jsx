import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../css/Profile.css';

const Profile = () => {
  const { user, room, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await api.put('/auth/profile', { name: name.trim() });
      if (res.success && res.user) {
        updateUser(res.user);
        setProfileSuccess('Profile details updated successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setChangingPass(true);
    setPassError('');
    setPassSuccess('');

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPassSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPassSuccess(''), 3000);
      }
    } catch (err) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile & Settings</h1>
          <p className="page-subtitle">Manage your account information, security, and room membership.</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Left: User Card */}
        <div className="card profile-overview-card">
          <div className="big-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
          </div>

          <div className="profile-details-list">
            <div className="detail-row">
              <span className="detail-label">Current Room:</span>
              <span className="detail-val">{room?.roomName || 'Not in a room'}</span>
            </div>

            {room && (
              <div className="detail-row">
                <span className="detail-label">Room Code:</span>
                <span className="detail-val" style={{ color: 'var(--primary)' }}>#{room.roomCode}</span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">Role:</span>
              <span className="detail-val">
                {room?.createdBy?._id === user?._id || room?.createdBy === user?._id
                  ? 'Apartment Creator'
                  : 'Roommate'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '1rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            Log Out of RoomieHub
          </button>
        </div>

        {/* Right: Forms Column */}
        <div className="profile-forms-column">
          {/* Edit Profile */}
          <div className="card profile-form-card">
            <h2>Personal Information</h2>
            {profileError && <div className="alert alert-error">{profileError}</div>}
            {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label" htmlFor="profileName">Full Name</label>
                <input
                  type="text"
                  id="profileName"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-Only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: 'var(--bg-light)', cursor: 'not-allowed' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card profile-form-card">
            <h2>Security & Password</h2>
            {passError && <div className="alert alert-error">{passError}</div>}
            {passSuccess && <div className="alert alert-success">{passSuccess}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="currentPass">Current Password</label>
                <input
                  type="password"
                  id="currentPass"
                  className="form-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="newPass">New Password</label>
                  <input
                    type="password"
                    id="newPass"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPass">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPass"
                    className="form-input"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={changingPass}
              >
                {changingPass ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
