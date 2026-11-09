import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import api from '../services/api';
import '../css/Dashboard.css';

const Dashboard = () => {
  const { user, room } = useAuth();

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({ totalOwedByMe: 0, totalOwedToMe: 0 });
  const [chores, setChores] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Only fetch if user has a room
        if (room || user?.roomId) {
          const [expRes, payRes, choreRes, annRes] = await Promise.all([
            api.get('/expenses').catch(() => ({ expenses: [] })),
            api.get('/payments').catch(() => ({ payments: [], summary: {} })),
            api.get('/chores').catch(() => ({ chores: [] })),
            api.get('/announcements').catch(() => ({ announcements: [] }))
          ]);

          setExpenses(expRes.expenses || []);
          setPayments(payRes.payments || []);
          setPaymentSummary(payRes.summary || { totalOwedByMe: 0, totalOwedToMe: 0 });
          setChores(choreRes.chores || []);
          setAnnouncements(annRes.announcements || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [room, user]);

  if (loading) {
    return <Loading message="Loading your roommate dashboard..." />;
  }

  // If user is not yet in a room
  if (!room && !user?.roomId) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome, {user?.name}! 👋</h1>
            <p className="page-subtitle">Let's get your apartment set up in RoomieHub.</p>
          </div>
        </div>

        <div className="card empty-state" style={{ maxWidth: '640px', margin: '2rem auto' }}>
          <div className="empty-state-icon">🏠</div>
          <h3>You haven't joined a room yet</h3>
          <p style={{ margin: '0.75rem 0 1.5rem', lineHeight: '1.6' }}>
            To split expenses, schedule chores, and track shopping lists, you need to either create a new room or join your roommates using their 6-digit room code.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/room" className="btn btn-primary">
              Create or Join Room ➔
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Metric Computations
  const totalRoommates = room?.members?.length || 1;
  const currentMonthExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const completedChores = chores.filter((c) => c.status === 'completed').length;
  const pendingChores = chores.filter((c) => c.status === 'pending');
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Dashboard – <span style={{ color: 'var(--primary)' }}>{room.roomName}</span>
          </h1>
          <p className="page-subtitle">
            Overview of your shared living expenses, chores, and notices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/expenses" className="btn btn-primary btn-sm">
            + Add Expense
          </Link>
          <Link to="/chores" className="btn btn-secondary btn-sm">
            + Add Chore
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Roommates"
          value={totalRoommates}
          subtitle={`Room Code: #${room.roomCode}`}
          badgeText="Active"
          badgeColor="purple"
          icon="👥"
        />
        <StatCard
          title="Total Expenses"
          value={`$${currentMonthExpenses.toFixed(2)}`}
          subtitle={`${expenses.length} total logged`}
          badgeText="Tracked"
          badgeColor="purple"
          icon="💵"
        />
        <StatCard
          title="You Owe"
          value={`$${(paymentSummary.totalOwedByMe || 0).toFixed(2)}`}
          subtitle={`Owed to you: $${(paymentSummary.totalOwedToMe || 0).toFixed(2)}`}
          badgeText={paymentSummary.totalOwedByMe > 0 ? "Pending" : "Settled"}
          badgeColor={paymentSummary.totalOwedByMe > 0 ? "warning" : "success"}
          icon="💳"
        />
        <StatCard
          title="Completed Chores"
          value={`${completedChores} / ${chores.length}`}
          subtitle={`${pendingChores.length} tasks pending`}
          badgeText={chores.length > 0 ? `${Math.round((completedChores / (chores.length || 1)) * 100)}% Done` : "No chores"}
          badgeColor={completedChores === chores.length && chores.length > 0 ? "success" : "purple"}
          icon="🧹"
        />
      </div>

      {/* Content Grid */}
      <div className="dashboard-sections-grid">
        {/* Recent Expenses */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Recent Expenses</h3>
            <Link to="/expenses" className="btn btn-sm btn-outline">View All</Link>
          </div>

          <div className="dash-list">
            {expenses.slice(0, 4).map((exp) => (
              <div key={exp._id} className="dash-list-item">
                <div className="dash-item-info">
                  <span className="dash-item-title">{exp.title}</span>
                  <span className="dash-item-subtitle">
                    Paid by {exp.paidBy?.name} • {new Date(exp.expenseDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="dash-item-amount">${exp.amount.toFixed(2)}</div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="no-data-hint">No expenses logged yet. Add your first shared bill!</p>
            )}
          </div>
        </div>

        {/* Pending Payments / Dues */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Upcoming Settlements</h3>
            <Link to="/payments" className="btn btn-sm btn-outline">Track Dues</Link>
          </div>

          <div className="dash-list">
            {pendingPayments.slice(0, 4).map((pay) => (
              <div key={pay._id} className="dash-list-item">
                <div className="dash-item-info">
                  <span className="dash-item-title">
                    {pay.userId?.name} owes {pay.expenseId?.paidBy?.name || 'roommate'}
                  </span>
                  <span className="dash-item-subtitle">
                    For: {pay.expenseId?.title || 'Shared Expense'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="dash-item-amount" style={{ color: 'var(--warning)' }}>
                    ${pay.amountDue.toFixed(2)}
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Pending</span>
                </div>
              </div>
            ))}
            {pendingPayments.length === 0 && (
              <p className="no-data-hint">All debts are currently settled! 🎉</p>
            )}
          </div>
        </div>

        {/* Pending Chores */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Pending Chores</h3>
            <Link to="/chores" className="btn btn-sm btn-outline">Chore Board</Link>
          </div>

          <div className="dash-list">
            {pendingChores.slice(0, 4).map((chore) => (
              <div key={chore._id} className="dash-list-item">
                <div className="dash-item-info">
                  <span className="dash-item-title">{chore.title}</span>
                  <span className="dash-item-subtitle">
                    Assigned to: <strong>{chore.assignedTo?.name}</strong> • Due: {new Date(chore.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <span className="badge badge-warning">Pending</span>
              </div>
            ))}
            {pendingChores.length === 0 && (
              <p className="no-data-hint">All assigned chores are finished! Clean home! 🌟</p>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Recent Announcements</h3>
            <Link to="/announcements" className="btn btn-sm btn-outline">Board</Link>
          </div>

          <div className="dash-list">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann._id} className="dash-list-item announcement-banner-card">
                <div className="dash-item-info">
                  <span className="dash-item-title">{ann.title}</span>
                  <span className="dash-item-subtitle" style={{ color: 'var(--text-muted)' }}>
                    {ann.description.length > 70 ? ann.description.substring(0, 70) + '...' : ann.description}
                  </span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                    By {ann.createdBy?.name} • {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="no-data-hint">No announcements posted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
