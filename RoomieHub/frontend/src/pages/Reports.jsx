import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import '../css/Reports.css';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyReport, setMonthlyReport] = useState({
    totalOverall: 0,
    categoryTotals: [],
    monthlyTotals: []
  });
  const [roommateReport, setRoommateReport] = useState({ roommateStats: [] });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [mRes, rRes] = await Promise.all([
          api.get('/reports/monthly'),
          api.get('/reports/roommate-wise')
        ]);

        if (mRes.success) setMonthlyReport(mRes);
        if (rRes.success) setRoommateReport(rRes);
      } catch (err) {
        setError(err.message || 'Failed to load report analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <Loading message="Generating financial reports..." />;
  }

  // Pre-defined color palette for categories
  const categoryColors = {
    Rent: '#7654D6',
    Groceries: '#10B981',
    Utilities: '#F59E0B',
    Internet: '#3B82F6',
    Food: '#EC4899',
    Household: '#8B5CF6',
    Entertainment: '#F97316',
    Other: '#6B7280'
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Analytics & Reports</h1>
          <p className="page-subtitle">Visual breakdown of your room's spending patterns and roommate contributions.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Room Expenses"
          value={`$${monthlyReport.totalOverall.toFixed(2)}`}
          subtitle="All recorded spending"
          badgeText="Cumulative"
          badgeColor="purple"
          icon="📊"
        />
        <StatCard
          title="Active Categories"
          value={monthlyReport.categoryTotals.length}
          subtitle="Different spending types"
          badgeText="Diverse"
          badgeColor="success"
          icon="🏷️"
        />
        <StatCard
          title="Roommate Contributors"
          value={roommateReport.roommateStats.length}
          subtitle="Members sharing expenses"
          badgeText="Active"
          badgeColor="purple"
          icon="👥"
        />
      </div>

      <div className="reports-grid">
        {/* Category Breakdown */}
        <div className="card report-card">
          <h2 className="report-card-title">Category-wise Spending</h2>

          {monthlyReport.categoryTotals.length > 0 ? (
            <div className="category-bars-list">
              {monthlyReport.categoryTotals.map((cat) => {
                const barColor = categoryColors[cat.category] || 'var(--primary)';
                return (
                  <div key={cat.category} className="bar-item">
                    <div className="bar-item-header">
                      <span>{cat.category}</span>
                      <span>
                        ${cat.amount.toFixed(2)}{' '}
                        <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
                          ({cat.percentage}%)
                        </span>
                      </span>
                    </div>

                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: barColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-data-hint">No category expense records available yet.</p>
          )}
        </div>

        {/* Roommate Breakdown */}
        <div className="card report-card">
          <h2 className="report-card-title">Roommate Expense Contributions</h2>

          {roommateReport.roommateStats.length > 0 ? (
            <div className="roommate-stats-list">
              {roommateReport.roommateStats.map((stat) => (
                <div key={stat.userId} className="roommate-stat-row">
                  <div>
                    <div className="roommate-stat-name">{stat.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      Pending Debt: ${stat.pendingDebt.toFixed(2)}
                    </div>
                  </div>

                  <div className="roommate-stat-numbers">
                    <div className="stat-paid-amount">${stat.totalPaidUpfront.toFixed(2)}</div>
                    <span>paid upfront</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-hint">No roommate breakdown available yet.</p>
          )}
        </div>
      </div>

      {/* Monthly Timeline List */}
      <div className="card report-card">
        <h2 className="report-card-title">Monthly Spending Summary</h2>

        {monthlyReport.monthlyTotals.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {monthlyReport.monthlyTotals.map((item) => (
              <div
                key={item.month}
                style={{
                  background: 'var(--bg-light)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {item.month}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.35rem' }}>
                  ${item.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-hint">No monthly summaries generated yet.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
