const Task = require('../models/Task');
const logActivity = require('../utils/logger');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (User permissions)
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      user: req.user._id
    });

    await logActivity(req.user._id, 'Task Creation', `Created task: "${task.title}"`, req, req.user.email);

    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private (Admin views all, User views own)
const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'Admin') {
      // Admin API: view all tasks created by all users
      tasks = await Task.find({}).populate('user', 'name email status role');
    } else {
      // User API: view own tasks only
      tasks = await Task.find({ user: req.user._id });
    }

    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own task
// @route   PUT /api/tasks/:id
// @access  Private (User permission - can only update own tasks)
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership: Users can only update their own tasks. Admins cannot edit users' tasks unless requested, standard is User updates own.
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Capture old details for activity logging
    const changes = [];
    if (title && title !== task.title) changes.push(`title: "${task.title}" -> "${title}"`);
    if (status && status !== task.status) changes.push(`status: "${task.status}" -> "${status}"`);
    if (description && description !== task.description) changes.push(`description changed`);

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;

    const updatedTask = await task.save();

    const changeDetails = changes.length > 0 ? ` (${changes.join(', ')})` : '';
    await logActivity(req.user._id, 'Task Update', `Updated task: "${updatedTask.title}"${changeDetails}`, req, req.user.email);

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin can delete any, User can delete own)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Admin can delete any task. Users can only delete their own tasks.
    if (req.user.role !== 'Admin' && task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    await logActivity(
      req.user._id,
      'Task Deletion',
      `Deleted task: "${task.title}" (Deleted by ${req.user.role === 'Admin' ? 'Admin' : 'Owner'})`,
      req,
      req.user.email
    );

    res.json({ message: 'Task deleted successfully', taskId: req.params.id });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};
