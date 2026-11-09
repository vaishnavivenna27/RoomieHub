const Payment = require('../models/Payment');
const Expense = require('../models/Expense');

// @desc    Get all payments and balance summary for current room
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    if (!req.user.roomId) {
      return res.status(200).json({
        success: true,
        summary: { totalOwedByMe: 0, totalOwedToMe: 0, totalSettled: 0 },
        payments: []
      });
    }

    // Fetch payments for current room with populated details
    const payments = await Payment.find({ roomId: req.user.roomId })
      .populate('userId', 'name email')
      .populate({
        path: 'expenseId',
        select: 'title amount category paidBy expenseDate',
        populate: {
          path: 'paidBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    // Calculate balance summary for the logged-in user
    let totalOwedByMe = 0;
    let totalOwedToMe = 0;
    let totalSettled = 0;

    payments.forEach((payment) => {
      const isOwedByMe = payment.userId?._id?.toString() === req.user._id.toString();
      const isOwedToMe = payment.expenseId?.paidBy?._id?.toString() === req.user._id.toString();

      if (payment.status === 'pending') {
        if (isOwedByMe) {
          totalOwedByMe += payment.amountDue;
        }
        if (isOwedToMe) {
          totalOwedToMe += payment.amountDue;
        }
      } else if (payment.status === 'paid') {
        if (isOwedByMe || isOwedToMe) {
          totalSettled += payment.amountPaid || payment.amountDue;
        }
      }
    });

    res.json({
      success: true,
      summary: {
        totalOwedByMe: parseFloat(totalOwedByMe.toFixed(2)),
        totalOwedToMe: parseFloat(totalOwedToMe.toFixed(2)),
        totalSettled: parseFloat(totalSettled.toFixed(2))
      },
      payments
    });
  } catch (error) {
    console.error('Get Payments Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving payment tracking data' });
  }
};

// @desc    Record or create a payment entry
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { expenseId, userId, amountDue, status } = req.body;

    if (!expenseId || !userId || !amountDue) {
      return res.status(400).json({ success: false, message: 'Please provide expenseId, userId, and amountDue' });
    }

    const payment = await Payment.create({
      roomId: req.user.roomId,
      expenseId,
      userId,
      amountDue: Number(amountDue),
      amountPaid: status === 'paid' ? Number(amountDue) : 0,
      status: status || 'pending',
      paymentDate: status === 'paid' ? new Date() : null
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Create Payment Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error recording payment' });
  }
};

// @desc    Update payment status (Mark as paid or toggle)
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res) => {
  try {
    const { status, amountPaid } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.roomId.toString() !== req.user.roomId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this payment' });
    }

    if (status) {
      payment.status = status;
      if (status === 'paid') {
        payment.amountPaid = amountPaid !== undefined ? Number(amountPaid) : payment.amountDue;
        payment.paymentDate = new Date();
      } else {
        payment.amountPaid = 0;
        payment.paymentDate = null;
      }
    }

    const updatedPayment = await payment.save();

    const populated = await Payment.findById(updatedPayment._id)
      .populate('userId', 'name email')
      .populate({
        path: 'expenseId',
        select: 'title amount category paidBy expenseDate',
        populate: {
          path: 'paidBy',
          select: 'name email'
        }
      });

    res.json({
      success: true,
      message: `Payment marked as ${payment.status}!`,
      payment: populated
    });
  } catch (error) {
    console.error('Update Payment Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating payment status' });
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePayment
};
