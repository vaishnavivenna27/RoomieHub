const express = require('express');
const router = express.Router();
const {
  getPayments,
  createPayment,
  updatePayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.route('/:id')
  .put(protect, updatePayment);

module.exports = router;
