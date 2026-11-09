import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import '../css/Chores.css';

const Chores = () => {
  const { user, room } = useAuth();

  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchChores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chores');
      if (res.success) {
        setChores(res.chores || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load chores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChores();
  }, []);

  const handleOpenModal = () => {
    setTitle('');
    setDescription('');
    setAssignedTo(user?._id || '');
    setDueDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]); // 2 days from now
    setIsModalOpen(true);
  };

  const handleCreateChore = async (e) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo || !dueDate) {
      setError('Please provide chore title, assigned roommate, and due date.');
      return;
    }

    try {
      setError('');
      const res = await api.post('/chores', {
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        dueDate
      });

      if (res.success) {
        setSuccess('Chore added and assigned successfully!');
        fetchChores();
        setIsModalOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Error creating chore');
    }
  };

  const handleToggleStatus = async (choreId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      setError('');
      const res = await api.put(`/chores/${choreId}`, { status: newStatus });
      if (res.success) {
        setChores(chores.map((c) => (c._id === choreId ? res.chore : c)));
      }
    } catch (err) {
      setError(err.message || 'Failed to update chore status');
    }
  };

  const handleDeleteChore = async (choreId) => {
    if (window.confirm('Are you sure you want to delete this chore?')) {
      try {
        const res = await api.delete(`/chores/${choreId}`);
        if (res.success) {
          setChores(chores.filter((c) => c._id !== choreId));
          setSuccess('Chore removed.');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError(err.message || 'Failed to delete chore');
      }
    }
  };

  const pendingChores = chores.filter((c) => c.status === 'pending');
  const completedChores = chores.filter((c) => c.status === 'completed');

  if (loading) {
    return <Loading message="Loading household chores..." />;
  }

  return (
    <div className="chores-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Household Chores</h1>
          <p className="page-subtitle">Schedule, assign, and track shared cleaning duties.</p>
        </div>

        <button onClick={handleOpenModal} className="btn btn-primary">
          + Add New Chore
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="chores-board">
        {/* Pending Chores Column */}
        <div className="chore-column">
          <div className="chore-col-header">
            <h2 className="chore-col-title">
              <span>⏳ Pending</span>
              <span className="badge badge-warning">{pendingChores.length}</span>
            </h2>
          </div>

          {pendingChores.map((chore) => (
            <div key={chore._id} className="card chore-card">
              <div className="chore-card-header">
                <h3 className="chore-card-title">{chore.title}</h3>
                <span className="badge badge-warning">Due {new Date(chore.dueDate).toLocaleDateString()}</span>
              </div>

              {chore.description && (
                <p className="chore-card-desc">{chore.description}</p>
              )}

              <div className="chore-card-meta">
                <span>
                  Assigned to: <strong>{chore.assignedTo?.name}</strong> {chore.assignedTo?._id === user?._id && '(You)'}
                </span>

                <div className="chore-card-actions">
                  <button
                    onClick={() => handleToggleStatus(chore._id, chore.status)}
                    className="btn btn-sm btn-primary"
                  >
                    ✓ Complete
                  </button>
                  <button
                    onClick={() => handleDeleteChore(chore._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingChores.length === 0 && (
            <div className="card empty-state">
              <div className="empty-state-icon">✨</div>
              <h3>No pending chores</h3>
              <p>Everything is clean and organized!</p>
            </div>
          )}
        </div>

        {/* Completed Chores Column */}
        <div className="chore-column">
          <div className="chore-col-header">
            <h2 className="chore-col-title">
              <span>✅ Completed</span>
              <span className="badge badge-success">{completedChores.length}</span>
            </h2>
          </div>

          {completedChores.map((chore) => (
            <div key={chore._id} className="card chore-card completed">
              <div className="chore-card-header">
                <h3 className="chore-card-title">{chore.title}</h3>
                <span className="badge badge-success">Done</span>
              </div>

              {chore.description && (
                <p className="chore-card-desc">{chore.description}</p>
              )}

              <div className="chore-card-meta">
                <span>Completed by {chore.assignedTo?.name}</span>

                <div className="chore-card-actions">
                  <button
                    onClick={() => handleToggleStatus(chore._id, chore.status)}
                    className="btn btn-sm btn-outline"
                  >
                    Reopen
                  </button>
                  <button
                    onClick={() => handleDeleteChore(chore._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {completedChores.length === 0 && (
            <div className="card empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No completed chores yet</h3>
              <p>Complete tasks from the pending list to see them here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Chore Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Assign a Household Chore</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateChore}>
              <div className="form-group">
                <label className="form-label" htmlFor="choreTitle">Chore Title</label>
                <input
                  type="text"
                  id="choreTitle"
                  className="form-input"
                  placeholder="e.g. Deep clean kitchen, Take out recycling, Vacuum living room"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="choreDescription">Notes / Instructions (Optional)</label>
                <textarea
                  id="choreDescription"
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Please wipe down microwave and empty the crumb tray"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="choreAssigned">Assign To</label>
                  <select
                    id="choreAssigned"
                    className="form-select"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    required
                  >
                    {room?.members?.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} {m._id === user?._id && '(You)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="choreDueDate">Due Date</label>
                  <input
                    type="date"
                    id="choreDueDate"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
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
                  Assign Chore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chores;
