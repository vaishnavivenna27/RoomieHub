
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Smart Expense Splitting',
      description:
        'Log rent, utilities, and groceries. Split costs evenly across roommates without manual calculations.',
      icon: '💸'
    },
    {
      title: 'Payment & Debt Tracking',
      description:
        'Know who has paid, who owes money, and keep track of shared household payments.',
      icon: '💳'
    },
    {
      title: 'Household Chore Rotation',
      description:
        'Assign cleaning, trash, and kitchen duties with due dates to keep your home organized.',
      icon: '🧹'
    },
    {
      title: 'Shared Grocery Checklist',
      description:
        'Create shared shopping lists, add needed items, and mark groceries as purchased.',
      icon: '🛒'
    },
    {
      title: 'Room Notice Board',
      description:
        'Share important apartment rules, maintenance notices, and household updates.',
      icon: '📢'
    },
    {
      title: 'Monthly Spending Reports',
      description:
        'View monthly expenses and understand how household spending is distributed.',
      icon: '📊'
    }
  ];

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge badge-primary">
              ✨ The Ultimate Roommate App
            </span>
          </div>

          <h1 className="hero-title">
            Shared Living,{' '}
            <span className="hero-accent">Simplified.</span>
          </h1>

          <p className="hero-description">
            RoomieHub helps roommates coordinate rent, split bills,
            assign household chores, manage grocery shopping, and
            share important house notices in one place.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-lg btn-primary">
                Open Dashboard ➔
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-lg btn-primary">
                  Get Started Free
                </Link>

                <a href="#home-features" className="btn btn-lg btn-outline">
                  Explore Features
                </a>
              </>
            )}
          </div>

          <div className="hero-stats-bar">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Transparent Splitting</span>
            </div>

            <div className="stat-divider"></div>

            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Roommate Arguments</span>
            </div>

            <div className="stat-divider"></div>

            <div className="stat-item">
              <span className="stat-number">6+</span>
              <span className="stat-label">Integrated Tools</span>
            </div>
          </div>

        </div>
      </section>

      {/* Six Feature Cards */}
      <section className="features-section" id="home-features">

        <div className="section-header">
          <span className="section-eyebrow">OUR FEATURES</span>

          <h2 className="section-title">
            Everything You Need for a Peaceful Home
          </h2>

          <p className="section-subtitle">
            RoomieHub makes shared living easier by bringing all
            your household management tools together.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>

              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3 className="feature-card-title">
                {feature.title}
              </h3>

              <p className="feature-card-description">
                {feature.description}
              </p>

            </div>
          ))}
        </div>

      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-container">

          <h2 className="cta-title">
            Ready to Upgrade Your Living Experience?
          </h2>

          <p className="cta-desc">
            Create a room, invite your roommates with your room code,
            and start managing your home with ease.
          </p>

          <Link to="/register" className="btn btn-lg btn-primary">
            Join RoomieHub Today
          </Link>

        </div>
      </section>

    </div>
  );
};

export default Home;
