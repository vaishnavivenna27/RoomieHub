import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ExpenseCard from '../components/ExpenseCard';
import Loading from '../components/Loading';
import '../css/Expenses.css';

const Expenses = () => {
  const { user, room } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [paidBy, setPaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Filtering
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Rent', 'Groceries', 'Utilities', 'Internet', 'Food', 'Household', 'Entertainment', 'Other'];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses');
      if (res.success) {
        setExpenses(res.expenses || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingExpenseId(null);
    setTitle('');
    setAmount('');
    setCategory('Groceries');
    setPaidBy(user?._id || '');
    // Default select all roommates in current room
    const allMemberIds = room?.members?.map((m) => m._id) || [user?._id];
    setSelectedParticipants(allMemberIds);
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (expense) => {
    setEditingExpenseId(expense._id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setPaidBy(expense.paidBy?._id || expense.paidBy);
    setSelectedParticipants(expense.participants?.map((p) => p._id || p) || []);
    setExpenseDate(new Date(expense.expenseDate).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleToggleParticipant = (memberId) => {
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length > 1) {
        setSelectedParticipants(selectedParticipants.filter((id) => id !== memberId));
      }
    } else {
      setSelectedParticipants([...selectedParticipants, memberId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) {
      setError('Please provide a valid title and positive amount.');
      return;
    }

    try {
      setError('');
      if (editingExpenseId) {
        // Update
        const res = await api.put(`/expenses/${editingExpenseId}`, {
          title,
          amount: Number(amount),
          category,
          expenseDate
        });
        if (res.success) {
          setSuccess('Expense updated successfully!');
          fetchExpenses();
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await api.post('/expenses', {
          title,
          amount: Number(amount),
          category,
          paidBy: paidBy || user?._id,
          participants: selectedParticipants,
          expenseDate
        });
        if (res.success) {
          setSuccess('Expense added and split among roommates!');
          fetchExpenses();
          setIsModalOpen(false);
        }
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Error saving expense.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense and its split balances?')) {
      try {
        const res = await api.delete(`/expenses/${id}`);
        if (res.success) {
          setSuccess('Expense deleted successfully.');
          setExpenses(expenses.filter((e) => e._id !== id));
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError(err.message || 'Failed to delete expense.');
      }
    }
  };

  // Filtered List
  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <Loading message="Loading room expenses..." />;
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">Track, split, and log shared apartment costs equally.</p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          + Add New Expense
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Toolbar & Filters */}
      <div className="card expenses-toolbar">
        <div style={{ flex: '1', minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search expenses by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="expenses-filters">
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="expenses-grid">
        {filteredExpenses.map((expense) => (
          <ExpenseCard
            key={expense._id}
            expense={expense}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteExpense}
          />
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon">💸</div>
          <h3>No expenses found</h3>
          <p>Start by adding your rent, groceries, electricity, or internet bills!</p>
          <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            + Add First Expense
          </button>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingExpenseId ? 'Edit Expense' : 'Add New Shared Expense'}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="expenseTitle">Expense Title</label>
                <input
                  type="text"
                  id="expenseTitle"
                  className="form-input"
                  placeholder="e.g. Weekly Groceries, Wi-Fi Bill, Electricity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="expenseAmount">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    id="expenseAmount"
                    className="form-input"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="expenseCategory">Category</label>
                  <select
                    id="expenseCategory"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="expensePaidBy">Paid By</label>
                  <select
                    id="expensePaidBy"
                    className="form-select"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    disabled={!!editingExpenseId}
                  >
                    {room?.members?.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} {m._id === user?._id && '(You)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="expenseDate">Expense Date</label>
                  <input
                    type="date"
                    id="expenseDate"
                    className="form-input"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>

              {!editingExpenseId && (
                <div className="form-group">
                  <label className="form-label">
                    Split Equally Between ({selectedParticipants.length} selected):
                  </label>
                  <div className="participant-checkbox-group">
                    {room?.members?.map((member) => (
                      <label key={member._id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(member._id)}
                          onChange={() => handleToggleParticipant(member._id)}
                        />
                        <span>{member.name} {member._id === user?._id && '(You)'}</span>
                      </label>
                    ))}
                  </div>
                  {amount && selectedParticipants.length > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.35rem' }}>
                      ≈ ${(Number(amount) / selectedParticipants.length).toFixed(2)} per person
                    </span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExpenseId ? 'Save Changes' : 'Add & Split Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
