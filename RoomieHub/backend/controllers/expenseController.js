const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const Room = require('../models/Room');

// @desc    Add a new expense & split automatically
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, paidBy, participants, expenseDate } = req.body;

    if (!req.user.roomId) {
      return res.status(400).json({ success: false, message: 'You must create or join a room first' });
    }

    if (!title || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid title and positive amount' });
    }

    const currentRoom = await Room.findById(req.user.roomId);
    if (!currentRoom) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Determine participants: if not provided or empty, split among all room members
    let splitMembers = participants && participants.length > 0 ? participants : currentRoom.members;

    const actualPayer = paidBy || req.user._id;

    // Create Expense document
    const expense = await Expense.create({
      roomId: req.user.roomId,
      title: title.trim(),
      amount: Number(amount),
      category: category || 'Other',
      paidBy: actualPayer,
      participants: splitMembers,
      expenseDate: expenseDate || new Date()
    });

    // Automatic Equal Split Calculation
    const splitCount = splitMembers.length;
    if (splitCount > 0) {
      const splitAmount = parseFloat((Number(amount) / splitCount).toFixed(2));

      // Create Payment records for all participants who did not pay upfront
      const paymentPromises = splitMembers
        .filter((memberId) => memberId.toString() !== actualPayer.toString())
        .map((memberId) =>
          Payment.create({
            roomId: req.user.roomId,
            expenseId: expense._id,
            userId: memberId,
            amountDue: splitAmount,
            amountPaid: 0,
            status: 'pending'
          })
        );

      await Promise.all(paymentPromises);
    }

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    res.status(201).json({
      success: true,
      message: 'Expense added and split successfully!',
      expense: populatedExpense
    });
  } catch (error) {
    console.error('Create Expense Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding expense: ' + error.message });
  }
};

// @desc    Get all expenses for the current room
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    if (!req.user.roomId) {
      return res.status(200).json({ success: true, expenses: [] });
    }

    const expenses = await Expense.find({ roomId: req.user.roomId })
      .populate('paidBy', 'name email')
      .populate('participants', 'name email')
      .sort({ expenseDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Get Expenses Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving expenses' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, expenseDate } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.roomId.toString() !== req.user.roomId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this expense' });
    }

    if (title) expense.title = title.trim();
    if (category) expense.category = category;
    if (expenseDate) expense.expenseDate = expenseDate;

    // If amount changed, update amount and recalculate pending payments
    if (amount && Number(amount) !== expense.amount) {
      expense.amount = Number(amount);
      const splitCount = expense.participants.length;
      if (splitCount > 0) {
        const newSplitAmount = parseFloat((Number(amount) / splitCount).toFixed(2));
        await Payment.updateMany(
          { expenseId: expense._id, status: 'pending' },
          { amountDue: newSplitAmount }
        );
      }
    }

    const updatedExpense = await expense.save();
    const populated = await Expense.findById(updatedExpense._id)
      .populate('paidBy', 'name email')
      .populate('participants', 'name email');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: populated
    });
  } catch (error) {
    console.error('Update Expense Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating expense' });
  }
};

// @desc    Delete an expense and its associated split records
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.roomId.toString() !== req.user.roomId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this expense' });
    }

    // Delete associated payments
    await Payment.deleteMany({ expenseId: expense._id });

    // Delete expense
    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense and associated split records removed successfully'
    });
  } catch (error) {
    console.error('Delete Expense Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};
