import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import '../css/Payments.css';

const Payments = () => {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalOwedByMe: 0, totalOwedToMe: 0, totalSettled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'owe', 'owed'

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      if (res.success) {
        setPayments(res.payments || []);
        setSummary(res.summary || { totalOwedByMe: 0, totalOwedToMe: 0, totalSettled: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleTogglePaymentStatus = async (paymentId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      setError('');
      const res = await api.put(`/payments/${paymentId}`, { status: newStatus });
      if (res.success) {
        setSuccess(`Payment updated to ${newStatus}!`);
        fetchPayments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    }
  };

  const filteredPayments = payments.filter((pay) => {
    const isDebtor = pay.userId?._id?.toString() === user?._id?.toString();
    const isCreditor = pay.expenseId?.paidBy?._id?.toString() === user?._id?.toString();

    if (filterTab === 'owe') return isDebtor;
    if (filterTab === 'owed') return isCreditor;
    return true;
  });

  if (loading) {
    return <Loading message="Loading payment balances..." />;
  }

  return (
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Tracking & Settlements</h1>
          <p className="page-subtitle">Track shared balances, see who owes who, and settle debts.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* 3 Summary Cards */}
      <div className="stats-grid">
        <StatCard
          title="Amount You Owe"
          value={`$${summary.totalOwedByMe.toFixed(2)}`}
          subtitle="Pending split bills to pay"
          badgeText={summary.totalOwedByMe > 0 ? "You Owe" : "All Clear"}
          badgeColor={summary.totalOwedByMe > 0 ? "warning" : "success"}
          icon="📤"
        />
        <StatCard
          title="Owed to You"
          value={`$${summary.totalOwedToMe.toFixed(2)}`}
          subtitle="Money roommates owe you"
          badgeText={summary.totalOwedToMe > 0 ? "Pending" : "None"}
          badgeColor={summary.totalOwedToMe > 0 ? "purple" : "secondary"}
          icon="📥"
        />
        <StatCard
          title="Total Settled"
          value={`$${summary.totalSettled.toFixed(2)}`}
          subtitle="All completed settlements"
          badgeText="Settled"
          badgeColor="success"
          icon="✅"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('all')}
        >
          All Payments ({payments.length})
        </button>
        <button
          className={`btn btn-sm ${filterTab === 'owe' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('owe')}
        >
          What I Owe
        </button>
        <button
          className={`btn btn-sm ${filterTab === 'owed' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('owed')}
        >
          Owed to Me
        </button>
      </div>

      {/* Payment Table */}
      <div className="card payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Expense</th>
              <th>Debtor (Who Owes)</th>
              <th>Creditor (Who Paid)</th>
              <th>Amount Due</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => {
              const isDebtor = p.userId?._id?.toString() === user?._id?.toString();
              const isCreditor = p.expenseId?.paidBy?._id?.toString() === user?._id?.toString();

              return (
                <tr key={p._id}>
                  <td>
                    <strong>{p.expenseId?.title || 'Shared Expense'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {p.expenseId?.category}
                    </div>
                  </td>
                  <td>
                    {p.userId?.name} {isDebtor && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>You</span>}
                  </td>
                  <td>
                    <span className="payee-tag">
                      {p.expenseId?.paidBy?.name || 'Roommate'}
                    </span>{' '}
                    {isCreditor && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>You</span>}
                  </td>
                  <td>
                    <span className="amount-due-highlight">${p.amountDue.toFixed(2)}</span>
                  </td>
                  <td>
                    {p.status === 'paid' ? (
                      <span className="badge badge-success">✓ Paid</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    {p.paymentDate
                      ? new Date(p.paymentDate).toLocaleDateString()
                      : new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePaymentStatus(p._id, p.status)}
                      className={`btn btn-sm ${p.status === 'paid' ? 'btn-outline' : 'btn-primary'}`}
                    >
                      {p.status === 'paid' ? 'Mark Pending' : 'Mark as Paid'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="empty-state" style={{ border: 'none' }}>
            <div className="empty-state-icon">💳</div>
            <h3>No payments found in this view</h3>
            <p>Add expenses in the Expense Management section to create equal split payments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
