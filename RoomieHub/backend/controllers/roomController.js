const Room = require('../models/Room');
const User = require('../models/User');

// Helper to generate a random 6-character unique room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a new room
// @route   POST /api/rooms/create
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName || roomName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a valid room name' });
    }

    // Generate unique room code
    let roomCode = generateRoomCode();
    let codeExists = await Room.findOne({ roomCode });
    while (codeExists) {
      roomCode = generateRoomCode();
      codeExists = await Room.findOne({ roomCode });
    }

    // Create room with current user as creator and first member
    const room = await Room.create({
      roomName: roomName.trim(),
      roomCode,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    // Update user's roomId reference
    await User.findByIdAndUpdate(req.user._id, { roomId: room._id });

    // Populate creator and members
    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      success: true,
      message: 'Room created successfully!',
      room: populatedRoom
    });
  } catch (error) {
    console.error('Create Room Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating room: ' + error.message });
  }
};

// @desc    Join an existing room using room code
// @route   POST /api/rooms/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode || roomCode.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter a 6-digit room code' });
    }

    const cleanCode = roomCode.trim().toUpperCase();

    // Find room by code
    const room = await Room.findOne({ roomCode: cleanCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found. Please verify your room code.' });
    }

    // Check if user is already a member
    const isMember = room.members.some((memberId) => memberId.toString() === req.user._id.toString());
    if (!isMember) {
      room.members.push(req.user._id);
      await room.save();
    }

    // Update user's roomId
    await User.findByIdAndUpdate(req.user._id, { roomId: room._id });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json({
      success: true,
      message: 'Successfully joined the room!',
      room: populatedRoom
    });
  } catch (error) {
    console.error('Join Room Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error joining room: ' + error.message });
  }
};

// @desc    Get current user's room details
// @route   GET /api/rooms/my-room
// @access  Private
const getMyRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.roomId) {
      return res.status(200).json({ success: true, room: null, message: 'User does not belong to any room yet.' });
    }

    const room = await Room.findById(user.roomId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!room) {
      return res.status(200).json({ success: true, room: null, message: 'Room no longer exists.' });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Get Room Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving room details' });
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getMyRoom
};
