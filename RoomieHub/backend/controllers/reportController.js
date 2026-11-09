const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const Room = require('../models/Room');

// @desc    Get monthly and category-wise expense reports
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyExpenses = async (req, res) => {
  try {
    if (!req.user.roomId) {
      return res.status(200).json({
        success: true,
        monthlyTotals: [],
        categoryTotals: [],
        totalOverall: 0
      });
    }

    const expenses = await Expense.find({ roomId: req.user.roomId });

    // Category aggregation
    const categoryMap = {};
    // Month aggregation (e.g., 'Jan 2026', 'Feb 2026')
    const monthlyMap = {};
    let totalOverall = 0;

    expenses.forEach((expense) => {
      const amount = Number(expense.amount) || 0;
      totalOverall += amount;

      // Category breakdown
      const cat = expense.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + amount;

      // Monthly breakdown
      const date = new Date(expense.expenseDate || expense.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + amount;
    });

    // Format for charts
    const categoryTotals = Object.keys(categoryMap).map((category) => ({
      category,
      amount: parseFloat(categoryMap[category].toFixed(2)),
      percentage: totalOverall > 0 ? parseFloat(((categoryMap[category] / totalOverall) * 100).toFixed(1)) : 0
    }));

    const monthlyTotals = Object.keys(monthlyMap).map((month) => ({
      month,
      amount: parseFloat(monthlyMap[month].toFixed(2))
    }));

    res.json({
      success: true,
      totalOverall: parseFloat(totalOverall.toFixed(2)),
      categoryTotals,
      monthlyTotals
    });
  } catch (error) {
    console.error('Monthly Report Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating monthly report' });
  }
};

// @desc    Get roommate-wise expense contributions and debts
// @route   GET /api/reports/roommate-wise
// @access  Private
const getRoommateExpenses = async (req, res) => {
  try {
    if (!req.user.roomId) {
      return res.status(200).json({ success: true, roommateStats: [] });
    }

    const room = await Room.findById(req.user.roomId).populate('members', 'name email');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const expenses = await Expense.find({ roomId: req.user.roomId });
    const payments = await Payment.find({ roomId: req.user.roomId });

    // Compute stats per member
    const roommateStats = room.members.map((member) => {
      const memberIdStr = member._id.toString();

      // Total money this member paid upfront for expenses
      const totalPaidUpfront = expenses
        .filter((exp) => exp.paidBy.toString() === memberIdStr)
        .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

      // Total debt currently pending for this member
      const pendingDebt = payments
        .filter((pay) => pay.userId.toString() === memberIdStr && pay.status === 'pending')
        .reduce((sum, pay) => sum + (Number(pay.amountDue) || 0), 0);

      // Total settled by this member
      const settledDebt = payments
        .filter((pay) => pay.userId.toString() === memberIdStr && pay.status === 'paid')
        .reduce((sum, pay) => sum + (Number(pay.amountPaid) || pay.amountDue || 0), 0);

      return {
        userId: member._id,
        name: member.name,
        email: member.email,
        totalPaidUpfront: parseFloat(totalPaidUpfront.toFixed(2)),
        pendingDebt: parseFloat(pendingDebt.toFixed(2)),
        settledDebt: parseFloat(settledDebt.toFixed(2))
      };
    });

    res.json({
      success: true,
      roommateStats
    });
  } catch (error) {
    console.error('Roommate Report Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating roommate report' });
  }
};

module.exports = {
  getMonthlyExpenses,
  getRoommateExpenses
};
