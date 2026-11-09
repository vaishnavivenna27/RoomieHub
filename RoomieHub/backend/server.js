const dns = require('dns');

// DNS workaround for the earlier SRV lookup issue
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'RoomieHub API is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/chores', require('./routes/choreRoutes'));
app.use('/api/groceries', require('./routes/groceryRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server only after database connection succeeds
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 RoomieHub Server running on http://localhost:${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('❌ Server startup failed because MongoDB could not connect.');
    process.exit(1);
  }
};

startServer();