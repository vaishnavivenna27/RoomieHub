const express = require('express');
const router = express.Router();
const {
  createGrocery,
  getGroceries,
  updateGrocery,
  deleteGrocery
} = require('../controllers/groceryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createGrocery)
  .get(protect, getGroceries);

router.route('/:id')
  .put(protect, updateGrocery)
  .delete(protect, deleteGrocery);

module.exports = router;
