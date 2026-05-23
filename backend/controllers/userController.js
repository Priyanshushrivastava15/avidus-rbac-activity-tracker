const User = require('../models/User');
const Task = require('../models/Task');
const logActivity = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status (Active/Inactive)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin Only)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Active or Inactive' });
    }

    // Prevent Admin from disabling themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Operation not permitted. You cannot set your own account status to inactive.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    await logActivity(
      req.user._id,
      'User Status Changed',
      `Changed user ${user.email} status from "${oldStatus}" to "${status}"`,
      req,
      req.user.email
    );

    res.json({
      message: `User status successfully updated to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    // Prevent Admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Operation not permitted. You cannot delete your own account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all tasks associated with this user
    const tasksDeleted = await Task.deleteMany({ user: user._id });

    await user.deleteOne();

    await logActivity(
      req.user._id,
      'User Deleted',
      `Deleted user account: ${user.email} and cleared ${tasksDeleted.deletedCount} tasks`,
      req,
      req.user.email
    );

    res.json({ message: 'User and associated tasks successfully deleted', userId: req.params.id });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser
};
