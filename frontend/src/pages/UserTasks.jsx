import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Plus, Check, Trash2, Edit2, AlertCircle, 
  FolderKanban, Calendar, CheckCircle2, Clock, X 
} from 'lucide-react';

const UserTasks = () => {
  const { request, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTasks = async () => {
    try {
      const data = await request('/tasks');
      setTasks(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setSubmitting(true);
    try {
      if (editingTask) {
        // Edit flow
        const updated = await request(`/tasks/${editingTask._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: taskTitle,
            description: taskDesc
          })
        });
        setTasks(tasks.map(t => t._id === editingTask._id ? updated : t));
      } else {
        // Create flow
        const created = await request('/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: taskTitle,
            description: taskDesc
          })
        });
        setTasks([created, ...tasks]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      setTasks(tasks.map(t => t._id === task._id ? updated : t));
    } catch (err) {
      setError(err.message || 'Failed to toggle task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await request(`/tasks/${taskId}`, {
        method: 'DELETE'
      });
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'All') return true;
    return task.status === statusFilter;
  });

  const activeCount = tasks.filter(t => t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="app-container">
      {user && user.role === 'Admin' && <Sidebar />}
      
      <div className="main-layout">
        <Navbar title="My Personal Tasks" />
        
        <main className="main-content animate-fade-in">
          {error && (
            <div className="alert error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="analytics-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card glass-panel" style={{ padding: '16px 20px' }}>
              <div className="stat-info">
                <h3>Total Tasks</h3>
                <p style={{ fontSize: '24px' }}>{tasks.length}</p>
              </div>
              <div className="stat-icon-wrapper primary" style={{ width: '40px', height: '40px' }}>
                <FolderKanban size={18} />
              </div>
            </div>
            
            <div className="stat-card glass-panel" style={{ padding: '16px 20px' }}>
              <div className="stat-info">
                <h3>Pending</h3>
                <p style={{ fontSize: '24px', color: 'hsl(var(--warning))' }}>{activeCount}</p>
              </div>
              <div className="stat-icon-wrapper warning" style={{ width: '40px', height: '40px' }}>
                <Clock size={18} />
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ padding: '16px 20px' }}>
              <div className="stat-info">
                <h3>Completed</h3>
                <p style={{ fontSize: '24px', color: 'hsl(var(--success))' }}>{completedCount}</p>
              </div>
              <div className="stat-icon-wrapper success" style={{ width: '40px', height: '40px' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          <div className="task-section-header">
            {/* Filter controls */}
            <div className="filter-bar" style={{ margin: 0 }}>
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button onClick={handleOpenAddModal} className="glass-btn">
              <Plus size={16} />
              <span>Add New Task</span>
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{
                width: '36px', height: '36px',
                border: '3px solid rgba(255,255,255,0.05)',
                borderTop: '3px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-panel empty-state">
              <div className="empty-icon">
                <FolderKanban size={28} />
              </div>
              <h3 className="empty-title">No tasks found</h3>
              <p style={{ fontSize: '13px' }}>
                {statusFilter === 'All' 
                  ? 'Start by creating your very first task to track progress!' 
                  : `You don't have any tasks marked as "${statusFilter}".`
                }
              </p>
            </div>
          ) : (
            <div className="task-grid">
              {filteredTasks.map(task => (
                <div 
                  key={task._id} 
                  className={`glass-panel task-card ${task.status === 'Completed' ? 'completed' : 'pending'}`}
                >
                  <div className="task-card-header">
                    <span className={`task-card-title ${task.status === 'Completed' ? 'completed' : ''}`}>
                      {task.title}
                    </span>
                    <span className={`badge ${task.status === 'Completed' ? 'completed' : 'pending'}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="task-card-body">
                    {task.description || <em style={{ color: 'var(--text-dark)' }}>No description provided</em>}
                  </div>

                  <div className="task-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dark)' }}>
                      <Calendar size={12} />
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="task-card-actions">
                      <button 
                        onClick={() => handleToggleStatus(task)}
                        className="action-btn btn-complete"
                        title={task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(task)}
                        className="action-btn"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task._id)}
                        className="action-btn btn-delete"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Glassmorphic Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="What needs to be done?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea 
                  className="glass-input" 
                  rows={4}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                  placeholder="Provide further context..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="glass-btn btn-outline" 
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="glass-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasks;
