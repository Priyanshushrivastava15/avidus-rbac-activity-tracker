const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/logController');
const { protect, adminOnly } = require('../middleware/auth');

// Activity logs endpoint - Admin Only
router.get('/', protect, adminOnly, getActivityLogs);

module.exports = router;
