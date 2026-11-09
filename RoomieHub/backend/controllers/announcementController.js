const Announcement = require('../models/Announcement');

// @desc    Post a new announcement
// @route   POST /api/announcements
// @access  Private
const createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.user.roomId) {
      return res.status(400).json({ success: false, message: 'You must join or create a room first' });
    }

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide both title and description' });
    }

    const announcement = await Announcement.create({
      roomId: req.user.roomId,
      title: title.trim(),
      description: description.trim(),
      createdBy: req.user._id
    });

    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Announcement posted to room board!',
      announcement: populated
    });
  } catch (error) {
    console.error('Create Announcement Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error posting announcement: ' + error.message });
  }
};

// @desc    Get all announcements for current room
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    if (!req.user.roomId) {
      return res.status(200).json({ success: true, announcements: [] });
    }

    const announcements = await Announcement.find({ roomId: req.user.roomId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    console.error('Get Announcements Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving announcements' });
  }
};

// @desc    Update an announcement (Creator only)
// @route   PUT /api/announcements/:id
// @access  Private
const updateAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Authorization check: Only the user who created it can update
    if (announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can edit this announcement' });
    }

    if (title) announcement.title = title.trim();
    if (description) announcement.description = description.trim();

    const updated = await announcement.save();
    const populated = await Announcement.findById(updated._id).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: populated
    });
  } catch (error) {
    console.error('Update Announcement Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating announcement' });
  }
};

// @desc    Delete an announcement (Creator only)
// @route   DELETE /api/announcements/:id
// @access  Private
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Authorization check: Only the user who created it can delete
    if (announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete Announcement Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting announcement' });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
};
