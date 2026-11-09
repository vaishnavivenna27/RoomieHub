import React from 'react';

const StatCard = ({ title, value, subtitle, icon, badgeText, badgeColor = 'purple' }) => {
  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '1.4rem'
    }}>
      <div>
        <span style={{
          display: 'block',
          fontSize: '0.825rem',
          fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.35rem'
        }}>
          {title}
        </span>
        <div style={{
          fontSize: '1.85rem',
          fontWeight: '800',
          color: 'var(--text-main)',
          lineHeight: '1.2'
        }}>
          {value}
        </div>
        {subtitle && (
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-light)',
            marginTop: '0.35rem'
          }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem'
      }}>
        {icon && (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--secondary)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
        )}
        {badgeText && (
          <span className={`badge badge-${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
