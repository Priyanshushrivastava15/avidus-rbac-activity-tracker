const ActivityLog = require('../models/ActivityLog');

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private (Admin Only)
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'name email role')
      .sort({ timestamp: -1 }); // newest logs first
    
    res.json(logs);
  } catch (error) {
    console.error('Fetch activity logs error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActivityLogs
};
