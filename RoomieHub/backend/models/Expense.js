const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide the amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    enum: ['Rent', 'Groceries', 'Utilities', 'Internet', 'Food', 'Household', 'Entertainment', 'Other'],
    default: 'Other'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  expenseDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
