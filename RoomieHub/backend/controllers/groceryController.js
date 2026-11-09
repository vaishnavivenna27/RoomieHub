const Grocery = require('../models/Grocery');

// @desc    Add a new grocery item
// @route   POST /api/groceries
// @access  Private
const createGrocery = async (req, res) => {
  try {
    const { itemName, quantity, category } = req.body;

    if (!req.user.roomId) {
      return res.status(400).json({ success: false, message: 'You must join or create a room first' });
    }

    if (!itemName || itemName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide an item name' });
    }

    const grocery = await Grocery.create({
      roomId: req.user.roomId,
      itemName: itemName.trim(),
      quantity: quantity ? quantity.trim() : '1',
      category: category || 'General',
      addedBy: req.user._id,
      isPurchased: false
    });

    const populatedGrocery = await Grocery.findById(grocery._id).populate('addedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Grocery item added to list!',
      grocery: populatedGrocery
    });
  } catch (error) {
    console.error('Create Grocery Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding grocery item: ' + error.message });
  }
};

// @desc    Get all grocery items for the current room
// @route   GET /api/groceries
// @access  Private
const getGroceries = async (req, res) => {
  try {
    if (!req.user.roomId) {
      return res.status(200).json({ success: true, groceries: [] });
    }

    const groceries = await Grocery.find({ roomId: req.user.roomId })
      .populate('addedBy', 'name email')
      .sort({ isPurchased: 1, createdAt: -1 });

    res.json({
      success: true,
      count: groceries.length,
      groceries
    });
  } catch (error) {
    console.error('Get Groceries Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving grocery list' });
  }
};

// @desc    Update grocery item (toggle purchased or edit details)
// @route   PUT /api/groceries/:id
// @access  Private
const updateGrocery = async (req, res) => {
  try {
    const { itemName, quantity, category, isPurchased } = req.body;
    const grocery = await Grocery.findById(req.params.id);

    if (!grocery) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }

    if (grocery.roomId.toString() !== req.user.roomId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this grocery item' });
    }

    if (itemName) grocery.itemName = itemName.trim();
    if (quantity !== undefined) grocery.quantity = quantity.trim();
    if (category) grocery.category = category;
    if (typeof isPurchased === 'boolean') grocery.isPurchased = isPurchased;

    const updatedGrocery = await grocery.save();
    const populated = await Grocery.findById(updatedGrocery._id).populate('addedBy', 'name email');

    res.json({
      success: true,
      message: 'Grocery item updated successfully!',
      grocery: populated
    });
  } catch (error) {
    console.error('Update Grocery Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating grocery item' });
  }
};

// @desc    Delete a grocery item
// @route   DELETE /api/groceries/:id
// @access  Private
const deleteGrocery = async (req, res) => {
  try {
    const grocery = await Grocery.findById(req.params.id);

    if (!grocery) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }

    if (grocery.roomId.toString() !== req.user.roomId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this grocery item' });
    }

    await Grocery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Grocery item deleted from list'
    });
  } catch (error) {
    console.error('Delete Grocery Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting grocery item' });
  }
};

module.exports = {
  createGrocery,
  getGroceries,
  updateGrocery,
  deleteGrocery
};
