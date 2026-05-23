const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// All user management routes require login and Admin role
router.get('/', protect, adminOnly, getAllUsers);
router.patch('/:id/status', protect, adminOnly, updateUserStatus);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
