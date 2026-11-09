const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true
  },
  quantity: {
    type: String,
    default: '1',
    trim: true
  },
  category: {
    type: String,
    enum: ['Produce', 'Dairy', 'Snacks', 'Beverages', 'Pantry', 'Cleaning', 'Personal Care', 'General'],
    default: 'General'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPurchased: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Grocery', grocerySchema);
