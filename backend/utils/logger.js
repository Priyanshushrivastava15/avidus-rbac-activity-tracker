const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details, req, email = '') => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    await ActivityLog.create({
      user: userId || null,
      email: email,
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

module.exports = logActivity;
