const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  action: {
    type: String,
    required: true,
    enum: [
      'Login Success',
      'Login Failed',
      'Task Creation',
      'Task Update',
      'Task Deletion',
      'User Status Changed',
      'User Deleted'
    ]
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
