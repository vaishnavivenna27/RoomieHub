const Chore = require('../models/Chore');

// @desc    Add a new chore
// @route   POST /api/chores
// @access  Private
const createChore = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!req.user.roomId) {
      return res.status(400).json({ success: false, message: 'You must join or create a room first' });
    }

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide chore title, assigned roommate, and due date' });
    }

    const chore = await Chore.create({
      roomId: req.user.roomId,
      title: title.trim(),
      description: description ? description.trim() : '',
      assignedTo,
      dueDate: new Date(dueDate),
      status: 'pending'
    });

    const populatedChore = await Chore.findById(chore._id).populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Chore assigned successfully!',
      chore: populatedChore
    });
  } catch (error) {
    console.error('Create Chore Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating chore: ' + error.message });
  }
};

// @desc    Get all chores for the current room
// @route   GET /api/chores
// @access  Private
const getChores = async (req, res) => {
  try {
    if (!req.user.roomId) {
      return res.status(200).json({ success: true, chores: [] });
    }

    const chores = await Chore.find({ roomId: req.user.roomId })
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({
      success: true,
      count: chores.length,
      chores
    });
  } catch (error) {
    console.error('Get Chores Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving chores' });
  }
};

// @desc    Update chore (status toggle or details)
// @route   PUT /api/chores/:id
// @access  Private
const updateChore = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status } = req.body;
    const chore = await Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({ success: false, message: 'Chore not found' });
    }

    if (chore.roomId.toString() !== req.user.roomId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this chore' });
    }

    if (title) chore.title = title.trim();
    if (description !== undefined) chore.description = description.trim();
    if (assignedTo) chore.assignedTo = assignedTo;
    if (dueDate) chore.dueDate = new Date(dueDate);
    if (status) chore.status = status;

    const updatedChore = await chore.save();
    const populated = await Chore.findById(updatedChore._id).populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Chore updated successfully!',
      chore: populated
    });
  } catch (error) {
    console.error('Update Chore Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating chore' });
  }
};

// @desc    Delete a chore
// @route   DELETE /api/chores/:id
// @access  Private
const deleteChore = async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({ success: false, message: 'Chore not found' });
    }

    if (chore.roomId.toString() !== req.user.roomId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this chore' });
    }

    await Chore.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Chore deleted successfully'
    });
  } catch (error) {
    console.error('Delete Chore Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting chore' });
  }
};

module.exports = {
  createChore,
  getChores,
  updateChore,
  deleteChore
};
