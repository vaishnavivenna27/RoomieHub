import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import '../css/Announcements.css';

const Announcements = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingId(ann._id);
    setTitle(ann.title);
    setDescription(ann.description);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both title and description.');
      return;
    }

    try {
      setError('');
      if (editingId) {
        const res = await api.put(`/announcements/${editingId}`, {
          title: title.trim(),
          description: description.trim()
        });
        if (res.success) {
          setSuccess('Announcement updated successfully!');
          fetchAnnouncements();
          setIsModalOpen(false);
        }
      } else {
        const res = await api.post('/announcements', {
          title: title.trim(),
          description: description.trim()
        });
        if (res.success) {
          setSuccess('Announcement posted to the board!');
          fetchAnnouncements();
          setIsModalOpen(false);
        }
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error saving announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        const res = await api.delete(`/announcements/${id}`);
        if (res.success) {
          setAnnouncements(announcements.filter((a) => a._id !== id));
          setSuccess('Announcement removed.');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError(err.message || 'Failed to delete announcement');
      }
    }
  };

  if (loading) {
    return <Loading message="Loading announcement board..." />;
  }

  return (
    <div className="announcements-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Notice Board</h1>
          <p className="page-subtitle">Post updates, maintenance alerts, guest visits, and house reminders.</p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          + Post Announcement
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="announcements-grid">
        {announcements.map((ann) => {
          const isCreator = ann.createdBy?._id?.toString() === user?._id?.toString();

          return (
            <div key={ann._id} className="card announcement-card">
              <div className="announcement-card-header">
                <h2 className="announcement-card-title">{ann.title}</h2>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  {new Date(ann.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <p className="announcement-card-desc">{ann.description}</p>

              <div className="announcement-card-footer">
                <div className="announcement-author-info">
                  <div className="author-avatar">
                    {ann.createdBy?.name ? ann.createdBy.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>
                    Posted by <strong>{ann.createdBy?.name}</strong> {isCreator && '(You)'}
                  </span>
                </div>

                {isCreator && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {announcements.length === 0 && (
          <div className="card empty-state">
            <div className="empty-state-icon">📢</div>
            <h3>No announcements posted yet</h3>
            <p>Leave a note or reminder for your roommates above.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Edit Announcement' : 'Post a Notice to Roommates'}
              </h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="annTitle">Title</label>
                <input
                  type="text"
                  id="annTitle"
                  className="form-input"
                  placeholder="e.g. Landlord inspection this Thursday, Having friends over Saturday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="annDesc">Details</label>
                <textarea
                  id="annDesc"
                  className="form-textarea"
                  rows="4"
                  placeholder="Write the full message for your roommates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Notice' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
