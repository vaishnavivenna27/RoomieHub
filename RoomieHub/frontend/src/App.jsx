import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

// Protected Pages
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import Expenses from './pages/Expenses';
import Payments from './pages/Payments';
import Chores from './pages/Chores';
import Groceries from './pages/Groceries';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Home /><Footer /></>} />
          <Route path="/register" element={<><Register /><Footer /></>} />
          <Route path="/login" element={<><Login /><Footer /></>} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />

          <Route
            path="/room"
            element={<ProtectedRoute><RoomManagement /></ProtectedRoute>}
          />

          <Route
            path="/expenses"
            element={<ProtectedRoute><Expenses /></ProtectedRoute>}
          />

          <Route
            path="/payments"
            element={<ProtectedRoute><Payments /></ProtectedRoute>}
          />

          <Route
            path="/chores"
            element={<ProtectedRoute><Chores /></ProtectedRoute>}
          />

          <Route
            path="/groceries"
            element={<ProtectedRoute><Groceries /></ProtectedRoute>}
          />

          <Route
            path="/announcements"
            element={<ProtectedRoute><Announcements /></ProtectedRoute>}
          />

          <Route
            path="/reports"
            element={<ProtectedRoute><Reports /></ProtectedRoute>}
          />

          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;