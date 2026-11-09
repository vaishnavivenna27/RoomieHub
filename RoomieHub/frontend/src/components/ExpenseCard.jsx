import React from 'react';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const formattedDate = expense.expenseDate
    ? new Date(expense.expenseDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  const splitCount = expense.participants?.length || 1;
  const perPerson = (expense.amount / splitCount).toFixed(2);

  // Category Icon helper
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Rent': return 'badge-purple';
      case 'Groceries': return 'badge-success';
      case 'Utilities': return 'badge-warning';
      default: return 'badge-purple';
    }
  };

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <span className={`badge ${getCategoryBadgeClass(expense.category)}`}>
            {expense.category || 'General'}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {expense.title}
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
            {formattedDate} • Paid by <strong>{expense.paidBy?.name || 'Roommate'}</strong>
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
            ${expense.amount.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ${perPerson} / person ({splitCount} split)
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Split with:</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            {expense.participants?.map(p => p.name).join(', ') || 'Room members'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="btn btn-sm btn-outline"
              title="Edit Expense"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense._id)}
              className="btn btn-sm btn-danger"
              title="Delete Expense"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
