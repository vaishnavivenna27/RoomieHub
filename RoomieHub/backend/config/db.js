const mongoose = require('mongoose');

// Connect to MongoDB Database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roomiehub');
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 TIP: If using MongoDB Atlas, check your MONGO_URI, database user, and Network IP Access in .env');
    console.log('💡 TIP: If running locally, make sure your local MongoDB server is active.');
  }
};

module.exports = connectDB;
