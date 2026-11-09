import React from 'react';

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: fullScreen ? '0' : '3rem',
      minHeight: fullScreen ? '80vh' : 'auto',
      width: '100%',
      gap: '1rem'
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '3px solid #EDE7FF',
        borderTopColor: '#7654D6',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#6B687E'
      }}>
        {message}
      </p>

      {/* Simple inline keyframes for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
