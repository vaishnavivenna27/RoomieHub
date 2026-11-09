import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2C8CE',
        padding: '3rem 1.5rem 2rem',
        marginTop: 'auto'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}
      >

        {/* Brand */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.85rem'
            }}
          >
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#512031'
              }}
            >
              Roomie<span style={{ color: '#A65F73' }}>Hub</span>
            </span>
          </div>

          <p style={{ color: '#805C68', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Shared living, simplified. The all-in-one platform for roommates
            to split expenses, assign chores, and live in harmony.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#512031',
              marginBottom: '0.85rem'
            }}
          >
            Navigation
          </h4>

          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: '#805C68'
            }}
          >
            <li><Link to="/" style={{ color: 'inherit' }}>Home</Link></li>
            <li><Link to="/register" style={{ color: 'inherit' }}>Get Started</Link></li>
            <li><Link to="/login" style={{ color: 'inherit' }}>Log In</Link></li>
          </ul>
        </div>

        {/* Core Modules */}
        <div>
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#512031',
              marginBottom: '0.85rem'
            }}
          >
            Core Modules
          </h4>

          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: '#805C68'
            }}
          >
            <li>Smart Expense Splitting</li>
            <li>Payment Debt Tracking</li>
            <li>Chore Scheduling</li>
            <li>Shared Grocery Checklist</li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#512031',
              marginBottom: '0.85rem'
            }}
          >
            Capstone Project
          </h4>

          <p style={{ color: '#805C68', fontSize: '0.85rem', lineHeight: '1.6' }}>
            Built with React.js, Node.js, Express.js, MongoDB Atlas, and
            native Fetch API.
          </p>

          <div style={{ marginTop: '0.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                background: '#F1DDE2',
                color: '#702D42',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px'
              }}
            >
              MERN Stack
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1240px',
          margin: '2rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid #E2C8CE',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#805C68'
        }}
      >
        <p>&copy; {new Date().getFullYear()} RoomieHub. All rights reserved.</p>
        <p>Designed for peaceful and organized communal living.</p>
      </div>
    </footer>
  );
};

export default Footer;