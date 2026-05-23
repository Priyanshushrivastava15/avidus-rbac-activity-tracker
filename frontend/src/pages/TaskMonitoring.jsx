import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Trash2, AlertCircle, Layers, Calendar, User, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

const TaskMonitoring = () => {
  const { request } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      const data = await request('/tasks');
      setTasks(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch global tasks directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const handleDeleteTask = async (taskId, taskTitle) => {
    try {
      const data = await request(`/tasks/${taskId}`, {
        method: 'DELETE'
      });
      setTasks(tasks.filter(t => t._id !== taskId));
      setSuccessMsg(`Successfully deleted task: "${taskTitle}"`);
      
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  // Filter tasks based on search terms and select values
  const filteredTasks = tasks.filter(task => {
    // 1. Status Filter
    if (statusFilter !== 'All' && task.status !== statusFilter) return false;

    // 2. Search Keyword (title, desc, creator name, creator email)
    const query = searchTerm.toLowerCase();
    const matchesTitle = task.title.toLowerCase().includes(query);
    const matchesDesc = (task.description || '').toLowerCase().includes(query);
    
    let matchesCreator = false;
    if (task.user) {
      matchesCreator = 
        task.user.name.toLowerCase().includes(query) || 
        task.user.email.toLowerCase().includes(query);
    }

    return matchesTitle || matchesDesc || matchesCreator;
  });

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Navbar title="Global Task Monitoring Console" />

        <main className="main-content animate-fade-in">
          {error && (
            <div className="alert error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert success">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="glass-panel table-card" style={{ paddingBottom: '16px' }}>
            <div className="table-header-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Workspace Task Directory ({tasks.length})</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Auditing all tasks logged by users. Admins can permanently delete any task below.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div className="filter-input-wrapper" style={{ width: '260px' }}>
                  <Search className="filter-icon" size={16} />
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Search title, details, owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Dropdown */}
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Completed">Completed Only</option>
                </select>

                {/* Refresh Trigger */}
                <button 
                  onClick={fetchAllTasks} 
                  className="glass-btn btn-outline" 
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  title="Refresh tasks"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div style={{
                  width: '36px', height: '36px',
                  border: '3px solid rgba(255,255,255,0.05)',
                  borderTop: '3px solid #a855f7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Layers size={28} />
                </div>
                <h4 className="empty-title">No tasks found matching query</h4>
                <p style={{ fontSize: '13px' }}>Try tweaking your keywords or filters.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Creator Name</th>
                      <th>Creation Date</th>
                      <th>Status Badge</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => (
                      <tr key={task._id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontWeight: 600 }}>{task.title}</span>
                            {task.description && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {task.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {task.user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={12} style={{ color: '#06b6d4' }} />
                              <span style={{ fontSize: '13px' }}>
                                {task.user.name}{' '}
                                <span style={{ fontSize: '10px', color: 'var(--text-dark)' }}>
                                  ({task.user.email})
                                </span>
                              </span>
                            </div>
                          ) : (
                            <em style={{ color: 'var(--text-danger)', fontSize: '13px' }}>Deactivated Account</em>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={12} />
                            <span>{new Date(task.createdAt).toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${task.status === 'Completed' ? 'completed' : 'pending'}`}>
                            {task.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteTask(task._id, task.title)}
                            className="action-btn btn-delete"
                            title="Admin Delete Task"
                            style={{ display: 'inline-flex' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskMonitoring;
