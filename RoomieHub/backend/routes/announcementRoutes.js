const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createAnnouncement)
  .get(protect, getAnnouncements);

router.route('/:id')
  .put(protect, updateAnnouncement)
  .delete(protect, deleteAnnouncement);

module.exports = router;
