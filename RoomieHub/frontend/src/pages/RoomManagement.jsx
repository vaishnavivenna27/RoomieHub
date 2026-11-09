import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import '../css/RoomManagement.css';

const RoomManagement = () => {
  const { user, room, setRoom, refreshRoom } = useAuth();

  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        await refreshRoom();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, []);

  const handleCopyCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      setError('Please provide a name for your room/apartment.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/rooms/create', { roomName: createName });
      if (res.success && res.room) {
        setRoom(res.room);
        setSuccess('Room created successfully! Share your room code with roommates.');
        setCreateName('');
      } else {
        setError(res.message || 'Failed to create room.');
      }
    } catch (err) {
      setError(err.message || 'Error creating room.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a 6-digit room code.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/rooms/join', { roomCode: joinCode });
      if (res.success && res.room) {
        setRoom(res.room);
        setSuccess('Joined room successfully!');
        setJoinCode('');
      } else {
        setError(res.message || 'Failed to join room.');
      }
    } catch (err) {
      setError(err.message || 'Room code is invalid or room not found.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading room details..." />;
  }

  return (
    <div className="room-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Management</h1>
          <p className="page-subtitle">Manage your shared apartment, invite roommates, or switch rooms.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Active Room Information Card */}
      {room && (
        <div className="card room-info-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-purple">ACTIVE APARTMENT</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.4rem' }}>
                {room.roomName}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Created on {new Date(room.createdAt).toLocaleDateString()} by <strong>{room.createdBy?.name || 'Roommate'}</strong>
              </p>
            </div>

            <div>
              <span className="badge badge-success">
                {room.members?.length} Member{(room.members?.length || 1) > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Room Code Share Box */}
          <div className="code-display-box">
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                SHAREABLE ROOM CODE
              </span>
              <div className="code-text">{room.roomCode}</div>
            </div>
            <button
              onClick={handleCopyCode}
              className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-primary'}`}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* List of Roommates */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '1.5rem 0 0.85rem' }}>
            Current Roommates
          </h3>
          <div className="roommates-list-container">
            {room.members?.map((member) => (
              <div key={member._id} className="roommate-row">
                <div className="roommate-meta">
                  <div className="roommate-avatar">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="roommate-name">{member.name} {member._id === user?._id && '(You)'}</div>
                    <div className="roommate-email">{member.email}</div>
                  </div>
                </div>

                <div>
                  {member._id === room.createdBy?._id || member._id === room.createdBy ? (
                    <span className="badge badge-purple">Admin / Creator</span>
                  ) : (
                    <span className="badge badge-secondary" style={{ background: '#F0EDF9', color: '#6B687E' }}>Roommate</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Cards Grid: Create New Room & Join Room */}
      <div className="room-actions-grid">
        {/* Create Room */}
        <div className="card room-card-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✨</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Create a New Room</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Set up a new shared home and generate a unique code.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateRoom}>
            <div className="form-group">
              <label className="form-label" htmlFor="roomName">Apartment / Room Name</label>
              <input
                type="text"
                id="roomName"
                className="form-input"
                placeholder="e.g. Cozy Corner #302, Sunset Villa"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Creating Room...' : 'Create Room'}
            </button>
          </form>
        </div>

        {/* Join Room */}
        <div className="card room-card-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔑</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Join with Code</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Have a code from your roommate? Enter it below.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <label className="form-label" htmlFor="roomCode">6-Digit Room Code</label>
              <input
                type="text"
                id="roomCode"
                className="form-input"
                placeholder="e.g. RM8K9P"
                maxLength="6"
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Joining Room...' : 'Join Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
