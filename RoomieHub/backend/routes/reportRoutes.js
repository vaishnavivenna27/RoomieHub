const express = require('express');
const router = express.Router();
const {
  getMonthlyExpenses,
  getRoommateExpenses
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/monthly', protect, getMonthlyExpenses);
router.get('/roommate-wise', protect, getRoommateExpenses);

module.exports = router;
