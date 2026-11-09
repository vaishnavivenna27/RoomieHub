import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';

const Navbar = () => {
  const { user, room, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
                fill="#702D42"
              />
              <path d="M9 21V12H15V21H9Z" fill="#F8ECEE" />
            </svg>
          </div>

          <span className="navbar-brand-name">
            Roomie<span className="brand-accent">Hub</span>
          </span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>

        <nav className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>

          <Link
            to="/"
            className="nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <div className="navbar-user-actions">

              {room && (
                <div className="room-badge-indicator" title="Your Active Room">
                  <span className="room-dot"></span>
                  <span className="room-label">{room.roomName}</span>
                  <span className="room-code-tag">#{room.roomCode}</span>
                </div>
              )}

              <Link
                to="/dashboard"
                className="btn btn-sm btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <div className="user-profile-badge">
                <span className="user-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="user-name-text">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline"
              >
                Logout
              </button>

            </div>
          ) : (
            <div className="navbar-auth-actions">

              <Link
                to="/login"
                className="btn btn-sm btn-outline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="btn btn-sm btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>

            </div>
          )}

        </nav>
      </div>
    </header>
  );
};

export default Navbar;