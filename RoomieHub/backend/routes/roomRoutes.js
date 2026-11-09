const express = require('express');
const router = express.Router();
const {
  createRoom,
  joinRoom,
  getMyRoom
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

// All room routes are protected
router.post('/create', protect, createRoom);
router.post('/join', protect, joinRoom);
router.get('/my-room', protect, getMyRoom);

module.exports = router;
